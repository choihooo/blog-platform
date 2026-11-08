import { describe, expect, it } from "vitest";
import { getArticleNavigation } from "./article-navigation";

const posts = [2, 7, 1, 6, 4, 3, 5].map((day) => ({
  slug: `post-${day}`,
  title: `글 ${day}`,
  publishedAt: `2026-11-0${day}`,
}));

describe("article navigation", () => {
  it("links to older/newer posts and shows five rows around the current post", () => {
    const result = getArticleNavigation(posts, "post-4");
    expect(result.previous?.slug).toBe("post-3");
    expect(result.next?.slug).toBe("post-5");
    expect(result.items.map((post) => post.slug)).toEqual([
      "post-6",
      "post-5",
      "post-4",
      "post-3",
      "post-2",
    ]);
    expect(result.total).toBe(7);
    expect(posts[0]?.slug).toBe("post-2");
  });
  it("handles the latest post without inventing a next link", () => {
    const result = getArticleNavigation(posts, "post-7");
    expect(result.next).toBeUndefined();
    expect(result.previous?.slug).toBe("post-6");
    expect(result.items.map((post) => post.slug)).toEqual([
      "post-7",
      "post-6",
      "post-5",
      "post-4",
      "post-3",
    ]);
  });
  it("keeps five rows visible at the oldest edge", () => {
    const result = getArticleNavigation(posts, "post-1");
    expect(result.previous).toBeUndefined();
    expect(result.next?.slug).toBe("post-2");
    expect(result.items.map((post) => post.slug)).toEqual([
      "post-5",
      "post-4",
      "post-3",
      "post-2",
      "post-1",
    ]);
  });
  it("supports small catalogs and missing current entries", () => {
    expect(getArticleNavigation(posts.slice(0, 2), "post-2").items).toHaveLength(2);
    const missing = getArticleNavigation(posts, "missing");
    expect(missing.previous).toBeUndefined();
    expect(missing.next).toBeUndefined();
    expect(missing.items).toHaveLength(5);
    expect(getArticleNavigation([], "missing").items).toEqual([]);
  });
});
