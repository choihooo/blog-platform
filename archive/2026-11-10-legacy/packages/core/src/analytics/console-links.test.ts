import { describe, expect, it } from "vitest";
import { createDashboardConsoleLinks, createExternalConsoleLinks } from "./console-links.js";
import { ga4Config } from "./test-fixtures.js";

describe("createExternalConsoleLinks", () => {
  it("creates public and external console links without API calls", () => {
    const links = createExternalConsoleLinks({
      siteUrl: "https://example.com",
      postSlug: "hello-world",
      postStatus: "published",
      config: ga4Config,
    });
    expect(links.publicPostUrl).toBe("https://example.com/posts/hello-world");
    expect(links.ga4Url).toContain("analytics.google.com");
    expect(links.searchConsoleUrl).toContain("search.google.com");
  });

  it("disables links for non-public or unconfigured states", () => {
    expect(
      createExternalConsoleLinks({
        siteUrl: "https://example.com",
        postSlug: "hello-world",
        postStatus: "draft",
        config: ga4Config,
      }).publicPostUrl,
    ).toBeUndefined();
    expect(
      createExternalConsoleLinks({
        siteUrl: "not a url",
        postStatus: "published",
        config: { provider: "disabled" },
      }).disabledReasons.length,
    ).toBeGreaterThan(0);
  });
});

describe("createDashboardConsoleLinks", () => {
  it("creates property-level GA4 and Search Console links", () => {
    const links = createDashboardConsoleLinks({
      provider: "ga4",
      ga4PropertyId: "123456",
      searchConsoleProperty: "sc-domain:example.com",
    });

    expect(links.ga4Url).toContain("/p123456/");
    expect(links.searchConsoleUrl).toContain("resource_id=sc-domain%3Aexample.com");
    expect(links.disabledReasons).toEqual([]);
  });
});
