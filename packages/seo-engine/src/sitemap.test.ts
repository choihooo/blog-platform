import { describe, expect, it } from "vitest";
import { generateSitemapOutput, serializeSitemap } from "./sitemap.js";
import { draftSubject, seoSubject } from "./test-fixtures.js";

describe("generateSitemapOutput", () => {
  it("includes only public surfaces", () => {
    const site = seoSubject().site;
    const entries = generateSitemapOutput(site, [
      seoSubject(),
      seoSubject({ slug: "hello-world" }),
      draftSubject(),
    ]);
    const urls = entries.map((entry) => entry.loc);
    expect(urls).toContain("https://example.com");
    expect(urls).toContain("https://example.com/posts/hello-world");
    expect(urls).toContain("https://example.com/categories/engineering");
    expect(urls).toContain("https://example.com/tags/mdx");
    expect(urls).not.toContain("https://example.com/posts/draft-post");
    expect(new Set(urls).size).toBe(urls.length);
    expect(serializeSitemap([{ loc: "https://example.com/?a=1&b=2" }])).toContain("&amp;");
  });
});
