import { beforeEach, describe, expect, it, vi } from "vitest";

const { getPostBySlug } = vi.hoisted(() => ({ getPostBySlug: vi.fn() }));
vi.mock("@blog-platform/core/storage", () => ({
  createContentAdapter: () => ({ getPostBySlug }),
}));

import { GET } from "./route";

describe("public content by slug", () => {
  beforeEach(() => vi.clearAllMocks());

  it("hides an unpublished post from unauthenticated readers", async () => {
    getPostBySlug.mockResolvedValue({
      ok: true,
      data: { slug: "private-draft", isPublished: 0, content: "private body" },
    });
    const response = await GET(
      new Request("https://cms.example/api/public-content?slug=private-draft"),
    );
    expect(response.status).toBe(404);
    expect(await response.text()).not.toContain("private body");
  });

  it("preserves the public URL and payload for a published post", async () => {
    const post = { slug: "public-post", isPublished: 1, content: "public body" };
    getPostBySlug.mockResolvedValue({ ok: true, data: post });
    const response = await GET(
      new Request("https://cms.example/api/public-content?slug=public-post"),
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ post });
  });
});
