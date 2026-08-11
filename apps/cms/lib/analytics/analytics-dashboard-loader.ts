import {
  createDashboardConsoleLinks,
  emptySitePerformanceSummary,
  type AnalyticsConnection,
  type AnalyticsDashboardRange,
  type AnalyticsDashboardView,
  type AnalyticsProviderPost,
} from "@blog-platform/analytics";

import { listPostSummaries, type PostSummary } from "../editor/editor-loader";
import { loadSiteConfig } from "../site-config";
import {
  fetchGoogleAnalyticsDashboard,
  googleAnalyticsProviderConfigFromEnv,
  type GoogleAnalyticsProviderConfig,
} from "./google-analytics-provider";

export type AnalyticsDashboardLoaderInput = {
  range?: string | string[];
  providerConfig?: GoogleAnalyticsProviderConfig;
  now?: Date;
  posts?: PostSummary[];
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function parseAnalyticsRange(value: string | string[] | undefined): AnalyticsDashboardRange {
  return firstParam(value) === "7d" ? "7d" : "28d";
}

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function dashboardDateRange(range: AnalyticsDashboardRange, now = new Date()) {
  const days = range === "7d" ? 7 : 28;
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 1));
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - days + 1);
  const previousEnd = new Date(start);
  previousEnd.setUTCDate(previousEnd.getUTCDate() - 1);
  const previousStart = new Date(previousEnd);
  previousStart.setUTCDate(previousStart.getUTCDate() - days + 1);
  return {
    startDate: isoDate(start),
    endDate: isoDate(end),
    previousStartDate: isoDate(previousStart),
    previousEndDate: isoDate(previousEnd),
  };
}

function canonicalUrl(siteUrl: string, slug: string) {
  return `${siteUrl.replace(/\/+$/, "")}/blog/${encodeURIComponent(slug)}`;
}

function providerPosts(siteUrl: string, posts: PostSummary[]): AnalyticsProviderPost[] {
  return posts
    .filter((post) => post.status === "published" || post.status === "archived")
    .map((post) => ({
      id: post.path,
      title: post.title,
      slug: post.slug,
      canonicalUrl: canonicalUrl(siteUrl, post.slug),
      status: post.status === "archived" ? "archived" : "published",
      publishedAt: post.publishedAt ?? undefined,
      tags: [],
    }));
}

function connectionFor(input: {
  status: AnalyticsConnection["status"];
  ga4PropertyId?: string;
  searchConsoleProperty?: string;
  message?: string;
}): AnalyticsConnection {
  return {
    id: "google-analytics-search-console",
    provider: "ga4-gsc",
    ga4PropertyId: input.ga4PropertyId,
    searchConsoleProperty: input.searchConsoleProperty,
    status: input.status,
    lastCheckedAt: new Date().toISOString(),
    message: input.message,
  };
}

export async function loadAnalyticsDashboard(
  input: AnalyticsDashboardLoaderInput = {},
): Promise<AnalyticsDashboardView> {
  const range = parseAnalyticsRange(input.range);
  const site = await loadSiteConfig();
  const config = input.providerConfig ?? googleAnalyticsProviderConfigFromEnv();
  const posts = input.posts ?? (await listPostSummaries());
  const dateRange = dashboardDateRange(range, input.now);
  const externalLinks = createDashboardConsoleLinks({
    provider: "ga4",
    ga4PropertyId: site.analytics.ga4PropertyId,
    searchConsoleProperty: site.analytics.searchConsoleProperty,
  });

  const result = await fetchGoogleAnalyticsDashboard(
    {
      siteUrl: site.siteUrl,
      ga4PropertyId: config.ga4PropertyId ?? site.analytics.ga4PropertyId ?? "",
      searchConsoleProperty:
        config.searchConsoleProperty ?? site.analytics.searchConsoleProperty ?? "",
      dateRange,
      posts: providerPosts(site.siteUrl, posts),
    },
    {
      ...config,
      ga4PropertyId: config.ga4PropertyId ?? site.analytics.ga4PropertyId,
      searchConsoleProperty: config.searchConsoleProperty ?? site.analytics.searchConsoleProperty,
    },
  );

  if (!result.ok) {
    const status =
      result.code === "unauthorized"
        ? "unauthorized"
        : result.code === "missing-config"
          ? "missing-config"
          : "error";
    return {
      connection: connectionFor({
        status,
        ga4PropertyId: config.ga4PropertyId ?? site.analytics.ga4PropertyId,
        searchConsoleProperty: config.searchConsoleProperty ?? site.analytics.searchConsoleProperty,
        message: result.message,
      }),
      range,
      summary: result.lastUsableSnapshot?.summary ?? emptySitePerformanceSummary(),
      posts: result.lastUsableSnapshot?.posts ?? [],
      publicationWindows: result.lastUsableSnapshot?.publicationWindows ?? [],
      externalLinks: {
        ga4: externalLinks.ga4Url,
        searchConsole: externalLinks.searchConsoleUrl,
      },
      warnings: [result.message],
    };
  }

  return {
    connection: connectionFor({
      status: "connected",
      ga4PropertyId: config.ga4PropertyId ?? site.analytics.ga4PropertyId,
      searchConsoleProperty: config.searchConsoleProperty ?? site.analytics.searchConsoleProperty,
      message: "GA4 and Search Console dashboard data is available.",
    }),
    range,
    generatedAt: result.generatedAt,
    availableThrough: result.availableThrough,
    summary: result.summary,
    posts: result.postPerformance,
    publicationWindows: result.publicationWindows,
    externalLinks: {
      ga4: externalLinks.ga4Url,
      searchConsole: externalLinks.searchConsoleUrl,
    },
    warnings: result.warnings,
  };
}
