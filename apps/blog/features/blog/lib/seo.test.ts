import { describe, expect, it } from "vitest";
import { postToSeoSubject, siteForSeo } from "./seo";
import type { PublicPost } from "../server/content-source";

const post: PublicPost = {
  path: "db/posts/hello",
  status: "published",
  title: "Hello Structured Content",
  slug: "hello",
  author: "ho",
  publishedAt: "2026-07-30",
  body: "# Hello",
  bodyNodes: [{ type: "heading", depth: 1, text: "Hello" }],
  tagEntries: [{ slug: "content-json", label: "Structured Content" }],
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
    expect(subject.tags[0]?.label).toBe("Structured Content");
    expect(subject.toc[0]?.slug).toBe("hello");
    expect(subject.readingTime?.label).toBe("1 min read");
    expect(subject.coverImage).toBeUndefined();
  });

  it("uses the configured default author when a database post has no author profile", () => {
    const subject = postToSeoSubject(
      post,
      siteForSeo({
        siteName: "Blog",
        siteUrl: "https://example.com",
        description: "Notes",
        defaultAuthor: "ho",
        defaultAuthorName: "Ho Choi",
      }),
    );

    expect(subject.author).toEqual({
      id: "ho",
      name: "Ho Choi",
      avatar: undefined,
      sameAs: undefined,
      url: "https://example.com/resume",
    });
    expect(subject.site.description).toBe("Notes");
  });
});
