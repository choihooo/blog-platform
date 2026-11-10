import { afterEach, beforeEach, expect, it, vi } from "vitest";
const { sync } = vi.hoisted(() => ({ sync: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn(), revalidateTag: vi.fn() }));
vi.mock("@/features/rag/server", () => ({ syncPost: sync }));
vi.mock("@/features/blog/server/content-source", () => ({
  blogContentCacheTags: { posts: "posts", categories: "categories" },
}));
import { POST } from "./route";
const request = (body: string) =>
  new Request("http://blog.test/api/revalidate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });
beforeEach(() => {
  vi.stubEnv("BLOG_REVALIDATE_SECRET", "fixture");
  vi.stubEnv("RAG_API_URL", "https://worker.test");
});
afterEach(() => {
  vi.resetAllMocks();
  vi.unstubAllEnvs();
});
it.each([
  ["{", 400],
  [JSON.stringify({ secret: "wrong", path: "/blog" }), 401],
  [JSON.stringify({ secret: "fixture", path: "//other.test" }), 400],
])("preserves validation status for %s", async (body, status) => {
  expect((await POST(request(body))).status).toBe(status);
  expect(sync).not.toHaveBeenCalled();
});
it("reports missing server configuration", async () => {
  vi.stubEnv("BLOG_REVALIDATE_SECRET", "");
  expect((await POST(request("{}"))).status).toBe(500);
});
it("keeps cache success visible when RAG sync fails", async () => {
  sync.mockRejectedValue(new Error("unavailable"));
  const response = await POST(request(JSON.stringify({ secret: "fixture", path: "/blog/a" })));
  expect(response.status).toBe(502);
  expect(await response.json()).toMatchObject({ ok: false, revalidated: true });
});
it("returns the current successful response", async () => {
  const response = await POST(request(JSON.stringify({ secret: "fixture", path: "/blog/a" })));
  expect(response.status).toBe(200);
  expect(await response.json()).toMatchObject({
    ok: true,
    path: "/blog/a",
    revalidatedAt: expect.any(String),
  });
});
