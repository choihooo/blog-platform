import { render, screen } from "@testing-library/react";
import { createEmptyEditorDocument } from "@blog-platform/core/content";
import { describe, expect, it, vi } from "vitest";

import { EditorScreen } from "./editor-screen";

vi.mock("../../app/actions/editor-actions", () => ({
  saveEditorDraftAction: vi.fn(),
  uploadEditorMediaAction: vi.fn(),
}));

describe("EditorScreen cover media flow", () => {
  it("shows cover upload in frontmatter panel", () => {
    const doc = createEmptyEditorDocument();
    doc.frontmatter.title = "Hello";
    render(<EditorScreen initialDocument={doc} />);
    expect(screen.getByRole("button", { name: "Upload cover" })).toBeTruthy();
  });
});
