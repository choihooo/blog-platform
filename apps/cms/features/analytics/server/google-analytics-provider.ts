import {
  emptySitePerformanceSummary,
  normalizeSitePerformanceSummary,
  type AnalyticsProviderRequest,
  type AnalyticsProviderResult,
} from "@blog-platform/core/analytics";

import type { GoogleAnalyticsProviderConfig } from "../model/google-contracts";
import {
  clean,
  normalizeLivePostPerformance,
  normalizePublicationWindows,
  summarizeGa4,
  summarizeGsc,
} from "../model/google-normalization";
import { loadServiceAccount, requestAccessToken } from "./google-auth";
import { fetchGa4Report, fetchGscReport } from "./google-reports";
import { mockPostPerformance, mockPublicationWindows } from "./mock-dashboard";
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
export type { GoogleAnalyticsProviderConfig } from "../model/google-contracts";
