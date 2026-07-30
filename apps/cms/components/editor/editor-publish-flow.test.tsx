import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createElement } from "react";
import { describe, expect, it, vi } from "vitest";
import { createEmptyEditorDocument } from "@blog-platform/editor";

import { publishPostAction } from "../../app/actions/editor-actions";
import { EditorScreen } from "./editor-screen";

vi.mock("../../app/actions/editor-actions", () => ({
  archivePostAction: vi.fn(),
  publishPostAction: vi.fn(),
  retryPublicRefreshAction: vi.fn(),
  saveEditorDraftAction: vi.fn(),
  unpublishPostAction: vi.fn(),
  uploadEditorMediaAction: vi.fn(),
}));

describe("editor publish flow", () => {
  it("shows published state after successful publish", async () => {
    const doc = createEmptyEditorDocument();
    doc.frontmatter.title = "A";
    doc.frontmatter.author = "ho";
    doc.body = [{ type: "paragraph", text: "Body" }];
    vi.mocked(publishPostAction).mockResolvedValue({
      ok: true,
      operation: "publish",
      path: "content/posts/a.mdx",
      sha: "sha",
      slug: "a",
      publishedAt: "2026-07-30",
      repository: { ok: true, summary: "post(a): publish" },
      publicRefresh: { ok: true, targets: ["/"], refreshedAt: "2026-07-30" },
      backupCleared: true,
      document: {
        ...doc,
        path: "content/posts/a.mdx",
        sourceSha: "sha",
        frontmatter: { ...doc.frontmatter, status: "published", slug: "a" },
        dirty: false,
      },
    });

    render(createElement(EditorScreen, { initialDocument: doc }));
    fireEvent.click(screen.getByRole("button", { name: "Publish" }));
    await waitFor(() => expect(screen.getByText("Published")).toBeTruthy());
  });
});
