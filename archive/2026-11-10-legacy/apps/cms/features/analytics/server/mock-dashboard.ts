import {
  publicationWindowState,
  type AnalyticsProviderRequest,
  type PostPerformance,
  type PublicationPerformanceWindow,
} from "@blog-platform/core/analytics";

export function mockPublicationWindows(
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

export function mockPostPerformance(request: AnalyticsProviderRequest): PostPerformance[] {
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
