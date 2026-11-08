import type {
  AnalyticsProviderPost,
  PostPerformance,
  SearchQueryPerformance,
} from "./dashboard-types.js";
import {
  nonNegativeInteger,
  normalizeAveragePosition,
  normalizeCtr,
} from "./performance-normalization.js";

export type GscPageMetricRow = {
  page: string;
  clicks?: number;
  impressions?: number;
  ctr?: number;
  position?: number;
};

export type GscQueryMetricRow = GscPageMetricRow & {
  query: string;
};

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

export function normalizeSearchQueryPerformance(row: GscQueryMetricRow): SearchQueryPerformance {
  const clicks = nonNegativeInteger(row.clicks);
  const impressions = nonNegativeInteger(row.impressions);
  return {
    query: row.query.trim(),
    clicks,
    impressions,
    ctr: normalizeCtr(clicks, impressions, row.ctr),
    averagePosition: normalizeAveragePosition(row.position),
  };
}

export function normalizeGscPostPerformance(
  posts: AnalyticsProviderPost[],
  pageRows: GscPageMetricRow[],
  queryRows: GscQueryMetricRow[] = [],
): Pick<
  PostPerformance,
  "postId" | "searchClicks" | "searchImpressions" | "searchCtr" | "averagePosition" | "topQueries"
>[] {
  const pageMetrics = new Map<
    string,
    { clicks: number; impressions: number; weightedPosition: number }
  >();
  for (const row of pageRows) {
    const page = cleanUrl(row.page);
    const clicks = nonNegativeInteger(row.clicks);
    const impressions = nonNegativeInteger(row.impressions);
    const current = pageMetrics.get(page) ?? { clicks: 0, impressions: 0, weightedPosition: 0 };
    current.clicks += clicks;
    current.impressions += impressions;
    current.weightedPosition += normalizeAveragePosition(row.position) * Math.max(1, impressions);
    pageMetrics.set(page, current);
  }

  const queriesByPage = new Map<string, SearchQueryPerformance[]>();
  for (const row of queryRows) {
    const query = normalizeSearchQueryPerformance(row);
    if (!query.query) continue;
    const page = cleanUrl(row.page);
    queriesByPage.set(page, [...(queriesByPage.get(page) ?? []), query]);
  }

  return posts.map((post) => {
    const page = cleanUrl(post.canonicalUrl);
    const metrics = pageMetrics.get(page);
    const searchClicks = metrics?.clicks ?? 0;
    const searchImpressions = metrics?.impressions ?? 0;
    const topQueries = (queriesByPage.get(page) ?? [])
      .sort((left, right) => right.clicks - left.clicks || right.impressions - left.impressions)
      .slice(0, 5);

    return {
      postId: post.id,
      searchClicks,
      searchImpressions,
      searchCtr: normalizeCtr(searchClicks, searchImpressions),
      averagePosition:
        metrics && metrics.impressions > 0 ? metrics.weightedPosition / metrics.impressions : 0,
      topQueries,
    };
  });
}
