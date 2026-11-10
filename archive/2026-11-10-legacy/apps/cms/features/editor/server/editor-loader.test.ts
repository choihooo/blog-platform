import { serializePostContent } from "@blog-platform/core/content";
import { describe, expect, it, vi } from "vitest";

import type { ContentAdapter, PostRecord } from "@blog-platform/core/content";
import { createNewEditorDocument, loadEditorDocument } from "./editor-loader";

function post(overrides: Partial<PostRecord> = {}): PostRecord {
  return {
    id: "post_a",
    slug: "a",
    title: "A",
    content: serializePostContent({
      version: 1,
      nodes: [{ type: "paragraph", text: "Body" }],
    }),
    summary: "Body",
    categoryId: null,
    categoryPath: null,
    heroImageKey: null,
    publishedAt: null,
    updatedAt: "2026-08-01T00:00:00.000Z",
    isPublished: 0,
    viewCount: 0,
    tags: [],
    mediaRefs: [],
    ...overrides,
  };
}

function adapter(posts: PostRecord[]): ContentAdapter {
  return {
    listPosts: vi.fn(async () => ({
      ok: true as const,
      data: { items: posts, total: posts.length },
    })),
    getPostBySlug: vi.fn(async (slug: string) => ({
      ok: true as const,
      data: posts.find((item) => item.slug === slug) ?? null,
    })),
    getPostsByTag: vi.fn(),
    getPostsByCategoryPath: vi.fn(),
    listCategories: vi.fn(),
    listTags: vi.fn(),
    createCategory: vi.fn(),
    updateCategory: vi.fn(),
    deleteCategory: vi.fn(),
    createTag: vi.fn(),
    createPost: vi.fn(),
    updatePost: vi.fn(),
    deletePost: vi.fn(),
    upsertMediaRef: vi.fn(),
    deleteMediaRef: vi.fn(),
  };
}

describe("editor-loader", () => {
  it("creates empty draft documents", () => {
    expect(createNewEditorDocument().frontmatter.status).toBe("draft");
  });

  it("loads supported JSON documents", async () => {
    await expect(loadEditorDocument("db/posts/a", adapter([post()]))).resolves.toMatchObject({
      ok: true,
      document: {
        frontmatter: { title: "A", status: "draft", slug: "a" },
        body: [{ type: "paragraph", text: "Body" }],
      },
    });
  });
});
