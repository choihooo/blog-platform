import { describe, expect, it } from "vitest";
import { generateSitemapOutput } from "./sitemap.js";
import { seoSubject } from "./test-fixtures.js";

describe("generateSitemapOutput", () => {
  it("includes only public surfaces", () => {
    const site = seoSubject().site;
    const entries = generateSitemapOutput(site, [seoSubject(), seoSubject({ status: "draft" })]);
    expect(entries.map((entry) => entry.loc)).toContain("https://example.com/posts/hello-world");
    expect(entries.map((entry) => entry.loc)).not.toContain("https://example.com/posts/draft");
  });
});
