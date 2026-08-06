import type {
  MetricComparison,
  PublicationPerformanceWindow,
  SitePerformanceSummary,
} from "./dashboard-types.js";

export type RawSummaryMetrics = Partial<
  Omit<SitePerformanceSummary, "comparison"> & {
    previousPageViews: number;
    previousActiveUsers: number;
    previousSearchClicks: number;
    previousSearchImpressions: number;
    previousSearchCtr: number;
    previousAveragePosition: number;
  }
>;

function finiteNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

export function nonNegativeInteger(value: unknown) {
  return Math.max(0, Math.round(finiteNumber(value)));
}

export function normalizeCtr(clicks: unknown, impressions: unknown, explicitCtr?: unknown) {
  const ctr = finiteNumber(explicitCtr);
  if (ctr > 0) return Math.min(1, ctr);
  const normalizedImpressions = nonNegativeInteger(impressions);
  if (normalizedImpressions === 0) return 0;
  return Math.min(1, nonNegativeInteger(clicks) / normalizedImpressions);
}

export function normalizeAveragePosition(value: unknown) {
  return Math.max(0, finiteNumber(value));
}

export function compareMetric(
  metric: string,
  current: unknown,
  previous: unknown,
): MetricComparison {
  const normalizedCurrent = finiteNumber(current);
  const normalizedPrevious = finiteNumber(previous);
  const delta = normalizedCurrent - normalizedPrevious;
  const direction = delta > 0 ? "up" : delta < 0 ? "down" : "flat";
  return { metric, current: normalizedCurrent, previous: normalizedPrevious, delta, direction };
}

export function emptySitePerformanceSummary(): SitePerformanceSummary {
  return {
    pageViews: 0,
    activeUsers: 0,
    searchClicks: 0,
    searchImpressions: 0,
    searchCtr: 0,
    averagePosition: 0,
    comparison: [],
  };
}

export function normalizeSitePerformanceSummary(input: RawSummaryMetrics): SitePerformanceSummary {
  const pageViews = nonNegativeInteger(input.pageViews);
  const activeUsers = nonNegativeInteger(input.activeUsers);
  const searchClicks = nonNegativeInteger(input.searchClicks);
  const searchImpressions = nonNegativeInteger(input.searchImpressions);
  const searchCtr = normalizeCtr(searchClicks, searchImpressions, input.searchCtr);
  const averagePosition = normalizeAveragePosition(input.averagePosition);

  return {
    pageViews,
    activeUsers,
    searchClicks,
    searchImpressions,
    searchCtr,
    averagePosition,
    comparison: [
      compareMetric("pageViews", pageViews, input.previousPageViews),
      compareMetric("activeUsers", activeUsers, input.previousActiveUsers),
      compareMetric("searchClicks", searchClicks, input.previousSearchClicks),
      compareMetric("searchImpressions", searchImpressions, input.previousSearchImpressions),
      compareMetric("searchCtr", searchCtr, input.previousSearchCtr),
      compareMetric("averagePosition", averagePosition, input.previousAveragePosition),
    ],
  };
}

export function publicationWindowState(input: {
  publishedAt?: string;
  availableThrough: string;
  windowDays: 1 | 7 | 28;
  sampleSize: number;
}): PublicationPerformanceWindow["state"] {
  if (!input.publishedAt) return "insufficient-data";
  const published = new Date(input.publishedAt);
  const available = new Date(`${input.availableThrough}T23:59:59.999Z`);
  if (!Number.isFinite(published.getTime()) || !Number.isFinite(available.getTime())) {
    return "insufficient-data";
  }
  const elapsedDays = Math.floor((available.getTime() - published.getTime()) / 86_400_000) + 1;
  if (elapsedDays < input.windowDays) return "pending";
  return input.sampleSize <= 0 ? "insufficient-data" : "complete";
}
