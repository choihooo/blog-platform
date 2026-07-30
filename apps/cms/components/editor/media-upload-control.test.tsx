import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { MediaUploadControl } from "./media-upload-control";

vi.mock("../../app/actions/editor-actions", () => ({
  uploadEditorMediaAction: vi.fn(),
}));

describe("MediaUploadControl", () => {
  it("renders an accessible image upload button", () => {
    render(<MediaUploadControl onUploaded={vi.fn()} postSlug="hello" />);
    expect(screen.getByRole("button", { name: "Upload image" })).toBeTruthy();
  });
});
