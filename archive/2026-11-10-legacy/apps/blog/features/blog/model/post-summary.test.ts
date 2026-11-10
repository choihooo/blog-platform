import { describe, expect, it } from "vitest";
import { filterPosts, type PostSummary } from "./post-summary";

const posts: PostSummary[] = [
  {
    slug: "ai",
    title: "AI로 개발하기",
    excerpt: "개발 도구",
    category: "engineering/ai",
    publishedAt: "2026-11-05",
    readingTimeLabel: "3 min read",
    tagEntries: [{ slug: "workflow", label: "Workflow" }],
  },
  {
    slug: "book",
    title: "개발자의 글쓰기",
    category: "books",
    publishedAt: "2026-11-04",
    readingTimeLabel: "2 min read",
    tagEntries: [],
  },
];

describe("rounded blog preview filtering", () => {
  it("includes descendants in a parent category", () => {
    expect(filterPosts(posts, "", "engineering").map((post) => post.slug)).toEqual(["ai"]);
  });
  it("combines case-insensitive tag search with category selection", () => {
    expect(filterPosts(posts, "  WORKFLOW  ", "engineering/ai")).toHaveLength(1);
    expect(filterPosts(posts, "Workflow", "books")).toEqual([]);
  });
  it("requires all words and restores the catalog for a blank query", () => {
    expect(filterPosts(posts, "AI 도구", "")).toHaveLength(1);
    expect(filterPosts(posts, "AI 글쓰기", "")).toEqual([]);
    expect(filterPosts(posts, "   ", "")).toHaveLength(2);
  });
});
