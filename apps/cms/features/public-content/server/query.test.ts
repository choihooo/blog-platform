import type { ContentAdapter } from "@blog-platform/core/content";
import { expect, it, vi } from "vitest";
import { queryPublicContent } from "./query";
it("caps public pagination and preserves filters and cache headers", async () => {
  const listPosts = vi.fn(async () => ({ ok: true, data: { items: [], total: 0 } }));
  const listCategories = vi.fn(async () => ({ ok: true, data: { items: [] } }));
  const result = await queryPublicContent(
    new URL("https://cms.test/api/public-content?page=2&limit=999&category=dev&tag=ts&query=hello"),
    { listPosts, listCategories } as unknown as ContentAdapter,
  );
  expect(result.status).toBe(200);
  expect(result.headers).toEqual({
    "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
  });
  expect(listPosts).toHaveBeenCalledWith({
    publishedOnly: true,
    page: 2,
    limit: 100,
    categoryPath: "dev",
    tagSlug: "ts",
    query: "hello",
    includeTotal: true,
    includeTags: true,
    includeMedia: true,
  });
  expect(result.body).toEqual({ posts: [], total: 0, categories: [] });
});
it("returns upstream failure without a success cache policy", async () => {
  const getPostBySlug = vi.fn(async () => ({ ok: false, error: { code: "storage-failure" } }));
  const result = await queryPublicContent(new URL("https://cms.test/api/public-content?slug=a"), {
    getPostBySlug,
  } as unknown as ContentAdapter);
  expect(result.status).toBe(502);
  expect(result.body).toEqual({ error: "upstream_failure" });
  expect(result.headers).toBeUndefined();
});
