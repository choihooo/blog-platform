import type { AnalyticsProviderPost, PostPerformance } from "./dashboard-types.js";
import { nonNegativeInteger } from "./performance-normalization.js";

export type Ga4PageMetricRow = {
  pagePath?: string;
  canonicalUrl?: string;
  pageViews?: number;
  activeUsers?: number;
};

function cleanPath(value?: string) {
  if (!value) return "";
  try {
    const url = new URL(value);
    return url.pathname.replace(/\/+$/, "") || "/";
  } catch {
    return value.replace(/\/+$/, "") || "/";
  }
}

export function normalizeGa4PostPerformance(
  posts: AnalyticsProviderPost[],
  rows: Ga4PageMetricRow[],
): Pick<PostPerformance, "postId" | "pageViews" | "activeUsers" | "matchState">[] {
  const metrics = new Map<string, { pageViews: number; activeUsers: number }>();
  for (const row of rows) {
    const key = cleanPath(row.canonicalUrl ?? row.pagePath);
    if (!key) continue;
    const current = metrics.get(key) ?? { pageViews: 0, activeUsers: 0 };
    current.pageViews += nonNegativeInteger(row.pageViews);
    current.activeUsers += nonNegativeInteger(row.activeUsers);
    metrics.set(key, current);
  }

  return posts.map((post) => {
    const postPath = cleanPath(post.canonicalUrl);
    const matched = metrics.get(postPath);
    return {
      postId: post.id,
      pageViews: matched?.pageViews ?? 0,
      activeUsers: matched?.activeUsers ?? 0,
      matchState: matched ? "matched" : "unmatched",
    };
  });
}
