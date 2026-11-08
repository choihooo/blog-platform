import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { generateJsonLd, generatePageMetadata } from "@blog-platform/core/seo";
import type { PublicPost } from "@/features/blog/server/content-source";
import { postToSeoSubject, siteForSeo } from "@/features/blog/lib/seo";

describe("public SEO output", () => {
  it("can generate post metadata from public post data", () => {
    const post: PublicPost = {
      path: "db/posts/hello",
      status: "published",
      title: "Hello Structured Content",
      slug: "hello",
      author: "ho",
      publishedAt: "2026-07-30",
      excerpt: "Hello description",
      body: "# Hello",
      bodyNodes: [{ type: "heading", depth: 1, text: "Hello" }],
      toc: [],
      tagEntries: [],
      readingTimeLabel: "1 min read",
    };
    const subject = postToSeoSubject(
      post,
      siteForSeo({ siteName: "Blog", siteUrl: "https://example.com" }),
    );
    const metadata = generatePageMetadata(subject);
    expect(metadata.canonical).toBe("https://example.com/blog/hello");
    expect(metadata.openGraph.title).toBe("Hello Structured Content");
    expect(metadata.twitter.images[0]).toBe("https://example.com/og/hello");
    expect(generateJsonLd(subject)[0]).toMatchObject({ "@type": "BlogPosting" });
  });

  it("post page renders reading aids from public post data", () => {
    const source = readFileSync(new URL("./posts/[slug]/page.tsx", import.meta.url), "utf8");
    expect(source).toContain("post.readingTimeLabel");
    expect(source).toContain("post.toc.map");
    expect(source).toContain("href={`#${item.slug}`}");
  });
});
