import { describe, expect, it } from "vitest";
import { canonicalUrl, createSeoSubject, ogImageUrl, publicPostUrl } from "./subject.js";
import { seoSubject } from "./test-fixtures.js";

describe("createSeoSubject", () => {
  it("maps markdown analysis into a reusable subject", () => {
    const base = seoSubject();
    const subject = createSeoSubject({
      post: {
        path: base.path,
        status: base.status,
        title: base.title,
        slug: base.slug,
        excerpt: base.excerpt,
        coverImage: base.coverImage,
        publishedAt: base.publishedAt,
        updatedAt: base.updatedAt,
        category: base.category?.slug,
        tags: base.tags.map((tag) => tag.slug),
        body: base.body,
      },
      site: base.site,
      author: base.author,
      category: base.category,
      tags: base.tags,
      analysis: { headings: base.headings, toc: base.toc, readingTime: base.readingTime },
    });
    expect(subject.imageAltTexts).toEqual(["cover"]);
    expect(subject.internalLinks).toEqual(["/posts/other"]);
    expect(publicPostUrl(subject.site, subject.slug ?? "")).toBe(
      "https://example.com/posts/hello-world",
    );
    expect(canonicalUrl(subject)).toBe("https://example.com/posts/hello-world");
    expect(ogImageUrl(subject.site, subject.slug ?? "")).toBe("https://example.com/og/hello-world");
    expect(publicPostUrl({ ...subject.site, siteUrl: "https://example.com/" }, "x")).toBe(
      "https://example.com/posts/x",
    );
  });
});
