import { afterEach, expect, it, vi } from "vitest";
const { search } = vi.hoisted(() => ({ search: vi.fn() }));
vi.mock("./content-source", () => ({ searchPosts: search }));
import { searchPublicPosts } from "./search-service";
afterEach(() => vi.resetAllMocks());
it("maps a public result to the current search response defaults", async () => {
  search.mockResolvedValue([
    {
      slug: "hello",
      title: "Hello",
      tagEntries: [],
      publishedAt: "2026-01-01",
      readingTimeLabel: "1 min",
      body: "excluded",
    },
  ]);
  expect(await searchPublicPosts({ query: "hello", page: 1, limit: 20 })).toEqual({
    query: "hello",
    total: 1,
    items: [
      {
        slug: "hello",
        title: "Hello",
        excerpt: "",
        category: null,
        tags: [],
        publishedAt: "2026-01-01",
        updatedAt: "",
        readingTimeLabel: "1 min",
        coverImage: "",
        url: "/blog/hello",
      },
    ],
  });
});
it("propagates storage failures", async () => {
  search.mockRejectedValue(new Error("content_unavailable"));
  await expect(searchPublicPosts({ query: "q", page: 1, limit: 20 })).rejects.toThrow(
    "content_unavailable",
  );
});
