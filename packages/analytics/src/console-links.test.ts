import { describe, expect, it } from "vitest";
import { createExternalConsoleLinks } from "./console-links.js";
import { ga4Config } from "./test-fixtures.js";

describe("createExternalConsoleLinks", () => {
  it("creates public and external console links without API calls", () => {
    const links = createExternalConsoleLinks({
      siteUrl: "https://example.com",
      postSlug: "hello-world",
      config: ga4Config,
    });
    expect(links.publicPostUrl).toBe("https://example.com/posts/hello-world");
    expect(links.ga4Url).toContain("analytics.google.com");
    expect(links.searchConsoleUrl).toContain("search.google.com");
  });
});
