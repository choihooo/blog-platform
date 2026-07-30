import { describe, expect, it } from "vitest";

import {
  archivePostAction,
  createPreviewTokenAction,
  publishPostAction,
  retryPublicRefreshAction,
  saveEditorDraftAction,
  unpublishPostAction,
  uploadEditorMediaAction,
} from "./editor-actions";
import { createEmptyEditorDocument } from "@blog-platform/editor";

describe("editor actions", () => {
  it("exports the save action", () => {
    expect(typeof saveEditorDraftAction).toBe("function");
    expect(typeof uploadEditorMediaAction).toBe("function");
    expect(typeof publishPostAction).toBe("function");
    expect(typeof unpublishPostAction).toBe("function");
    expect(typeof archivePostAction).toBe("function");
    expect(typeof retryPublicRefreshAction).toBe("function");
    expect(typeof createPreviewTokenAction).toBe("function");
  });

  it("issues preview URLs without exposing the preview secret", async () => {
    process.env.PREVIEW_TOKEN_SECRET = "preview-secret";
    const document = {
      ...createEmptyEditorDocument(new Date("2026-07-30T00:00:00.000Z")),
      id: "draft",
      frontmatter: {
        ...createEmptyEditorDocument().frontmatter,
        title: "Draft",
        slug: "draft",
        status: "draft" as const,
      },
      body: [{ type: "paragraph" as const, text: "Draft body" }],
    };

    const result = await createPreviewTokenAction({ document });

    expect(result.ok).toBe(true);
    expect(JSON.stringify(result)).not.toContain("preview-secret");
  });
});
