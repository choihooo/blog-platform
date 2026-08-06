import { createSign } from "node:crypto";
import { readFile } from "node:fs/promises";

import {
  emptySitePerformanceSummary,
  normalizeSitePerformanceSummary,
  publicationWindowState,
  type AnalyticsProviderRequest,
  type AnalyticsProviderResult,
  type PostPerformance,
  type PublicationPerformanceWindow,
} from "@blog-platform/analytics";

type FetchLike = (input: string | URL, init?: RequestInit) => Promise<Response>;

export type GoogleAnalyticsProviderConfig = {
  ga4PropertyId?: string;
  searchConsoleProperty?: string;
  serviceAccountJson?: string;
  serviceAccountKeyFile?: string;
  mockMode?: boolean;
  fetchImpl?: FetchLike;
};

type GoogleServiceAccount = {
  client_email: string;
  private_key: string;
  token_uri?: string;
};

type GoogleTokenResponse = {
  access_token?: string;
  expires_in?: number;
  token_type?: string;
  error?: string;
  error_description?: string;
};

type Ga4RunReportResponse = {
  rows?: Array<{
    dimensionValues?: Array<{ value?: string }>;
    metricValues?: Array<{ value?: string }>;
  }>;
};

type GscSearchAnalyticsResponse = {
  rows?: Array<{
    keys?: string[];
    clicks?: number;
    impressions?: number;
    ctr?: number;
    position?: number;
  }>;
};

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function googleAnalyticsProviderConfigFromEnv(
  env: NodeJS.ProcessEnv = process.env,
): GoogleAnalyticsProviderConfig {
  return {
    ga4PropertyId: clean(env.GA4_PROPERTY_ID) || clean(env.NEXT_PUBLIC_GA_MEASUREMENT_ID),
    searchConsoleProperty: clean(env.SEARCH_CONSOLE_PROPERTY),
    serviceAccountJson: clean(env.GOOGLE_SERVICE_ACCOUNT_JSON),
    serviceAccountKeyFile: clean(env.GOOGLE_APPLICATION_CREDENTIALS),
    mockMode: clean(env.ANALYTICS_DASHBOARD_MOCK) === "1",
  };
}

export function analyticsProviderMissingConfig(config: GoogleAnalyticsProviderConfig) {
  const missing: string[] = [];
  if (!clean(config.ga4PropertyId)) missing.push("GA4_PROPERTY_ID");
  if (!clean(config.searchConsoleProperty)) missing.push("SEARCH_CONSOLE_PROPERTY");
  if (
    !config.mockMode &&
    !clean(config.serviceAccountJson) &&
    !clean(config.serviceAccountKeyFile)
  ) {
    missing.push("GOOGLE_SERVICE_ACCOUNT_JSON or GOOGLE_APPLICATION_CREDENTIALS");
  }
  return missing;
}

export function mapGoogleProviderError(
  error: unknown,
): Exclude<AnalyticsProviderResult, { ok: true }> {
  const message = error instanceof Error ? error.message : String(error);
  const lower = message.toLowerCase();
  if (lower.includes("permission") || lower.includes("unauthorized") || lower.includes("403")) {
    return { ok: false, code: "unauthorized", retryable: false, message };
  }
  if (lower.includes("quota") || lower.includes("rate") || lower.includes("429")) {
    return { ok: false, code: "quota-limited", retryable: true, message };
  }
  if (lower.includes("timeout") || lower.includes("network") || lower.includes("5")) {
    return { ok: false, code: "temporary-failure", retryable: true, message };
  }
  return { ok: false, code: "unknown", retryable: false, message };
}

function base64Url(input: Buffer | string) {
  return Buffer.from(input).toString("base64url");
}

async function loadServiceAccount(config: GoogleAnalyticsProviderConfig) {
  const serviceAccountJson = clean(config.serviceAccountJson);
  const raw = serviceAccountJson
    ? serviceAccountJson
    : await readFile(clean(config.serviceAccountKeyFile), "utf8");
  const account = JSON.parse(raw) as Partial<GoogleServiceAccount>;
  const clientEmail = clean(account.client_email);
  const privateKey = clean(account.private_key);
  if (!clientEmail || !privateKey) {
    throw new Error("Google service account credential is missing client_email or private_key.");
  }
  return {
    client_email: clientEmail,
    private_key: privateKey,
    token_uri: clean(account.token_uri) || "https://oauth2.googleapis.com/token",
  } satisfies GoogleServiceAccount;
}

function createServiceAccountJwt(
  account: GoogleServiceAccount,
  scopes: string[],
  now = new Date(),
) {
  const issuedAt = Math.floor(now.getTime() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const claim = {
    iss: account.client_email,
    scope: scopes.join(" "),
    aud: account.token_uri ?? "https://oauth2.googleapis.com/token",
    iat: issuedAt,
    exp: issuedAt + 3600,
  };
  const unsigned = `${base64Url(JSON.stringify(header))}.${base64Url(JSON.stringify(claim))}`;
  const signature = createSign("RSA-SHA256").update(unsigned).sign(account.private_key);
  return `${unsigned}.${base64Url(signature)}`;
}

async function requestAccessToken(account: GoogleServiceAccount, fetchImpl: FetchLike) {
  const assertion = createServiceAccountJwt(account, [
    "https://www.googleapis.com/auth/analytics.readonly",
    "https://www.googleapis.com/auth/webmasters.readonly",
  ]);
  const body = new URLSearchParams({
    grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
    assertion,
  });
  const response = await fetchImpl(account.token_uri ?? "https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
  });
  const payload = (await response.json()) as GoogleTokenResponse;
  if (!response.ok || !payload.access_token) {
    throw new Error(
      `Google token request failed ${response.status}: ${
        payload.error_description ?? payload.error ?? "unknown error"
      }`,
    );
  }
  return payload.access_token;
}

async function requestGoogleJson<T>(
  fetchImpl: FetchLike,
  url: string,
  token: string,
  body: Record<string, unknown>,
): Promise<T> {
  const response = await fetchImpl(url, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const text = await response.text();
  const payload = text ? (JSON.parse(text) as unknown) : {};
  if (!response.ok) {
    const message =
      typeof payload === "object" && payload && "error" in payload
        ? JSON.stringify((payload as { error: unknown }).error)
        : text;
    throw new Error(`Google API request failed ${response.status}: ${message}`);
  }
  return payload as T;
}

function cleanPath(value: string) {
  try {
    const url = new URL(value);
    return url.pathname.replace(/\/+$/, "") || "/";
  } catch {
    return value.replace(/\/+$/, "") || "/";
  }
}

function cleanUrl(value: string) {
  try {
    const url = new URL(value);
    url.hash = "";
    url.search = "";
    return url.toString().replace(/\/+$/, "");
  } catch {
    return value.replace(/\/+$/, "");
  }
}

function numberValue(value: string | number | undefined) {
  const number = Number(value ?? 0);
  return Number.isFinite(number) ? number : 0;
}

function parseApiDate(value: string | undefined) {
  if (!value) return "";
  if (/^\d{8}$/.test(value)) {
    return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
  }
  return value.slice(0, 10);
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

async function fetchGa4Report(input: {
  request: AnalyticsProviderRequest;
  propertyId: string;
  token: string;
  fetchImpl: FetchLike;
  previous?: boolean;
  dimensions?: string[];
}) {
  const range = input.request.dateRange;
  const startDate = input.previous ? range.previousStartDate : range.startDate;
  const endDate = input.previous ? range.previousEndDate : range.endDate;
  if (!startDate || !endDate) return { rows: [] } satisfies Ga4RunReportResponse;
  return requestGoogleJson<Ga4RunReportResponse>(
    input.fetchImpl,
    `https://analyticsdata.googleapis.com/v1beta/properties/${encodeURIComponent(
      input.propertyId,
    )}:runReport`,
    input.token,
    {
      dateRanges: [{ startDate, endDate }],
      dimensions: (input.dimensions ?? []).map((name) => ({ name })),
      metrics: [{ name: "screenPageViews" }, { name: "activeUsers" }],
      limit: "250",
    },
  );
}

async function fetchGscReport(input: {
  request: AnalyticsProviderRequest;
  property: string;
  token: string;
  fetchImpl: FetchLike;
  previous?: boolean;
  dimensions?: string[];
}) {
  const range = input.request.dateRange;
  const startDate = input.previous ? range.previousStartDate : range.startDate;
  const endDate = input.previous ? range.previousEndDate : range.endDate;
  if (!startDate || !endDate) return { rows: [] } satisfies GscSearchAnalyticsResponse;
  return requestGoogleJson<GscSearchAnalyticsResponse>(
    input.fetchImpl,
    `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(
      input.property,
    )}/searchAnalytics/query`,
    input.token,
    {
      startDate,
      endDate,
      dimensions: input.dimensions ?? [],
      rowLimit: 250,
    },
  );
}

function summarizeGa4(response: Ga4RunReportResponse) {
  const first = response.rows?.[0];
  return {
    pageViews: numberValue(first?.metricValues?.[0]?.value),
    activeUsers: numberValue(first?.metricValues?.[1]?.value),
  };
}

function summarizeGsc(response: GscSearchAnalyticsResponse) {
  const first = response.rows?.[0];
  return {
    searchClicks: numberValue(first?.clicks),
    searchImpressions: numberValue(first?.impressions),
    searchCtr: numberValue(first?.ctr),
    averagePosition: numberValue(first?.position),
  };
}

function normalizeLivePostPerformance(input: {
  request: AnalyticsProviderRequest;
  ga4Pages: Ga4RunReportResponse;
  gscPages: GscSearchAnalyticsResponse;
  gscQueries: GscSearchAnalyticsResponse;
}) {
  const ga4ByPath = new Map<string, { pageViews: number; activeUsers: number }>();
  for (const row of input.ga4Pages.rows ?? []) {
    const path = cleanPath(row.dimensionValues?.[0]?.value ?? "");
    if (!path) continue;
    ga4ByPath.set(path, {
      pageViews: numberValue(row.metricValues?.[0]?.value),
      activeUsers: numberValue(row.metricValues?.[1]?.value),
    });
  }

  const gscByUrl = new Map<
    string,
    { searchClicks: number; searchImpressions: number; searchCtr: number; averagePosition: number }
  >();
  for (const row of input.gscPages.rows ?? []) {
    const url = cleanUrl(row.keys?.[0] ?? "");
    if (!url) continue;
    gscByUrl.set(url, {
      searchClicks: numberValue(row.clicks),
      searchImpressions: numberValue(row.impressions),
      searchCtr: numberValue(row.ctr),
      averagePosition: numberValue(row.position),
    });
  }

  const queriesByUrl = new Map<PostPerformance["canonicalUrl"], PostPerformance["topQueries"]>();
  for (const row of input.gscQueries.rows ?? []) {
    const url = cleanUrl(row.keys?.[0] ?? "");
    const query = row.keys?.[1]?.trim();
    if (!url || !query) continue;
    queriesByUrl.set(url, [
      ...(queriesByUrl.get(url) ?? []),
      {
        query,
        clicks: numberValue(row.clicks),
        impressions: numberValue(row.impressions),
        ctr: numberValue(row.ctr),
        averagePosition: numberValue(row.position),
      },
    ]);
  }

  return input.request.posts.map((post) => {
    const ga4 = ga4ByPath.get(cleanPath(post.canonicalUrl));
    const gsc = gscByUrl.get(cleanUrl(post.canonicalUrl));
    const matchState = ga4 && gsc ? "matched" : ga4 || gsc ? "partial" : "unmatched";
    return {
      postId: post.id,
      title: post.title,
      slug: post.slug,
      canonicalUrl: post.canonicalUrl,
      status: post.status,
      publishedAt: post.publishedAt,
      category: post.category,
      tags: post.tags ?? [],
      pageViews: ga4?.pageViews ?? 0,
      activeUsers: ga4?.activeUsers ?? 0,
      searchClicks: gsc?.searchClicks ?? 0,
      searchImpressions: gsc?.searchImpressions ?? 0,
      searchCtr: gsc?.searchCtr ?? 0,
      averagePosition: gsc?.averagePosition ?? 0,
      matchState,
      topQueries: (queriesByUrl.get(cleanUrl(post.canonicalUrl)) ?? [])
        .sort((left, right) => right.clicks - left.clicks || right.impressions - left.impressions)
        .slice(0, 5),
    } satisfies PostPerformance;
  });
}

function normalizePublicationWindows(input: {
  request: AnalyticsProviderRequest;
  availableThrough: string;
  ga4DailyPages: Ga4RunReportResponse;
  gscDailyPages: GscSearchAnalyticsResponse;
}): PublicationPerformanceWindow[] {
  const ga4ByDatePath = new Map<string, { pageViews: number; activeUsers: number }>();
  for (const row of input.ga4DailyPages.rows ?? []) {
    const date = parseApiDate(row.dimensionValues?.[0]?.value);
    const path = cleanPath(row.dimensionValues?.[1]?.value ?? "");
    if (!date || !path) continue;
    ga4ByDatePath.set(`${date}|${path}`, {
      pageViews: numberValue(row.metricValues?.[0]?.value),
      activeUsers: numberValue(row.metricValues?.[1]?.value),
    });
  }

  const gscByDateUrl = new Map<string, { searchClicks: number; searchImpressions: number }>();
  for (const row of input.gscDailyPages.rows ?? []) {
    const date = parseApiDate(row.keys?.[0]);
    const url = cleanUrl(row.keys?.[1] ?? "");
    if (!date || !url) continue;
    gscByDateUrl.set(`${date}|${url}`, {
      searchClicks: numberValue(row.clicks),
      searchImpressions: numberValue(row.impressions),
    });
  }

  const windows: PublicationPerformanceWindow[] = input.request.posts.flatMap((post) => {
    const published = post.publishedAt ? new Date(post.publishedAt) : undefined;
    const path = cleanPath(post.canonicalUrl);
    const url = cleanUrl(post.canonicalUrl);

    return ([1, 7, 28] as const).map((windowDays) => {
      const state = publicationWindowState({
        publishedAt: post.publishedAt,
        availableThrough: input.availableThrough,
        windowDays,
        sampleSize: 1,
      });
      let pageViews = 0;
      let activeUsers = 0;
      let searchClicks = 0;
      let searchImpressions = 0;

      if (published && state !== "pending") {
        for (let offset = 0; offset < windowDays; offset += 1) {
          const currentDate = dateKey(addDays(published, offset));
          const ga4 = ga4ByDatePath.get(`${currentDate}|${path}`);
          const gsc = gscByDateUrl.get(`${currentDate}|${url}`);
          pageViews += ga4?.pageViews ?? 0;
          activeUsers += ga4?.activeUsers ?? 0;
          searchClicks += gsc?.searchClicks ?? 0;
          searchImpressions += gsc?.searchImpressions ?? 0;
        }
      }

      const sampleSize = pageViews + searchClicks + searchImpressions;
      return {
        postId: post.id,
        window: `${windowDays}d`,
        state: state === "complete" && sampleSize === 0 ? "insufficient-data" : state,
        pageViews,
        activeUsers,
        searchClicks,
        searchImpressions,
        needsReview: false,
      } satisfies PublicationPerformanceWindow;
    });
  });

  for (const window of ["1d", "7d", "28d"] as const) {
    const complete = windows.filter((item) => item.window === window && item.state === "complete");
    const scores = complete
      .map((item) => item.pageViews + item.searchClicks)
      .sort((left, right) => left - right);
    const median = scores.length ? scores[Math.floor(scores.length / 2)] : 0;
    if (!median) continue;
    for (const item of complete) {
      item.needsReview = item.pageViews + item.searchClicks < median * 0.5;
    }
  }

  return windows;
}

function mockPublicationWindows(
  postPerformance: PostPerformance[],
  availableThrough: string,
): PublicationPerformanceWindow[] {
  return postPerformance.flatMap((post) =>
    ([1, 7, 28] as const).map((windowDays) => {
      const state = publicationWindowState({
        publishedAt: post.publishedAt,
        availableThrough,
        windowDays,
        sampleSize: post.pageViews + post.searchClicks + post.searchImpressions,
      });
      const ratio = windowDays === 1 ? 0.18 : windowDays === 7 ? 0.55 : 1;
      return {
        postId: post.postId,
        window: `${windowDays}d`,
        state,
        pageViews: state === "pending" ? 0 : Math.round(post.pageViews * ratio),
        activeUsers: state === "pending" ? 0 : Math.round(post.activeUsers * ratio),
        searchClicks: state === "pending" ? 0 : Math.round(post.searchClicks * ratio),
        searchImpressions: state === "pending" ? 0 : Math.round(post.searchImpressions * ratio),
        needsReview: false,
      } satisfies PublicationPerformanceWindow;
    }),
  );
}

function mockPostPerformance(request: AnalyticsProviderRequest): PostPerformance[] {
  return request.posts.map((post, index) => {
    const pageViews = Math.max(0, 240 - index * 23);
    const activeUsers = Math.max(0, 130 - index * 13);
    const searchClicks = Math.max(0, 48 - index * 5);
    const searchImpressions = Math.max(0, 880 - index * 80);
    return {
      postId: post.id,
      title: post.title,
      slug: post.slug,
      canonicalUrl: post.canonicalUrl,
      status: post.status,
      publishedAt: post.publishedAt,
      category: post.category,
      tags: post.tags ?? [],
      pageViews,
      activeUsers,
      searchClicks,
      searchImpressions,
      searchCtr: searchImpressions > 0 ? searchClicks / searchImpressions : 0,
      averagePosition: searchImpressions > 0 ? 8 + index * 1.7 : 0,
      matchState: "matched",
      topQueries: [
        {
          query: post.title,
          clicks: Math.min(searchClicks, 12),
          impressions: Math.min(searchImpressions, 220),
          ctr:
            searchImpressions > 0
              ? Math.min(searchClicks, 12) / Math.min(searchImpressions, 220)
              : 0,
          averagePosition: 7 + index,
        },
      ],
    };
  });
}

export async function fetchGoogleAnalyticsDashboard(
  request: AnalyticsProviderRequest,
  config: GoogleAnalyticsProviderConfig,
): Promise<AnalyticsProviderResult> {
  const missing = analyticsProviderMissingConfig(config);
  if (missing.length > 0) {
    return {
      ok: false,
      code: "missing-config",
      retryable: false,
      message: `Analytics dashboard is missing ${missing.join(", ")}.`,
    };
  }

  if (!config.mockMode) {
    try {
      const fetchImpl = config.fetchImpl ?? fetch;
      const account = await loadServiceAccount(config);
      const token = await requestAccessToken(account, fetchImpl);
      const [
        ga4Summary,
        ga4PreviousSummary,
        ga4Pages,
        gscSummary,
        gscPreviousSummary,
        gscPages,
        gscQueries,
        ga4DailyPages,
        gscDailyPages,
      ] = await Promise.all([
        fetchGa4Report({
          request,
          propertyId: config.ga4PropertyId ?? "",
          token,
          fetchImpl,
        }),
        fetchGa4Report({
          request,
          propertyId: config.ga4PropertyId ?? "",
          token,
          fetchImpl,
          previous: true,
        }),
        fetchGa4Report({
          request,
          propertyId: config.ga4PropertyId ?? "",
          token,
          fetchImpl,
          dimensions: ["pagePath"],
        }),
        fetchGscReport({
          request,
          property: config.searchConsoleProperty ?? "",
          token,
          fetchImpl,
        }),
        fetchGscReport({
          request,
          property: config.searchConsoleProperty ?? "",
          token,
          fetchImpl,
          previous: true,
        }),
        fetchGscReport({
          request,
          property: config.searchConsoleProperty ?? "",
          token,
          fetchImpl,
          dimensions: ["page"],
        }),
        fetchGscReport({
          request,
          property: config.searchConsoleProperty ?? "",
          token,
          fetchImpl,
          dimensions: ["page", "query"],
        }),
        fetchGa4Report({
          request,
          propertyId: config.ga4PropertyId ?? "",
          token,
          fetchImpl,
          dimensions: ["date", "pagePath"],
        }),
        fetchGscReport({
          request,
          property: config.searchConsoleProperty ?? "",
          token,
          fetchImpl,
          dimensions: ["date", "page"],
        }),
      ]);

      const currentGa4 = summarizeGa4(ga4Summary);
      const previousGa4 = summarizeGa4(ga4PreviousSummary);
      const currentGsc = summarizeGsc(gscSummary);
      const previousGsc = summarizeGsc(gscPreviousSummary);
      const postPerformance = normalizeLivePostPerformance({
        request,
        ga4Pages,
        gscPages,
        gscQueries,
      });
      const publicationWindows = normalizePublicationWindows({
        request,
        availableThrough: request.dateRange.endDate,
        ga4DailyPages,
        gscDailyPages,
      });

      return {
        ok: true,
        generatedAt: new Date().toISOString(),
        availableThrough: request.dateRange.endDate,
        summary: normalizeSitePerformanceSummary({
          ...currentGa4,
          ...currentGsc,
          previousPageViews: previousGa4.pageViews,
          previousActiveUsers: previousGa4.activeUsers,
          previousSearchClicks: previousGsc.searchClicks,
          previousSearchImpressions: previousGsc.searchImpressions,
          previousSearchCtr: previousGsc.searchCtr,
          previousAveragePosition: previousGsc.averagePosition,
        }),
        postPerformance,
        publicationWindows,
        warnings: postPerformance.some((post) => post.matchState !== "matched")
          ? ["Some posts could not be fully matched across GA4 and Search Console."]
          : [],
      };
    } catch (error) {
      return mapGoogleProviderError(error);
    }
  }

  const postPerformance = mockPostPerformance(request);
  const totals = postPerformance.reduce(
    (acc, post) => ({
      pageViews: acc.pageViews + post.pageViews,
      activeUsers: acc.activeUsers + post.activeUsers,
      searchClicks: acc.searchClicks + post.searchClicks,
      searchImpressions: acc.searchImpressions + post.searchImpressions,
    }),
    { pageViews: 0, activeUsers: 0, searchClicks: 0, searchImpressions: 0 },
  );

  return {
    ok: true,
    generatedAt: new Date().toISOString(),
    availableThrough: request.dateRange.endDate,
    summary:
      postPerformance.length > 0
        ? normalizeSitePerformanceSummary({
            ...totals,
            averagePosition:
              postPerformance.reduce((sum, post) => sum + post.averagePosition, 0) /
              postPerformance.length,
            previousPageViews: Math.round(totals.pageViews * 0.82),
            previousActiveUsers: Math.round(totals.activeUsers * 0.9),
            previousSearchClicks: Math.round(totals.searchClicks * 0.75),
            previousSearchImpressions: Math.round(totals.searchImpressions * 0.8),
          })
        : emptySitePerformanceSummary(),
    postPerformance,
    publicationWindows: mockPublicationWindows(postPerformance, request.dateRange.endDate),
    warnings: ["Mock analytics data is displayed."],
  };
}
