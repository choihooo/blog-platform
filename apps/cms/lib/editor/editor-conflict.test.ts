import { describe, expect, it, vi } from "vitest";
import { createEmptyEditorDocument } from "@blog-platform/editor";

import { saveEditorDraft } from "./editor-save";

describe("editor conflicts", () => {
  it("keeps submitted document on stale SHA", async () => {
    const doc = createEmptyEditorDocument();
    doc.frontmatter.title = "Conflict";
    doc.path = "content/posts/conflict.mdx";
    doc.sourceSha = "old";
    const result = await saveEditorDraft(doc, {
      createFile: vi.fn(),
      updateFile: vi.fn(async () => ({
        success: false as const,
        error: {
          code: "stale-file" as const,
          message: "stale",
          retryable: false,
          submittedContent: "submitted",
        },
      })),
    });
    expect(result).toMatchObject({ ok: false, code: "stale-file", submittedDocument: doc });
  });
});
