import { afterEach, describe, expect, it, vi } from "vitest";
const { posts, categories } = vi.hoisted(() => ({ posts: vi.fn(), categories: vi.fn() }));
vi.mock("./content-source", () => ({ getAllPublishedPosts: posts, listCategories: categories }));
import { loadBlogListing } from "./listing-service";
afterEach(() => vi.resetAllMocks());
describe("public listing data", () => {
  it("selects only summary fields and keeps parents followed by their children", async () => {
    posts.mockResolvedValue([
      {
        slug: "a",
        title: "A",
        publishedAt: "2026-01-01",
        readingTimeLabel: "1 min",
        tagEntries: [],
        body: "private implementation field",
        bodyNodes: [{}],
        status: "published",
      },
    ]);
    categories.mockImplementation(async ({ depth }: { depth: number }) =>
      depth === 1
        ? [
            { slug: "dev", label: "Dev", depth: 1 },
            { slug: "life", label: "Life", depth: 1 },
          ]
        : [{ slug: "dev/react", label: "React", depth: 2, parentSlug: "dev" }],
    );
    const result = await loadBlogListing();
    expect(result.categories.map((c) => c.slug)).toEqual(["dev", "dev/react", "life"]);
    expect(result.posts).toEqual([
      {
        slug: "a",
        title: "A",
        excerpt: undefined,
        coverImage: undefined,
        publishedAt: "2026-01-01",
        readingTimeLabel: "1 min",
        category: undefined,
        tagEntries: [],
      },
    ]);
    expect(Object.keys(result.posts[0]!)).not.toContain("bodyNodes");
  });
  it("does not turn a storage failure into an empty listing", async () => {
    posts.mockRejectedValue(new Error("content_unavailable"));
    categories.mockResolvedValue([]);
    await expect(loadBlogListing()).rejects.toThrow("content_unavailable");
  });
  it("accepts a genuinely empty published collection", async () => {
    posts.mockResolvedValue([]);
    categories.mockResolvedValue([]);
    expect(await loadBlogListing()).toEqual({ posts: [], categories: [] });
  });
});
