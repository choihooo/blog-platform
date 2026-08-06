import { describe, expect, it } from "vitest";

import {
  normalizeCtr,
  normalizeSitePerformanceSummary,
  publicationWindowState,
} from "./performance-normalization.js";

describe("performance normalization", () => {
  it("normalizes CTR and comparison metrics", () => {
    const summary = normalizeSitePerformanceSummary({
      pageViews: 10.4,
      activeUsers: 5,
      searchClicks: 2,
      searchImpressions: 10,
      previousPageViews: 8,
      previousSearchClicks: 4,
    });

    expect(summary.pageViews).toBe(10);
    expect(summary.searchCtr).toBe(0.2);
    expect(summary.comparison).toContainEqual({
      metric: "pageViews",
      current: 10,
      previous: 8,
      delta: 2,
      direction: "up",
    });
    expect(summary.comparison).toContainEqual({
      metric: "searchClicks",
      current: 2,
      previous: 4,
      delta: -2,
      direction: "down",
    });
  });

  it("keeps missing CTR at zero when impressions are unavailable", () => {
    expect(normalizeCtr(3, 0)).toBe(0);
  });

  it("marks publication windows pending until the window has elapsed", () => {
    expect(
      publicationWindowState({
        publishedAt: "2026-08-01T00:00:00.000Z",
        availableThrough: "2026-08-02",
        windowDays: 7,
        sampleSize: 10,
      }),
    ).toBe("pending");
  });
});
