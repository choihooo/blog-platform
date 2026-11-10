import { afterEach, expect, it, vi } from "vitest";
const { search } = vi.hoisted(() => ({ search: vi.fn(async () => []) }));
vi.mock("@/features/blog/server/content-source", () => ({ searchPosts: search }));
import { GET } from "./route";
afterEach(() => vi.clearAllMocks());
it("keeps an empty query cacheable without querying storage", async () => {
  const response = await GET(new Request("http://blog.test/api/search?q=%20"));
  expect(await response.json()).toEqual({ items: [], total: 0, query: "" });
  expect(response.headers.get("cache-control")).toBe(
    "public, s-maxage=60, stale-while-revalidate=300",
  );
  expect(search).not.toHaveBeenCalled();
});
it.each([
  [
    "?q=%20React%20&page=-1&limit=0",
    { query: "React", page: 1, limit: 20, categoryPath: undefined },
  ],
  [
    "?q=React&page=2.8&limit=1000&category=dev",
    { query: "React", page: 2, limit: 100, categoryPath: "dev" },
  ],
])("preserves query normalization for %s", async (query, expected) => {
  const response = await GET(new Request("http://blog.test/api/search" + query));
  expect(response.status).toBe(200);
  expect(search).toHaveBeenCalledWith(expected);
});
