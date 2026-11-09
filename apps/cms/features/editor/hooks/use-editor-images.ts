"use client";
import { tiptapToEditorNodes as tiptapToNodes, type EditorNode } from "@blog-platform/core/content";
import type { Editor } from "@tiptap/react";
import { useRef, useState, useTransition } from "react";
import { prepareClientImageFile } from "../model/clipboard-image";
import type { EditorCommands } from "../model/commands";
import { slugCandidate } from "../model/document-slug";
import type { OperationToast } from "../model/toast";
import type { EditorSession } from "./use-editor-session";
type SelectedImageState = {
  pos: number;
  src: string;
  alt: string;
  title: string;
  caption: string;
};

export function useEditorImages({
  session,
  upload,
  getEditor,
  showToast,
}: {
  session: EditorSession;
  upload: EditorCommands["upload"];
  getEditor: () => Editor | null;
  showToast: (toast: OperationToast) => void;
}) {
  const { documentRef, body, markDirty, setMessage, setStatus } = session;
  const [isPending, startTransition] = useTransition();
  const [selectedImage, setSelectedImage] = useState<SelectedImageState>();
  const selectedImagePosRef = useRef<number | undefined>(undefined);
  const [imageAttributesOpen, setImageAttributesOpen] = useState(false);
  function syncSelectedImage(editorInstance: Editor) {
    const { selection } = editorInstance.state;
    const selectedNode =
      selection.$from.nodeAfter?.type.name === "image"
        ? { node: selection.$from.nodeAfter, pos: selection.from }
        : selection.$from.nodeBefore?.type.name === "image"
          ? { node: selection.$from.nodeBefore, pos: selection.from - 1 }
          : undefined;

    if (!selectedNode || typeof selectedNode.node.attrs.src !== "string") {
      setSelectedImage(undefined);
      selectedImagePosRef.current = undefined;
      setImageAttributesOpen(false);
      return;
    }

    if (selectedImagePosRef.current !== selectedNode.pos) {
      setImageAttributesOpen(true);
    }
    selectedImagePosRef.current = selectedNode.pos;
    setSelectedImage({
      pos: selectedNode.pos,
      src: selectedNode.node.attrs.src,
      alt: typeof selectedNode.node.attrs.alt === "string" ? selectedNode.node.attrs.alt : "",
      title: typeof selectedNode.node.attrs.title === "string" ? selectedNode.node.attrs.title : "",
      caption:
        typeof selectedNode.node.attrs.caption === "string" ? selectedNode.node.attrs.caption : "",
    });
  }

  function insertUploadedImage(result: {
    reference: { target: "body"; node: Extract<EditorNode, { type: "image" }> };
  }) {
    const editor = getEditor();
    const node = result.reference.node;
    const imageAttributes = {
      src: node.src,
      alt: node.alt ?? "",
      title: node.title,
      caption: node.caption,
      captionContent: node.captionContent,
      href: node.href,
    };
    editor?.chain().focus().setImage(imageAttributes).run();
    const nextBody = [...(editor ? tiptapToNodes(editor.getJSON()) : body)];
    markDirty(documentRef.current, nextBody);
    setMessage("Image uploaded. Save the post to keep this reference.");
    showToast({ title: "Image uploaded", description: "Save the post to keep it.", tone: "info" });
  }

  async function uploadPastedImage(file: File) {
    const prepared = await prepareClientImageFile(file);
    if (!prepared.ok) {
      setStatus("failed");
      setMessage(prepared.message);
      showToast({ title: "Image upload failed", tone: "error" });
      return;
    }
    const formData = new FormData();
    formData.set("target", "body");
    formData.set("postSlug", slugCandidate(documentRef.current));
    formData.set("file", prepared.file);
    formData.set("alt", prepared.file.name.replace(/\.[^.]+$/, ""));
    setStatus("pending");
    setMessage("Uploading pasted image...");
    startTransition(() => {
      void upload(formData).then((result) => {
        if (result.ok && result.reference.target === "body") {
          insertUploadedImage({ reference: result.reference });
          return;
        }
        if (!result.ok) {
          setStatus("failed");
          setMessage(result.message);
          showToast({ title: "Image upload failed", tone: "error" });
        }
      });
    });
  }

  function applySelectedImageAttributes(next: { alt?: string; title?: string; caption?: string }) {
    const editor = getEditor();
    if (!editor || !selectedImage) return;
    const nextImage = {
      ...selectedImage,
      alt: next.alt ?? selectedImage.alt,
      title: next.title ?? selectedImage.title,
      caption: next.caption ?? selectedImage.caption,
    };
    editor
      .chain()
      .focus()
      .setNodeSelection(selectedImage.pos)
      .updateAttributes("image", {
        alt: nextImage.alt,
        title: nextImage.title || null,
        caption: nextImage.caption || null,
        captionContent:
          nextImage.caption === editor.state.doc.nodeAt(selectedImage.pos)?.attrs.caption
            ? editor.state.doc.nodeAt(selectedImage.pos)?.attrs.captionContent
            : null,
      })
      .run();
    setSelectedImage(nextImage);
    const nextBody = tiptapToNodes(editor.getJSON());
    markDirty(documentRef.current, nextBody);
    setImageAttributesOpen(false);
  }

  return {
    selectedImage,
    setSelectedImage,
    imageAttributesOpen,
    setImageAttributesOpen,
    syncSelectedImage,
    insertUploadedImage,
    uploadPastedImage,
    applySelectedImageAttributes,
    isPending,
  };
}
