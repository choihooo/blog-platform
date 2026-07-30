import { describe, expect, it, vi } from "vitest";
import { createEmptyEditorDocument } from "@blog-platform/editor";

import type { ContentAdapter } from "../content-adapter/index";
import { mapAuthFailure, saveEditorDraft } from "./editor-save";

function document() {
  const doc = createEmptyEditorDocument();
  doc.frontmatter.title = "Hello World";
  doc.body = [{ type: "paragraph", text: "Body" }];
  return doc;
}

describe("editor-save", () => {
  it("creates new drafts and updates existing drafts with expected SHA", async () => {
    const createFile = vi.fn(async () => ({
      success: true as const,
      data: {
        path: "content/posts/hello-world.mdx",
        sha: "new",
        status: "created" as const,
        summary: "ok",
      },
    }));
    await expect(
      saveEditorDraft(document(), { createFile, updateFile: vi.fn() }),
    ).resolves.toMatchObject({
      ok: true,
      path: "content/posts/hello-world.mdx",
    });
    expect(createFile).toHaveBeenCalledWith(expect.objectContaining({ intent: "create-draft" }));

    const existing = { ...document(), path: "content/posts/hello-world.mdx", sourceSha: "old" };
    const updateFile: ContentAdapter["updateFile"] = vi.fn(async () => ({
      success: true as const,
      data: { path: existing.path, sha: "newer", status: "updated" as const, summary: "ok" },
    }));
    await saveEditorDraft(existing, { createFile: vi.fn(), updateFile });
    expect(updateFile).toHaveBeenCalledWith(
      expect.objectContaining({ expectedSha: "old", intent: "save-draft" }),
    );
  });

  it("preserves submitted content on failures", async () => {
    await expect(
      saveEditorDraft(document(), {
        createFile: vi.fn(async () => ({
          success: false as const,
          error: {
            code: "stale-file" as const,
            message: "stale",
            retryable: false,
            submittedContent: "x",
          },
        })),
        updateFile: vi.fn(),
      }),
    ).resolves.toMatchObject({
      ok: false,
      code: "stale-file",
      submittedDocument: expect.any(Object),
    });
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
