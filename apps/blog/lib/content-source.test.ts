import { describe, expect, it } from "vitest";
import type { PublicPost } from "./content";
import { normalizeForDualRunCompare } from "./content-source";

describe("content source dual-run compare helper", () => {
  it("normalizes fields deterministically", () => {
    const sample: PublicPost = {
      path: "posts/hello.mdx",
      status: "published",
      title: "Hello",
      slug: "hello",
      author: "ho",
      publishedAt: "2026-07-31T12:00:00.000Z",
      updatedAt: "2026-07-31T12:00:00.000Z",
      excerpt: "desc",
      coverImage: "hero.png",
      body: "# Hello\n\nbody",
      tagEntries: [],
      toc: [{ depth: 2, text: "A", slug: "a" }],
      tags: ["Tag-1", "tag-2", "tag-1"],
      readingTimeLabel: "1 min",
    };

    const normalized = normalizeForDualRunCompare(sample);
    expect(normalized).toMatchObject({
      slug: "hello",
      title: "Hello",
      category: null,
      publishedAt: "2026-07-31T12:00:00.000Z",
      tags: ["tag-1", "tag-2"],
      tocCount: 1,
      tagCount: 3,
    });
  });

  it("drops render-only fields for stable comparison", () => {
    const first: PublicPost = {
      path: "posts/a.mdx",
      status: "published",
      title: "A",
      slug: "a",
      author: "ho",
      publishedAt: "2026-07-31T01:00:00.000Z",
      updatedAt: "2026-07-31T01:00:00.000Z",
      body: "# A",
      tagEntries: [],
      toc: [],
      tags: ["tag"],
      readingTimeLabel: "1 min",
    };

    const second: PublicPost = {
      ...first,
      path: "posts/different.mdx",
      excerpt: first.excerpt,
      coverImage: first.coverImage,
    };

    expect(normalizeForDualRunCompare(first)).toEqual(normalizeForDualRunCompare(second));
  });
});
