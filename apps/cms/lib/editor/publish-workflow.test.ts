import { describe, expect, it, vi } from "vitest";
import {
  createEmptyEditorDocument,
  serializePostContent,
  type EditorDocument,
} from "@blog-platform/editor";

import type { ContentAdapter, PostRecord } from "../content-adapter/content-adapter.interface";
import { runPublicationOperation } from "./publish-workflow";

function document(overrides: Partial<EditorDocument> = {}) {
  const doc = createEmptyEditorDocument(new Date("2026-07-30T00:00:00.000Z"));
  doc.frontmatter = { title: "Hello World", status: "draft", author: "ho" };
  doc.body = [{ type: "paragraph", text: "Body" }];
  return { ...doc, ...overrides };
}

function post(overrides: Partial<PostRecord> = {}): PostRecord {
  return {
    id: "post_hello",
    slug: "hello-world",
    title: "Hello World",
    content: serializePostContent({
      version: 1,
      nodes: [{ type: "paragraph", text: "Body" }],
    }),
    summary: "Body",
    categoryId: null,
    categoryPath: null,
    heroImageKey: null,
    publishedAt: null,
    updatedAt: "2026-07-30T00:00:00.000Z",
    isPublished: 0,
    viewCount: 0,
    tags: [],
    mediaRefs: [],
    ...overrides,
  };
}

function adapter(existing: PostRecord[] = []) {
  const writes: PostRecord[] = [];
  const api = {
    writes,
    getPostBySlug: vi.fn(async (slug: string) => ({
      ok: true as const,
      data: existing.find((item) => item.slug === slug) ?? null,
    })),
    createPost: vi.fn(async ({ post }) => {
      writes.push(post);
      return { ok: true as const, data: { ...post, updatedAt: "2026-07-30T01:00:00.000Z" } };
    }),
    updatePost: vi.fn(async ({ post }) => {
      writes.push(post as PostRecord);
      return { ok: true as const, data: { ...post, updatedAt: "2026-07-30T01:00:00.000Z" } };
    }),
  } satisfies Pick<ContentAdapter, "createPost" | "updatePost" | "getPostBySlug"> & {
    writes: PostRecord[];
  };
  return api;
}

describe("publish workflow", () => {
  it("publishes with slug and publishedAt", async () => {
    const api = adapter();
    const result = await runPublicationOperation({
      operation: "publish",
      document: document(),
      adapter: api,
      now: new Date("2026-07-30T01:00:00.000Z"),
    });
    expect(result.ok).toBe(true);
    expect(result.slug).toBe("hello-world");
    expect(result.publishedAt).toBe("2026-07-30T01:00:00.000Z");
    expect(api.writes[0]).toMatchObject({ isPublished: 1, slug: "hello-world" });
  });

  it("blocks duplicate slugs without writing", async () => {
    const api = adapter([
      post({ id: "post_current", slug: "draft", title: "Draft" }),
      post({ id: "post_other", slug: "hello-world", title: "Other" }),
    ]);
    const result = await runPublicationOperation({
      operation: "publish",
      document: document({ path: "db/posts/draft" }),
      adapter: api,
    });
    if (result.ok) throw new Error("expected duplicate slug failure");
    expect(result.code).toBe("duplicate-slug");
    expect(api.writes).toHaveLength(0);
  });

  it("unpublishes and archives with matching statuses", async () => {
    const published = document({
      path: "db/posts/hello-world",
      sourceSha: "sha",
      frontmatter: {
        title: "Hello World",
        status: "published",
        slug: "hello-world",
        author: "ho",
        publishedAt: "2026-07-30",
      },
    });
    const unpublishAdapter = adapter([post({ isPublished: 1, publishedAt: "2026-07-30" })]);
    await runPublicationOperation({
      operation: "unpublish",
      document: published,
      adapter: unpublishAdapter,
    });
    expect(unpublishAdapter.writes[0]?.isPublished).toBe(0);
    expect(unpublishAdapter.writes[0]?.publishedAt).toBeNull();

    const archiveAdapter = adapter([post({ isPublished: 1, publishedAt: "2026-07-30" })]);
    await runPublicationOperation({
      operation: "archive",
      document: published,
      adapter: archiveAdapter,
    });
    expect(archiveAdapter.writes[0]?.isPublished).toBe(0);
  });
});
