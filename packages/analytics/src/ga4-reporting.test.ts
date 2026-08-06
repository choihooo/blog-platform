import { describe, expect, it } from "vitest";

import { normalizeGa4PostPerformance } from "./ga4-reporting.js";

describe("normalizeGa4PostPerformance", () => {
  it("matches GA4 page rows by canonical path", () => {
    expect(
      normalizeGa4PostPerformance(
        [
          {
            id: "post-1",
            title: "Hello",
            slug: "hello",
            canonicalUrl: "https://example.com/posts/hello",
            status: "published",
          },
        ],
        [{ pagePath: "/posts/hello", pageViews: 12, activeUsers: 7 }],
      ),
    ).toEqual([{ postId: "post-1", pageViews: 12, activeUsers: 7, matchState: "matched" }]);
  });
});
