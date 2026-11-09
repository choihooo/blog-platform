"use client";
import {
  legacyMarkdownToPostContent,
  editorNodesToTiptap as nodesToTiptap,
  tiptapToEditorNodes as tiptapToNodes,
  type EditorDocument,
} from "@blog-platform/core/content";
import { useEditor, type Editor } from "@tiptap/react";
import { hasAttachmentImage, normalizedImageFile } from "../model/clipboard-image";
import type { OperationToast } from "../model/toast";
import { contentExtensions } from "./content-extensions";
import type { EditorSession } from "./use-editor-session";
export function useEditorContent({
  initialDocument,
  session,
  syncSelectedImage,
  uploadPastedImage,
  showToast,
}: {
  initialDocument: EditorDocument;
  session: EditorSession;
  syncSelectedImage: (editor: Editor) => void;
  uploadPastedImage: (file: File) => Promise<void>;
  showToast: (toast: OperationToast) => void;
}): Editor | null {
  const { documentRef, markDirty, setStatus, setMessage } = session;
  const editor: Editor | null = useEditor({
    extensions: contentExtensions,
    content: nodesToTiptap(initialDocument.body),
    immediatelyRender: false,
    editorProps: {
      attributes: {
        "aria-label": "Post body",
        class:
          "cms-editor-body min-h-[420px] px-4 py-3 outline-none focus-visible:ring-2 focus-visible:ring-ring",
        role: "textbox",
      },
      handlePaste: (_view, event) => {
        const plain = event.clipboardData?.getData("text/plain") ?? "";
        if (
          !editor?.isActive("codeBlock") &&
          !event.clipboardData?.getData("text/html") &&
          /^(?:#{1,6}\s|`{3,}|~{3,}|[-*+]\s|\d+\.\s|\|.+\|)/m.test(plain)
        ) {
          event.preventDefault();
          editor
            ?.chain()
            .focus()
            .insertContent(nodesToTiptap(legacyMarkdownToPostContent(plain).nodes).content ?? [])
            .run();
          return true;
        }
        const file = normalizedImageFile(event.clipboardData);
        if (!file) {
          if (!hasAttachmentImage(event.clipboardData)) return false;
          event.preventDefault();
          setStatus("failed");
          setMessage(
            "Clipboard attachment images cannot be saved. Copy the image file itself or use Upload image.",
          );
          showToast({ title: "Image paste blocked", tone: "error" });
          return true;
        }
        event.preventDefault();
        void uploadPastedImage(file);
        return true;
      },
    },
    onSelectionUpdate: ({ editor }) => {
      syncSelectedImage(editor);
    },
    onUpdate: ({ editor }) => {
      syncSelectedImage(editor);
      markDirty(documentRef.current, tiptapToNodes(editor.getJSON()));
    },
  });

  return editor;
}
