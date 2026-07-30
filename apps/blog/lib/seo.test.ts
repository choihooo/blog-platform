import { describe, expect, it } from "vitest";
import { postToSeoSubject, siteForSeo } from "./seo";
import type { PublicPost } from "./content";

const post: PublicPost = {
  path: "posts/hello.mdx",
  status: "published",
  title: "Hello MDX",
  slug: "hello",
  author: "ho",
  publishedAt: "2026-07-30",
  body: "# Hello",
  tagEntries: [{ slug: "mdx", label: "MDX" }],
  toc: [{ depth: 1, text: "Hello", slug: "hello" }],
  readingTimeLabel: "1 min read",
};

describe("postToSeoSubject", () => {
  it("converts public posts to SEO subjects", () => {
    const subject = postToSeoSubject(
      post,
      siteForSeo({ siteName: "Blog", siteUrl: "https://example.com" }),
    );
    expect(subject.slug).toBe("hello");
    expect(subject.tags[0]?.label).toBe("MDX");
  });
});
