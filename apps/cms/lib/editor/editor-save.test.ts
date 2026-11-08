import { describe, expect, it, vi } from "vitest";
import { createEmptyEditorDocument } from "@blog-platform/core/content";

import type { ContentAdapter, PostRecord } from "@blog-platform/core/content";
import { mapAuthFailure, saveEditorDraft } from "./editor-save";

function document() {
  const doc = createEmptyEditorDocument(new Date("2026-08-01T00:00:00.000Z"));
  doc.frontmatter.title = "Hello World";
  doc.body = [{ type: "paragraph", text: "Body" }];
  return doc;
}

function adapter(existing?: PostRecord | null) {
  return {
    getPostBySlug: vi.fn(async () => ({ ok: true as const, data: existing ?? null })),
    createPost: vi.fn(async ({ post }) => ({
      ok: true as const,
      data: { ...post, updatedAt: "2026-08-01T01:00:00.000Z" },
    })),
    updatePost: vi.fn(async ({ post }) => ({
      ok: true as const,
      data: { ...(existing as PostRecord), ...post, updatedAt: "2026-08-01T01:00:00.000Z" },
    })),
  } satisfies Pick<ContentAdapter, "createPost" | "updatePost" | "getPostBySlug">;
}

describe("editor-save", () => {
  it("rejects invalid nested content before touching storage", async () => {
    const doc = document();
    doc.body = [
      {
        type: "table",
        rows: [
          [
            {
              body: [
                {
                  type: "paragraph",
                  text: "bad",
                  content: [{ text: "bad", href: "javascript:alert(1)" }],
                },
              ],
            },
          ],
        ],
      },
    ];
    const api = adapter();
    expect(await saveEditorDraft(doc, api)).toMatchObject({
      ok: false,
      code: "validation-failure",
    });
    expect(api.createPost).not.toHaveBeenCalled();
    expect(api.updatePost).not.toHaveBeenCalled();
  });
  it("creates new drafts as structured JSON posts", async () => {
    const api = adapter();
    await expect(saveEditorDraft(document(), api)).resolves.toMatchObject({
      ok: true,
      path: "db/posts/hello-world",
      slug: "hello-world",
    });
    expect(api.createPost).toHaveBeenCalledWith(
      expect.objectContaining({
        post: expect.objectContaining({
          slug: "hello-world",
          content: expect.stringContaining('"version":1'),
        }),
      }),
    );
  });

  it("updates existing drafts", async () => {
    const existing: PostRecord = {
      id: "post_hello",
      slug: "hello-world",
      title: "Hello World",
      content: '{"version":1,"nodes":[]}',
      summary: "",
      categoryId: null,
      categoryPath: null,
      heroImageKey: null,
      publishedAt: null,
      updatedAt: "2026-08-01T00:00:00.000Z",
      isPublished: 0,
      viewCount: 0,
      tags: [],
      mediaRefs: [],
    };
    const api = adapter(existing);
    const existingDocument = { ...document(), path: "db/posts/hello-world", sourceSha: "old" };

    await saveEditorDraft(existingDocument, api);

    expect(api.updatePost).toHaveBeenCalledWith(
      expect.objectContaining({
        slug: "hello-world",
        post: expect.objectContaining({ id: "post_hello" }),
      }),
    );
  });

  it("maps auth failures", () => {
    expect(
      mapAuthFailure(document(), { code: "session-expired", message: "expired", retryable: true }),
    ).toMatchObject({
      ok: false,
      code: "session-expired",
      retryable: true,
    });
  });
});
