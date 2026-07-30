import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createElement } from "react";
import { describe, expect, it, vi } from "vitest";
import { createEmptyEditorDocument } from "@blog-platform/editor";

import { saveEditorDraftAction } from "../../app/actions/editor-actions";
import { EditorScreen } from "./editor-screen";

vi.mock("../../app/actions/editor-actions", () => ({
  saveEditorDraftAction: vi.fn(),
}));

describe("editor failure flow", () => {
  it("keeps failure message and retry action", async () => {
    const doc = createEmptyEditorDocument();
    doc.frontmatter.title = "A";
    vi.mocked(saveEditorDraftAction).mockResolvedValue({
      ok: false,
      code: "temporary-connectivity",
      retryable: true,
      message: "try again",
      submittedDocument: doc,
    });
    render(createElement(EditorScreen, { initialDocument: doc }));
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() => expect(screen.getByText("try again")).toBeTruthy());
    expect(screen.getByRole("button", { name: "Retry" })).toBeTruthy();
  });
});
