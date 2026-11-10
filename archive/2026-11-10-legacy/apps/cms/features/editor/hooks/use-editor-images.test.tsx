import {
  createEmptyEditorDocument,
  editorNodesToTiptap,
  tiptapToEditorNodes,
} from "@blog-platform/core/content";
import { act, renderHook, waitFor } from "@testing-library/react";
import { Editor } from "@tiptap/react";
import { expect, it, vi } from "vitest";
import type { EditorCommands } from "../model/commands";
import { contentExtensions } from "./content-extensions";
import { useEditorImages } from "./use-editor-images";
import { useEditorSession } from "./use-editor-session";

it("applies attributes to the newly selected image and preserves the previous image", () => {
  const document = createEmptyEditorDocument();
  document.frontmatter.title = "Images";
  document.body = [
    { type: "image", src: "/media/first.png", alt: "First" },
    { type: "image", src: "/media/second.png", alt: "Second" },
  ];
  const editor = new Editor({
    extensions: contentExtensions,
    content: editorNodesToTiptap(document.body),
  });
  try {
    const positions: number[] = [];
    editor.state.doc.descendants((node, position) => {
      if (node.type.name === "image") positions.push(position);
    });
    const { result } = renderHook(() => {
      const session = useEditorSession(document);
      return {
        session,
        images: useEditorImages({
          session,
          upload: vi.fn(),
          getEditor: () => editor,
          showToast: vi.fn(),
        }),
      };
    });
    act(() => {
      editor.commands.setNodeSelection(positions[0]!);
      result.current.images.syncSelectedImage(editor);
    });
    act(() => {
      editor.commands.setNodeSelection(positions[1]!);
      result.current.images.syncSelectedImage(editor);
    });
    act(() => result.current.images.applySelectedImageAttributes({ alt: "Updated second" }));
    const images = tiptapToEditorNodes(editor.getJSON()).filter((node) => node.type === "image");
    expect(images).toMatchObject([
      { src: "/media/first.png", alt: "First" },
      { src: "/media/second.png", alt: "Updated second" },
    ]);
    expect(
      result.current.session.documentRef.current.body.filter((node) => node.type === "image"),
    ).toMatchObject(images);
    expect(result.current.images.imageAttributesOpen).toBe(false);
  } finally {
    editor.destroy();
  }
});

it("keeps the body and cover unchanged after a pasted upload fails", async () => {
  const document = createEmptyEditorDocument();
  document.frontmatter.title = "Images";
  document.frontmatter.coverImage = "/media/cover.png";
  document.body = [{ type: "paragraph", text: "Keep this body" }];
  const editor = new Editor({
    extensions: contentExtensions,
    content: editorNodesToTiptap(document.body),
  });
  try {
    const upload = vi.fn<EditorCommands["upload"]>().mockResolvedValue({
      ok: false,
      code: "temporary-connectivity",
      retryable: true,
      message: "Upload failed",
    });
    const { result } = renderHook(() => {
      const session = useEditorSession(document);
      return {
        session,
        images: useEditorImages({ session, upload, getEditor: () => editor, showToast: vi.fn() }),
      };
    });
    await act(async () =>
      result.current.images.uploadPastedImage(
        new File(["image"], "pasted.png", { type: "image/png" }),
      ),
    );
    await waitFor(() => expect(result.current.session.status).toBe("failed"));
    expect(tiptapToEditorNodes(editor.getJSON())).toEqual([
      { type: "paragraph", text: "Keep this body", content: [{ text: "Keep this body" }] },
    ]);
    expect(result.current.session.documentRef.current.body).toEqual([
      { type: "paragraph", text: "Keep this body" },
    ]);
    expect(result.current.session.documentRef.current.frontmatter.coverImage).toBe(
      "/media/cover.png",
    );
  } finally {
    editor.destroy();
  }
});
