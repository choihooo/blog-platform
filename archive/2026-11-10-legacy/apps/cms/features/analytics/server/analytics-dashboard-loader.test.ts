import { describe, expect, it } from "vitest";

import {
  dashboardDateRange,
  loadAnalyticsDashboard,
  parseAnalyticsRange,
} from "./analytics-dashboard-loader";

describe("analytics dashboard loader", () => {
  it("parses supported ranges", () => {
    expect(parseAnalyticsRange("7d")).toBe("7d");
    expect(parseAnalyticsRange("unknown")).toBe("28d");
  });

  it("calculates previous matching date ranges", () => {
    expect(dashboardDateRange("7d", new Date("2026-08-06T12:00:00.000Z"))).toEqual({
      startDate: "2026-07-30",
      endDate: "2026-08-05",
      previousStartDate: "2026-07-23",
      previousEndDate: "2026-07-29",
    });
  });

  it("returns mock connected dashboard data without exposing visitor records", async () => {
    const dashboard = await loadAnalyticsDashboard({
      range: "7d",
      providerConfig: {
        ga4PropertyId: "123",
        searchConsoleProperty: "sc-domain:example.com",
        mockMode: true,
      },
      posts: [
        {
          path: "db/posts/hello",
          slug: "hello",
          title: "Hello",
          status: "published",
          sha: "sha",
          publishedAt: "2026-08-01T00:00:00.000Z",
          updatedAt: "2026-08-01T00:00:00.000Z",
        },
      ],
    });

    expect(dashboard.connection.status).toBe("connected");
    expect(dashboard.posts[0]).not.toHaveProperty("userId");
    expect(dashboard.posts[0]).not.toHaveProperty("clientId");
  });
});
