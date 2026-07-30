import { describe, expect, it } from "vitest";
import { generatePageMetadata } from "@blog-platform/seo-engine";
import { postToSeoSubject, siteForSeo } from "../lib/seo";
import type { PublicPost } from "../lib/content";

describe("public SEO output", () => {
  it("can generate post metadata from public post data", () => {
    const post: PublicPost = {
      path: "posts/hello.mdx",
      status: "published",
      title: "Hello MDX",
      slug: "hello",
      author: "ho",
      publishedAt: "2026-07-30",
      excerpt: "Hello description",
      body: "# Hello",
      toc: [],
      tagEntries: [],
      readingTimeLabel: "1 min read",
    };
    const metadata = generatePageMetadata(
      postToSeoSubject(post, siteForSeo({ siteName: "Blog", siteUrl: "https://example.com" })),
    );
    expect(metadata.canonical).toBe("https://example.com/posts/hello");
    expect(metadata.openGraph.title).toBe("Hello MDX");
  });
});
