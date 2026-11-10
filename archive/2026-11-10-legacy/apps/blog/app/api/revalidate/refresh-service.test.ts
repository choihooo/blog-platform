import { afterEach, expect, it, vi } from "vitest";
const { path, tag, sync } = vi.hoisted(() => ({ path: vi.fn(), tag: vi.fn(), sync: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: path, revalidateTag: tag }));
vi.mock("@/features/rag/server", () => ({ syncPost: sync }));
vi.mock("@/features/blog/server/content-source", () => ({
  blogContentCacheTags: { posts: "posts", categories: "categories" },
}));
import { refreshPublicPath } from "./refresh-service";
afterEach(() => {
  vi.resetAllMocks();
  vi.unstubAllEnvs();
});
it("refreshes canonical and rewritten paths, distinguishing a sync failure", async () => {
  vi.stubEnv("RAG_API_URL", "https://worker.test");
  sync.mockRejectedValue(new Error("sync"));
  expect(await refreshPublicPath("/blog/hello")).toEqual({
    revalidated: true,
    ragSyncFailed: true,
  });
  expect(path.mock.calls).toEqual([["/blog/hello"], ["/posts/hello"]]);
  expect(tag.mock.calls).toEqual([
    ["posts", "max"],
    ["categories", "max"],
  ]);
});
it("does not sync collection paths or mask a cache failure", async () => {
  vi.stubEnv("RAG_API_URL", "https://worker.test");
  expect(await refreshPublicPath("/blog")).toEqual({ revalidated: true, ragSyncFailed: false });
  expect(sync).not.toHaveBeenCalled();
  path.mockImplementation(() => {
    throw new Error("cache failed");
  });
  await expect(refreshPublicPath("/blog/a")).rejects.toThrow("cache failed");
});
it("skips sync when the Worker is not configured", async () => {
  vi.stubEnv("RAG_API_URL", "");
  expect(await refreshPublicPath("/blog/a")).toEqual({ revalidated: true, ragSyncFailed: false });
  expect(sync).not.toHaveBeenCalled();
});
