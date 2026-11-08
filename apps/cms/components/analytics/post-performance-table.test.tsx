import { render, screen } from "@testing-library/react";
import { createElement } from "react";
import { describe, expect, it } from "vitest";
import type { PostPerformance } from "@blog-platform/core/analytics";

import { PostPerformanceTable } from "./post-performance-table";

const post: PostPerformance = {
  postId: "db/posts/hello",
  title: "Hello Analytics",
  slug: "hello",
  canonicalUrl: "https://blog.hozorica.com/posts/hello",
  status: "published",
  publishedAt: "2026-08-01T00:00:00.000Z",
  tags: [],
  pageViews: 10,
  activeUsers: 8,
  searchClicks: 4,
  searchImpressions: 120,
  searchCtr: 0.033,
  averagePosition: 9.3,
  matchState: "matched",
  topQueries: [],
};

describe("PostPerformanceTable", () => {
  it("links post rows to post analytics detail", () => {
    render(createElement(PostPerformanceTable, { posts: [post] }));

    expect(screen.getByRole("link", { name: "Hello Analytics" }).getAttribute("href")).toBe(
      "/analytics/posts/hello",
    );
  });
});
