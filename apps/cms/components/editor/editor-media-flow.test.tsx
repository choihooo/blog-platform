import { render, screen } from "@testing-library/react";
import { createEmptyEditorDocument } from "@blog-platform/editor";
import { describe, expect, it, vi } from "vitest";

import { EditorScreen } from "./editor-screen";

vi.mock("../../app/actions/editor-actions", () => ({
  saveEditorDraftAction: vi.fn(),
  uploadEditorMediaAction: vi.fn(),
}));

describe("EditorScreen body media flow", () => {
  it("shows image upload entrypoint without persisting temporary URLs", () => {
    const doc = createEmptyEditorDocument();
    doc.frontmatter.title = "Hello";
    render(<EditorScreen initialDocument={doc} />);
    expect(screen.getByRole("button", { name: "Upload image" })).toBeTruthy();
    expect(screen.queryByText(/blob:/)).toBeNull();
  });
});
