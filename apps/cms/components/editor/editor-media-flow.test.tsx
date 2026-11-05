import { createEvent, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createEmptyEditorDocument } from "@blog-platform/editor";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { uploadEditorMediaAction } from "../../app/actions/editor-actions";
import { EditorScreen } from "./editor-screen";

vi.mock("../../app/actions/editor-actions", () => ({
  saveEditorDraftAction: vi.fn(),
  uploadEditorMediaAction: vi.fn(),
}));

describe("EditorScreen body media flow", () => {
  beforeEach(() => {
    vi.mocked(uploadEditorMediaAction).mockReset();
  });

  it("shows image upload entrypoint without persisting temporary URLs", () => {
    const doc = createEmptyEditorDocument();
    doc.frontmatter.title = "Hello";
    render(<EditorScreen initialDocument={doc} />);
    expect(screen.getByRole("button", { name: "Upload image" })).toBeTruthy();
    expect(screen.queryByText(/blob:/)).toBeNull();
  });

  it("uploads pasted clipboard images into the body", async () => {
    vi.mocked(uploadEditorMediaAction).mockResolvedValueOnce({
      ok: true,
      media: {
        path: "media/posts/hello/pasted.webp",
        publicPath: "/media/posts/hello/pasted.webp",
        sha: "sha",
        sizeBytes: 123,
      },
      reference: {
        target: "body",
        node: {
          type: "image",
          src: "/media/posts/hello/pasted.webp",
          alt: "clipboard-image",
          caption: "Uploaded caption",
        },
      },
      message: "Image uploaded",
    });

    const doc = createEmptyEditorDocument();
    doc.frontmatter.title = "Hello";
    doc.frontmatter.slug = "hello";
    render(<EditorScreen initialDocument={doc} />);

    const editor = screen.getAllByRole("textbox", { name: "Post body" })[0];
    expect(editor).toBeTruthy();
    const file = new File(["image"], "", { type: "image/png" });
    const paste = createEvent.paste(editor!);
    Object.defineProperty(paste, "clipboardData", {
      value: {
        files: [file],
        getData: vi.fn(() => ""),
        items: [],
      },
    });
    fireEvent(editor!, paste);

    await waitFor(() => {
      expect(uploadEditorMediaAction).toHaveBeenCalledWith(expect.any(FormData));
    });
    const formData = vi.mocked(uploadEditorMediaAction).mock.calls[0]?.[0] as FormData;
    expect(formData.get("target")).toBe("body");
    expect(formData.get("postSlug")).toBe("hello");
    expect((formData.get("file") as File).name).toBe("clipboard-image.png");
    await waitFor(() => {
      expect(
        screen.getByText("Image uploaded. Save the post to keep this reference."),
      ).toBeTruthy();
    });
    expect(editor!.querySelector("figcaption")?.textContent).toBe("Uploaded caption");
  });

  it("blocks pasted attachment-only body images", () => {
    const doc = createEmptyEditorDocument();
    doc.frontmatter.title = "Hello";
    doc.frontmatter.slug = "hello";
    render(<EditorScreen initialDocument={doc} />);

    const editor = screen.getAllByRole("textbox", { name: "Post body" })[0];
    const paste = createEvent.paste(editor!);
    Object.defineProperty(paste, "clipboardData", {
      value: {
        files: [],
        getData: vi.fn((type: string) =>
          type === "text/html" ? '<img src="attachment:abc:image.png">' : "",
        ),
        items: [],
      },
    });
    fireEvent(editor!, paste);

    expect(uploadEditorMediaAction).not.toHaveBeenCalled();
    expect(screen.getByText(/Clipboard attachment images cannot be saved/)).toBeTruthy();
  });
});
