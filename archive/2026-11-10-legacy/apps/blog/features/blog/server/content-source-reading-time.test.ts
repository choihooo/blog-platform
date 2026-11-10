import { describe, expect, it } from "vitest";
import type { PostRecord } from "@blog-platform/core/content";
import { toPublicSourcePost } from "./content-source-utils";

describe("public reading time", () => {
  it.each(["구현 방법을 설명합니다. ".repeat(400), "implementation details ".repeat(400)])(
    "keeps lightweight listing and full article calculations consistent",
    (content) => {
      const post: PostRecord = {
        id: "post",
        slug: "post",
        title: "Post",
        content,
        summary: "",
        updatedAt: "2026-11-05",
        isPublished: 1,
        viewCount: 0,
      };
      const listing = toPublicSourcePost(post, { analyzeBody: false });
      const article = toPublicSourcePost(post);
      expect(listing.readingTimeLabel).toBe(article.readingTimeLabel);
      expect(listing.toc).toEqual([]);
    },
  );
});
