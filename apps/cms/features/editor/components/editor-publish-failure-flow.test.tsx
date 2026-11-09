import { createEmptyEditorDocument } from "@blog-platform/core/content";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createElement } from "react";
import { describe, expect, it, vi } from "vitest";
import { testEditorCommands } from "../../../test-utils/editor-commands";

import {
  publishPostAction,
  retryPublicRefreshAction,
  saveEditorDraftAction,
} from "../../../app/actions/editor-actions";
import { EditorScreen } from "./editor-screen";

vi.mock("../../../app/actions/editor-actions", () => ({
  archivePostAction: vi.fn(),
  publishPostAction: vi.fn(),
  retryPublicRefreshAction: vi.fn(),
  saveEditorDraftAction: vi.fn(),
  unpublishPostAction: vi.fn(),
  uploadEditorMediaAction: vi.fn(),
}));

describe("editor publish failure flow", () => {
  it("keeps edit state and retries public refresh after partial success", async () => {
    const doc = createEmptyEditorDocument();
    doc.frontmatter.title = "A";
    doc.frontmatter.author = "ho";
    doc.body = [{ type: "paragraph", text: "Body" }];
    vi.mocked(publishPostAction).mockResolvedValue({
      ok: false,
      operation: "publish",
      code: "public-refresh-failed",
      retryable: true,
      message: "Public refresh failed",
      path: "db/posts/a",
      sha: "sha",
      repository: { ok: true, summary: "post(a): publish" },
      publicRefresh: {
        ok: false,
        targets: ["/"],
        failedTargets: ["/"],
        message: "Public refresh failed",
        retryable: true,
      },
      retryToken: {
        operation: "publish",
        targets: ["/"],
        postPath: "db/posts/a",
        postSha: "sha",
        issuedAt: "2026-07-30",
      },
      document: doc,
    });
    vi.mocked(retryPublicRefreshAction).mockResolvedValue({
      ok: true,
      operation: "retry-public-refresh",
      publicRefresh: { ok: true, targets: ["/"], refreshedAt: "2026-07-30" },
    });

    render(createElement(EditorScreen, { commands: testEditorCommands, initialDocument: doc }));
    fireEvent.click(screen.getByRole("button", { name: "Publish" }));
    await waitFor(() => expect(screen.getByText("Public refresh failed")).toBeTruthy());
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    await waitFor(() => expect(retryPublicRefreshAction).toHaveBeenCalled());
    expect(retryPublicRefreshAction).toHaveBeenCalledWith({
      retryToken: {
        operation: "publish",
        targets: ["/"],
        postPath: "db/posts/a",
        postSha: "sha",
        issuedAt: "2026-07-30",
      },
    });
    expect(publishPostAction).toHaveBeenCalledTimes(1);
    expect(saveEditorDraftAction).not.toHaveBeenCalled();
  });
});
