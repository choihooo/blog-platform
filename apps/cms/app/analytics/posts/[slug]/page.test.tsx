import { render, screen } from "@testing-library/react";
import { createElement } from "react";
import { describe, expect, it } from "vitest";
import type { AnalyticsDashboardView } from "@blog-platform/core/analytics";

import { PostAnalyticsPageView } from "./page";

const decision = {
  status: "authorized" as const,
  nextAction: "continue" as const,
  adminIdentity: { githubLogin: "ho", githubUserId: "123", sourcePath: "content/site.json" },
  session: { githubLogin: "ho", githubUserId: "123", expiresAt: "2099-01-01T00:00:00.000Z" },
};

const dashboard: AnalyticsDashboardView = {
  connection: {
    id: "google-analytics-search-console",
    provider: "ga4-gsc",
    status: "connected",
  },
  range: "28d",
  availableThrough: "2026-08-05",
  summary: {
    pageViews: 10,
    activeUsers: 8,
    searchClicks: 4,
    searchImpressions: 120,
    searchCtr: 0.033,
    averagePosition: 9.3,
    comparison: [],
  },
  externalLinks: {
    ga4: "https://analytics.google.com",
    searchConsole: "https://search.google.com/search-console",
  },
  posts: [
    {
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
      topQueries: [
        {
          query: "hello analytics",
          clicks: 4,
          impressions: 120,
          ctr: 0.033,
          averagePosition: 9.3,
        },
      ],
    },
  ],
  publicationWindows: [
    {
      postId: "db/posts/hello",
      window: "1d",
      state: "complete",
      pageViews: 2,
      activeUsers: 2,
      searchClicks: 0,
      searchImpressions: 10,
      needsReview: false,
    },
  ],
  warnings: [],
};

describe("PostAnalyticsPageView", () => {
  it("renders post detail analytics instead of the editor", () => {
    render(createElement(PostAnalyticsPageView, { dashboard, decision, slug: "hello" }));

    expect(screen.getByRole("heading", { level: 2, name: "Hello Analytics" })).toBeTruthy();
    expect(screen.getByRole("link", { name: /수정/ }).getAttribute("href")).toBe("/posts/hello");
    expect(screen.getByRole("link", { name: /글 보기/ }).getAttribute("href")).toBe(
      "https://blog.hozorica.com/posts/hello",
    );
    expect(screen.getByText("발행 후 성과")).toBeTruthy();
    expect(screen.getByText("유입 검색어")).toBeTruthy();
    expect(screen.getByText("hello analytics")).toBeTruthy();
    expect(screen.getByText("수집 중인 이벤트")).toBeTruthy();
    expect(screen.getByText("recommended_post_click")).toBeTruthy();
  });

  it("renders a missing state when the slug is not in analytics data", () => {
    render(createElement(PostAnalyticsPageView, { dashboard, decision, slug: "missing" }));

    expect(screen.getByText("글 분석 데이터를 찾을 수 없습니다.")).toBeTruthy();
  });
});
