import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createElement } from "react";
import { describe, expect, it, vi } from "vitest";
import { createEmptyEditorDocument } from "@blog-platform/editor";

import { saveEditorDraftAction } from "../../app/actions/editor-actions";
import { EditorScreen } from "./editor-screen";

vi.mock("../../app/actions/editor-actions", () => ({
  saveEditorDraftAction: vi.fn(),
}));

describe("editor save flow", () => {
  it("shows saved state after successful save", async () => {
    vi.mocked(saveEditorDraftAction).mockResolvedValue({
      ok: true,
      path: "db/posts/a",
      sha: "sha",
      backupCleared: true,
    });
    const doc = createEmptyEditorDocument();
    doc.frontmatter.title = "A";
    render(createElement(EditorScreen, { initialDocument: doc }));
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() => expect(screen.getByText("Saved")).toBeTruthy());
  });
});
