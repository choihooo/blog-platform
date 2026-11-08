import { describe, expect, it } from "vitest";
import type { PostRecord } from "@blog-platform/core/content";
import { toPublicSourcePost } from "./content-source-utils";

const post: PostRecord = {
  id: "thumbnail-test",
  slug: "regular-expression",
  title: "정규표현식",
  content: "# 정규표현식\n\n본문",
  summary: "설명",
  heroImageKey: "https://cdn.example.com/old-hero.png",
  updatedAt: "2026-11-03T00:00:00.000Z",
  isPublished: 1,
  viewCount: 0,
  mediaRefs: [
    {
      id: "hero",
      postId: "thumbnail-test",
      kind: "hero",
      r2Key: "https://cdn.example.com/hero.png",
    },
  ],
};

describe("public thumbnail normalization shared by D1/R2 and remote sources", () => {
  it("uses the CMS hero selection even for previously curated slugs", () => {
    expect(toPublicSourcePost(post).coverImage).toBe("https://cdn.example.com/hero.png");
    expect(toPublicSourcePost({ ...post, slug: " REGULAR-EXPRESSION " }).coverImage).toBe(
      "https://cdn.example.com/hero.png",
    );
  });

  it("preserves CMS hero selection for posts outside the curated collection", () => {
    expect(toPublicSourcePost({ ...post, slug: "future-post" }).coverImage).toBe(
      "https://cdn.example.com/hero.png",
    );
    expect(toPublicSourcePost({ ...post, slug: "future-post", mediaRefs: [] }).coverImage).toBe(
      post.heroImageKey,
    );
  });
});
