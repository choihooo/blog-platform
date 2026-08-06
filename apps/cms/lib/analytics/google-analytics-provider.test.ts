import { generateKeyPairSync } from "node:crypto";

import { describe, expect, it } from "vitest";

import {
  analyticsProviderMissingConfig,
  fetchGoogleAnalyticsDashboard,
  mapGoogleProviderError,
} from "./google-analytics-provider";

describe("google analytics provider config", () => {
  it("requires properties and credentials outside mock mode", () => {
    expect(analyticsProviderMissingConfig({})).toEqual([
      "GA4_PROPERTY_ID",
      "SEARCH_CONSOLE_PROPERTY",
      "GOOGLE_SERVICE_ACCOUNT_JSON or GOOGLE_APPLICATION_CREDENTIALS",
    ]);
  });

  it("maps quota errors as retryable", () => {
    expect(mapGoogleProviderError(new Error("quota exceeded"))).toMatchObject({
      code: "quota-limited",
      retryable: true,
    });
  });

  it("fetches and normalizes live GA4 and GSC reports", async () => {
    const { privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
    const serviceAccountJson = JSON.stringify({
      client_email: "analytics@example.iam.gserviceaccount.com",
      private_key: privateKey.export({ type: "pkcs8", format: "pem" }),
      token_uri: "https://oauth2.googleapis.com/token",
    });
    const responses = [
      { access_token: "token" },
      { rows: [{ metricValues: [{ value: "12" }, { value: "7" }] }] },
      { rows: [{ metricValues: [{ value: "8" }, { value: "5" }] }] },
      {
        rows: [
          {
            dimensionValues: [{ value: "/posts/hello" }],
            metricValues: [{ value: "12" }, { value: "7" }],
          },
        ],
      },
      { rows: [{ clicks: 4, impressions: 100, ctr: 0.04, position: 8 }] },
      { rows: [{ clicks: 2, impressions: 80, ctr: 0.025, position: 10 }] },
      {
        rows: [
          {
            keys: ["https://blog.example.com/posts/hello"],
            clicks: 4,
            impressions: 100,
            ctr: 0.04,
            position: 8,
          },
        ],
      },
      {
        rows: [
          {
            keys: ["https://blog.example.com/posts/hello", "hello query"],
            clicks: 3,
            impressions: 30,
            ctr: 0.1,
            position: 5,
          },
        ],
      },
      {
        rows: [
          {
            dimensionValues: [{ value: "20260801" }, { value: "/posts/hello" }],
            metricValues: [{ value: "5" }, { value: "3" }],
          },
          {
            dimensionValues: [{ value: "20260802" }, { value: "/posts/hello" }],
            metricValues: [{ value: "7" }, { value: "4" }],
          },
        ],
      },
      {
        rows: [
          {
            keys: ["2026-08-01", "https://blog.example.com/posts/hello"],
            clicks: 1,
            impressions: 20,
          },
          {
            keys: ["2026-08-02", "https://blog.example.com/posts/hello"],
            clicks: 3,
            impressions: 80,
          },
        ],
      },
    ];
    const fetchImpl = async () =>
      new Response(JSON.stringify(responses.shift() ?? {}), {
        status: 200,
        headers: { "content-type": "application/json" },
      });

    const result = await fetchGoogleAnalyticsDashboard(
      {
        siteUrl: "https://blog.example.com",
        ga4PropertyId: "488661671",
        searchConsoleProperty: "sc-domain:example.com",
        dateRange: {
          startDate: "2026-07-30",
          endDate: "2026-08-05",
          previousStartDate: "2026-07-23",
          previousEndDate: "2026-07-29",
        },
        posts: [
          {
            id: "db/posts/hello",
            title: "Hello",
            slug: "hello",
            canonicalUrl: "https://blog.example.com/posts/hello",
            status: "published",
            publishedAt: "2026-08-01T00:00:00.000Z",
          },
        ],
      },
      {
        ga4PropertyId: "488661671",
        searchConsoleProperty: "sc-domain:example.com",
        serviceAccountJson,
        fetchImpl,
      },
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.summary.pageViews).toBe(12);
    expect(result.summary.searchClicks).toBe(4);
    expect(result.postPerformance[0]).toMatchObject({
      slug: "hello",
      pageViews: 12,
      activeUsers: 7,
      searchClicks: 4,
      searchImpressions: 100,
      matchState: "matched",
    });
    expect(result.postPerformance[0]?.topQueries[0]?.query).toBe("hello query");
    expect(result.publicationWindows).toContainEqual({
      postId: "db/posts/hello",
      window: "1d",
      state: "complete",
      pageViews: 5,
      activeUsers: 3,
      searchClicks: 1,
      searchImpressions: 20,
      needsReview: false,
    });
  });
});
