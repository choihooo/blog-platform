import { createEmptyEditorDocument } from "@blog-platform/core/content";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createElement } from "react";
import { describe, expect, it, vi } from "vitest";
import { testEditorCommands } from "../../../test-utils/editor-commands";

import { saveEditorDraftAction } from "../../../app/actions/editor-actions";
import { EditorScreen } from "./editor-screen";

vi.mock("../../../app/actions/editor-actions", () => ({
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
    render(createElement(EditorScreen, { commands: testEditorCommands, initialDocument: doc }));
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() => expect(screen.getByText("Saved")).toBeTruthy());
  });
  it("keeps newer title edits when an earlier save finishes", async () => {
    let complete!: (value: Awaited<ReturnType<typeof saveEditorDraftAction>>) => void;
    vi.mocked(saveEditorDraftAction).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          complete = resolve;
        }),
    );
    const doc = createEmptyEditorDocument();
    doc.frontmatter.title = "Before save";
    render(createElement(EditorScreen, { commands: testEditorCommands, initialDocument: doc }));
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    fireEvent.change(screen.getByLabelText("Title"), { target: { value: "Newer title" } });
    await act(async () => {
      complete({ ok: true, path: "db/posts/before-save", sha: "sha", backupCleared: true });
    });
    expect((screen.getByLabelText("Title") as HTMLInputElement).value).toBe("Newer title");
  });
});
