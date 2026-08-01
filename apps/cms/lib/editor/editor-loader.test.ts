import { describe, expect, it, vi } from "vitest";
import { serializePostContent } from "@blog-platform/editor";

import type { ContentAdapter, PostRecord } from "../content-adapter/content-adapter.interface";
import { createNewEditorDocument, listPostSummaries, loadEditorDocument } from "./editor-loader";

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

  it("lists post summaries from DB records", async () => {
    const posts = await listPostSummaries(adapter([post()]));
    expect(posts).toEqual([
      {
        path: "db/posts/a",
        slug: "a",
        title: "A",
        status: "draft",
        sha: "2026-08-01T00:00:00.000Z:a",
        publishedAt: null,
        updatedAt: "2026-08-01T00:00:00.000Z",
      },
    ]);
  });

  it("sorts summaries by published or updated date", async () => {
    const contentAdapter = adapter([
      post({
        slug: "old",
        title: "Old",
        isPublished: 1,
        publishedAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-12-01T00:00:00.000Z",
      }),
      post({
        slug: "new",
        title: "New",
        isPublished: 1,
        publishedAt: "2026-06-01T00:00:00.000Z",
        updatedAt: "2026-06-01T00:00:00.000Z",
      }),
    ]);

    await expect(listPostSummaries(contentAdapter, { sort: "published" })).resolves.toMatchObject([
      { slug: "new" },
      { slug: "old" },
    ]);
    await expect(listPostSummaries(contentAdapter, { sort: "updated" })).resolves.toMatchObject([
      { slug: "old" },
      { slug: "new" },
    ]);
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
