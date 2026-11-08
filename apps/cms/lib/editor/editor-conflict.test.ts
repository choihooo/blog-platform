import { describe, expect, it, vi } from "vitest";
import { createEmptyEditorDocument } from "@blog-platform/core/content";

import { saveEditorDraft } from "./editor-save";

describe("editor conflicts", () => {
  it("keeps submitted document on duplicate slug failures", async () => {
    const doc = createEmptyEditorDocument();
    doc.frontmatter.title = "Conflict";
    doc.body = [{ type: "paragraph", text: "Body" }];
    const result = await saveEditorDraft(doc, {
      getPostBySlug: vi.fn(async () => ({ ok: true as const, data: null })),
      createPost: vi.fn(async () => ({
        ok: false as const,
        error: {
          code: "conflict" as const,
          message: "duplicate",
          retryable: false,
        },
      })),
      updatePost: vi.fn(),
    });

    expect(result).toMatchObject({ ok: false, code: "stale-file", submittedDocument: doc });
  });
});
