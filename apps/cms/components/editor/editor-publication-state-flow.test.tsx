import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createElement } from "react";
import { describe, expect, it, vi } from "vitest";
import { createEmptyEditorDocument } from "@blog-platform/core/content";

import { archivePostAction, unpublishPostAction } from "../../app/actions/editor-actions";
import { EditorScreen } from "./editor-screen";

vi.mock("../../app/actions/editor-actions", () => ({
  archivePostAction: vi.fn(),
  publishPostAction: vi.fn(),
  retryPublicRefreshAction: vi.fn(),
  saveEditorDraftAction: vi.fn(),
  unpublishPostAction: vi.fn(),
  uploadEditorMediaAction: vi.fn(),
}));

function publishedDoc() {
  const doc = createEmptyEditorDocument();
  doc.path = "db/posts/a";
  doc.sourceSha = "sha";
  doc.frontmatter = {
    title: "A",
    status: "published",
    slug: "a",
    author: "ho",
    publishedAt: "2026-07-30",
  };
  doc.body = [{ type: "paragraph", text: "Body" }];
  return doc;
}

describe("editor publication state flow", () => {
  it("runs unpublish and archive actions", async () => {
    const doc = publishedDoc();
    const result = {
      ok: true as const,
      operation: "unpublish" as const,
      path: doc.path!,
      sha: "new-sha",
      repository: { ok: true as const, summary: "post(a): unpublish" },
      publicRefresh: { ok: true as const, targets: ["/"], refreshedAt: "2026-07-30" },
      backupCleared: true as const,
      document: { ...doc, frontmatter: { ...doc.frontmatter, status: "draft" as const } },
    };
    vi.mocked(unpublishPostAction).mockResolvedValue(result);
    vi.mocked(archivePostAction).mockResolvedValue({
      ...result,
      operation: "archive",
      document: { ...doc, frontmatter: { ...doc.frontmatter, status: "archived" as const } },
    });

    render(createElement(EditorScreen, { initialDocument: doc }));
    fireEvent.click(screen.getByRole("button", { name: "Unpublish" }));
    await waitFor(() => expect(unpublishPostAction).toHaveBeenCalled());
    fireEvent.click(screen.getByRole("button", { name: "Archive" }));
    await waitFor(() => expect(archivePostAction).toHaveBeenCalled());
  });
});
