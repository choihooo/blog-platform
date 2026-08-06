import { describe, expect, it } from "vitest";

import { normalizeGscPostPerformance } from "./gsc-reporting.js";

describe("normalizeGscPostPerformance", () => {
  it("normalizes page and top query metrics by canonical URL", () => {
    const [post] = normalizeGscPostPerformance(
      [
        {
          id: "post-1",
          title: "Hello",
          slug: "hello",
          canonicalUrl: "https://example.com/posts/hello",
          status: "published",
        },
      ],
      [{ page: "https://example.com/posts/hello", clicks: 4, impressions: 100, position: 8 }],
      [
        {
          page: "https://example.com/posts/hello",
          query: "hello",
          clicks: 3,
          impressions: 30,
          position: 5,
        },
      ],
    );

    expect(post).toMatchObject({
      postId: "post-1",
      searchClicks: 4,
      searchImpressions: 100,
      searchCtr: 0.04,
      averagePosition: 8,
    });
    expect(post?.topQueries[0]?.query).toBe("hello");
  });
});
