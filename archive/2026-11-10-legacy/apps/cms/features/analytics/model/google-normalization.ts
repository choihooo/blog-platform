import {
  publicationWindowState,
  type AnalyticsProviderRequest,
  type PostPerformance,
  type PublicationPerformanceWindow,
} from "@blog-platform/core/analytics";

import type { Ga4RunReportResponse, GscSearchAnalyticsResponse } from "./google-contracts";
export function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function cleanPath(value: string) {
  try {
    const url = new URL(value);
    return url.pathname.replace(/\/+$/, "") || "/";
  } catch {
    return value.replace(/\/+$/, "") || "/";
  }
}

export function cleanUrl(value: string) {
  try {
    const url = new URL(value);
    url.hash = "";
    url.search = "";
    return url.toString().replace(/\/+$/, "");
  } catch {
    return value.replace(/\/+$/, "");
  }
}

export function numberValue(value: string | number | undefined) {
  const number = Number(value ?? 0);
  return Number.isFinite(number) ? number : 0;
}

export function parseApiDate(value: string | undefined) {
  if (!value) return "";
  if (/^\d{8}$/.test(value)) {
    return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
  }
  return value.slice(0, 10);
}

export function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

export function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function summarizeGa4(response: Ga4RunReportResponse) {
  const first = response.rows?.[0];
  return {
    pageViews: numberValue(first?.metricValues?.[0]?.value),
    activeUsers: numberValue(first?.metricValues?.[1]?.value),
  };
}

export function summarizeGsc(response: GscSearchAnalyticsResponse) {
  const first = response.rows?.[0];
  return {
    searchClicks: numberValue(first?.clicks),
    searchImpressions: numberValue(first?.impressions),
    searchCtr: numberValue(first?.ctr),
    averagePosition: numberValue(first?.position),
  };
}

export function normalizeLivePostPerformance(input: {
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

export function normalizePublicationWindows(input: {
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
