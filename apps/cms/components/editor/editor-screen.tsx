"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import StarterKit from "@tiptap/starter-kit";
import { EditorContent, useEditor, type JSONContent } from "@tiptap/react";
import type { EditorDocument, EditorMark, EditorNode } from "@blog-platform/editor";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalDescription,
  ModalHeader,
  ModalOverlay,
  ModalPortal,
  ModalTitle,
  ModalTitleStack,
  Toast,
  ToastStack,
} from "@hozui/react";

import {
  archivePostAction,
  createPreviewTokenAction,
  publishPostAction,
  retryPublicRefreshAction,
  saveEditorDraftAction,
  unpublishPostAction,
  uploadEditorMediaAction,
} from "../../app/actions/editor-actions";
import { analyticsLinksForEditorDocument } from "../../lib/editor/analytics-links";
import { clearBackup, writeBackup } from "../../lib/editor/draft-backup";
import { seoReportForEditorDocument } from "../../lib/editor/seo-report";
import { EditorToolbar } from "./editor-toolbar";
import { FrontmatterPanel, type CategoryOption } from "./frontmatter-panel";
import { RecoveryBanner } from "./recovery-banner";
import { SaveStatusBadge, type SaveStatus } from "./save-status";
import { SeoPanel } from "./seo-panel";
import { CmsTextField } from "../ui/text-field";
import type { PublicRefreshRetryToken } from "../../lib/editor";
import type { EditorSiteAnalyticsConfig } from "../../lib/editor";

type SelectedImageState = {
  pos: number;
  src: string;
  alt: string;
  title: string;
};

type EditorToastState = {
  id: number;
  title: string;
  description?: string;
  tone: "success" | "error" | "info";
};

function textContent(node: JSONContent): string {
  return (node.content ?? []).map((child) => child.text ?? textContent(child)).join("");
}

function marksFromTiptap(node: JSONContent): EditorMark[] | undefined {
  const marks: EditorMark[] = [];
  for (const mark of node.marks ?? []) {
    if (mark.type === "bold") marks.push("bold");
    if (mark.type === "italic") marks.push("italic");
    if (mark.type === "code") marks.push("inlineCode");
  }
  return marks.length > 0 ? marks : undefined;
}

function firstLink(node: JSONContent): string | undefined {
  const link = node.marks?.find((mark) => mark.type === "link");
  return typeof link?.attrs?.href === "string" ? link.attrs.href : undefined;
}

function paragraphNode(type: Extract<EditorNode, { text: string }>["type"], node: JSONContent) {
  const firstText = node.content?.find((child) => child.type === "text");
  return {
    type,
    text: textContent(node),
    marks: firstText ? marksFromTiptap(firstText) : undefined,
    href: firstText ? firstLink(firstText) : undefined,
  };
}

function tiptapToNodes(content: JSONContent): EditorNode[] {
  const nodes: EditorNode[] = [];
  for (const node of content.content ?? []) {
    if (node.type === "heading") {
      nodes.push({ ...paragraphNode("heading", node), depth: Number(node.attrs?.level ?? 2) });
    } else if (node.type === "paragraph") {
      const text = textContent(node);
      if (text) nodes.push(paragraphNode("paragraph", node));
    } else if (node.type === "blockquote") {
      nodes.push({ type: "blockquote", text: textContent(node) });
    } else if (node.type === "horizontalRule") {
      nodes.push({ type: "horizontalRule" });
    } else if (node.type === "codeBlock") {
      nodes.push({
        type: "codeBlock",
        text: textContent(node),
        language: typeof node.attrs?.language === "string" ? node.attrs.language : undefined,
      });
    } else if (node.type === "image" && typeof node.attrs?.src === "string") {
      nodes.push({
        type: "image",
        src: node.attrs.src,
        alt: typeof node.attrs.alt === "string" ? node.attrs.alt : undefined,
        title: typeof node.attrs.title === "string" ? node.attrs.title : undefined,
      });
    } else if (node.type === "bulletList" || node.type === "orderedList") {
      for (const item of node.content ?? []) {
        nodes.push({
          type: node.type,
          text: textContent(item),
        });
      }
    }
  }
  return nodes;
}

function textMarks(node: Extract<EditorNode, { text: string }>) {
  const marks: JSONContent["marks"] = [];
  for (const mark of node.marks ?? []) {
    if (mark === "bold") marks.push({ type: "bold" });
    if (mark === "italic") marks.push({ type: "italic" });
    if (mark === "inlineCode") marks.push({ type: "code" });
  }
  if (node.href) marks.push({ type: "link", attrs: { href: node.href } });
  return marks.length > 0 ? marks : undefined;
}

function textChild(node: Extract<EditorNode, { text: string }>): JSONContent {
  return { type: "text", text: node.text, marks: textMarks(node) };
}

function nodesToTiptap(nodes: EditorNode[]): JSONContent {
  return {
    type: "doc",
    content:
      nodes.length > 0
        ? nodes.map((node): JSONContent => {
            if (node.type === "horizontalRule") return { type: "horizontalRule" };
            if (node.type === "image") {
              return {
                type: "image",
                attrs: { src: node.src, alt: node.alt ?? "", title: node.title ?? null },
              };
            }
            if (node.type === "heading") {
              return {
                type: "heading",
                attrs: { level: node.depth ?? 2 },
                content: node.text ? [textChild(node)] : undefined,
              };
            }
            if (node.type === "bulletList" || node.type === "orderedList") {
              return {
                type: node.type,
                content: [
                  {
                    type: "listItem",
                    content: [{ type: "paragraph", content: node.text ? [textChild(node)] : [] }],
                  },
                ],
              };
            }
            if (node.type === "blockquote") {
              return {
                type: "blockquote",
                content: [{ type: "paragraph", content: node.text ? [textChild(node)] : [] }],
              };
            }
            if (node.type === "codeBlock") {
              return {
                type: "codeBlock",
                attrs: { language: node.language ?? null },
                content: node.text ? [{ type: "text", text: node.text }] : undefined,
              };
            }
            return { type: "paragraph", content: node.text ? [textChild(node)] : [] };
          })
        : [{ type: "paragraph" }],
  };
}

function extensionFromImageType(type: string) {
  if (type === "image/webp") return "webp";
  if (type === "image/jpeg") return "jpg";
  return "png";
}

function clipboardImageFile(data: DataTransfer | null): File | undefined {
  const file = Array.from(data?.files ?? []).find((entry) => entry.type.startsWith("image/"));
  if (!file) return;
  if (/\.(webp|png|jpe?g)$/i.test(file.name)) return file;
  const extension = extensionFromImageType(file.type);
  return new File([file], `clipboard-image.${extension}`, {
    type: file.type || "image/png",
    lastModified: file.lastModified,
  });
}

function slugCandidate(document: EditorDocument): string {
  const titleSlug = document.frontmatter.title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return document.frontmatter.slug || titleSlug || document.id;
}

function savedMetadata(document: EditorDocument) {
  const slug = slugCandidate(document);
  const updatedAt = document.frontmatter.updatedAt ?? document.lastSavedAt;
  if (!updatedAt) return `/${slug}`;
  return `/${slug} · ${new Date(updatedAt).toLocaleString()}`;
}

export function EditorScreen({
  categories = [],
  initialDocument,
  siteAnalytics,
}: {
  categories?: CategoryOption[];
  initialDocument: EditorDocument;
  siteAnalytics?: EditorSiteAnalyticsConfig;
}) {
  const [document, setDocument] = useState(initialDocument);
  const documentRef = useRef(initialDocument);
  const [body, setBody] = useState(initialDocument.body);
  const [status, setStatus] = useState<SaveStatus>(
    initialDocument.frontmatter.title ? "clean" : "validation",
  );
  const [message, setMessage] = useState<string>();
  const [retryToken, setRetryToken] = useState<PublicRefreshRetryToken>();
  const [selectedImage, setSelectedImage] = useState<SelectedImageState>();
  const selectedImagePosRef = useRef<number | undefined>(undefined);
  const [imageAttributesOpen, setImageAttributesOpen] = useState(false);
  const [toast, setToast] = useState<EditorToastState>();
  const [isPending, startTransition] = useTransition();

  function showToast(next: Omit<EditorToastState, "id">) {
    setToast((current) => ({ ...next, id: (current?.id ?? 0) + 1 }));
  }

  function syncSelectedImage(editorInstance: NonNullable<ReturnType<typeof useEditor>>) {
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
    });
  }

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ link: false }),
      Link.configure({ openOnClick: false }),
      Image.configure({ allowBase64: false }),
    ],
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
        const file = clipboardImageFile(event.clipboardData);
        if (!file) return false;
        event.preventDefault();
        uploadPastedImage(file);
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

  useEffect(() => {
    documentRef.current = document;
  }, [document]);

  const previewDocument = useMemo(() => ({ ...document, body }), [body, document]);
  const seoReport = useMemo(
    () =>
      seoReportForEditorDocument(previewDocument, {
        siteUrl: siteAnalytics?.siteUrl,
      }),
    [previewDocument, siteAnalytics?.siteUrl],
  );
  const analyticsLinks = useMemo(
    () => analyticsLinksForEditorDocument(previewDocument, siteAnalytics),
    [previewDocument, siteAnalytics],
  );

  function markDirty(next: EditorDocument, nextBody: EditorNode[] = body) {
    const dirty = {
      ...next,
      body: nextBody,
      dirty: true,
    };
    documentRef.current = dirty;
    setDocument(dirty);
    setBody(nextBody);
    setStatus(dirty.frontmatter.title.trim() ? "dirty" : "validation");
    if (typeof window !== "undefined" && typeof window.localStorage?.setItem === "function") {
      writeBackup(window.localStorage, dirty);
    }
  }

  function save() {
    const submitted = {
      ...document,
      body: editor ? tiptapToNodes(editor.getJSON()) : body,
    };
    setStatus("pending");
    startTransition(() => {
      void saveEditorDraftAction(submitted).then((result) => {
        if (result.ok) {
          const updatedAt = result.updatedAt ?? new Date().toISOString();
          const saved = {
            ...submitted,
            path: result.path,
            sourceSha: result.sha,
            frontmatter: {
              ...submitted.frontmatter,
              slug: result.slug ?? slugCandidate(submitted),
              updatedAt,
            },
            dirty: false,
            lastSavedAt: updatedAt,
          };
          documentRef.current = saved;
          setDocument(saved);
          setStatus("saved");
          setMessage(undefined);
          setRetryToken(undefined);
          showToast({
            title: "Draft saved",
            description: `Saved ${savedMetadata(saved)}`,
            tone: "success",
          });
          if (
            typeof window !== "undefined" &&
            typeof window.localStorage?.removeItem === "function"
          ) {
            clearBackup(window.localStorage, saved);
          }
          return;
        }
        setDocument(result.submittedDocument);
        setStatus(result.code === "validation-failure" ? "validation" : "failed");
        setMessage(result.message);
        showToast({ title: "Save failed", tone: "error" });
      });
    });
  }

  function currentDocument(): EditorDocument {
    return {
      ...document,
      body: editor ? tiptapToNodes(editor.getJSON()) : body,
    };
  }

  function runPublication(operation: "publish" | "unpublish" | "archive") {
    const submitted = currentDocument();
    const action =
      operation === "publish"
        ? publishPostAction({ document: submitted })
        : operation === "archive"
          ? archivePostAction({ document: submitted })
          : unpublishPostAction({ document: submitted });
    setStatus("pending");
    startTransition(() => {
      void action.then((result) => {
        if (result.ok) {
          const saved = result.document ?? {
            ...submitted,
            path: result.path,
            sourceSha: result.sha,
            dirty: false,
            lastSavedAt: new Date().toISOString(),
          };
          documentRef.current = saved;
          setDocument(saved);
          setBody(saved.body);
          setStatus(operation === "publish" ? "published" : "saved");
          setMessage(undefined);
          setRetryToken(undefined);
          showToast({
            title:
              operation === "publish"
                ? "Post published"
                : operation === "archive"
                  ? "Post archived"
                  : "Post unpublished",
            description: savedMetadata(saved),
            tone: "success",
          });
          if (
            typeof window !== "undefined" &&
            typeof window.localStorage?.removeItem === "function"
          ) {
            clearBackup(window.localStorage, saved);
          }
          return;
        }
        if (result.document) {
          documentRef.current = result.document;
          setDocument(result.document);
          setBody(result.document.body);
        } else if (result.submittedDocument) {
          documentRef.current = result.submittedDocument;
          setDocument(result.submittedDocument);
          setBody(result.submittedDocument.body);
        }
        setStatus(result.code === "public-refresh-failed" ? "refreshFailed" : "failed");
        setRetryToken(result.retryToken);
        setMessage(result.message);
        showToast({
          title: result.code === "public-refresh-failed" ? "Refresh failed" : "Publication failed",
          tone: "error",
        });
      });
    });
  }

  function retryRefresh() {
    if (!retryToken) {
      save();
      return;
    }
    setStatus("pending");
    startTransition(() => {
      void retryPublicRefreshAction({ retryToken }).then((result) => {
        if (result.ok) {
          setStatus("saved");
          setMessage(undefined);
          setRetryToken(undefined);
          showToast({ title: "Public refresh completed", tone: "success" });
          return;
        }
        setStatus("refreshFailed");
        setMessage(result.message);
        showToast({ title: "Refresh failed", tone: "error" });
      });
    });
  }

  function openPreview() {
    const submitted = currentDocument();
    setStatus("pending");
    startTransition(() => {
      void createPreviewTokenAction({ document: submitted }).then((result) => {
        if (!result.ok) {
          setStatus("failed");
          setMessage(result.message);
          showToast({ title: "Preview failed", tone: "error" });
          return;
        }
        const updatedAt = result.updatedAt ?? new Date().toISOString();
        const saved = {
          ...submitted,
          path: result.path,
          sourceSha: result.sha,
          frontmatter: {
            ...submitted.frontmatter,
            slug: result.slug,
            updatedAt,
          },
          dirty: false,
          lastSavedAt: updatedAt,
        };
        documentRef.current = saved;
        setDocument(saved);
        setBody(saved.body);
        if (
          typeof window !== "undefined" &&
          typeof window.localStorage?.removeItem === "function"
        ) {
          clearBackup(window.localStorage, saved);
        }
        setStatus("saved");
        setMessage(undefined);
        showToast({ title: "Preview opened", description: savedMetadata(saved), tone: "info" });
        const previewUrl = siteAnalytics?.siteUrl
          ? new URL(result.url, siteAnalytics.siteUrl).toString()
          : result.url;
        window.open(previewUrl, "_blank", "noopener,noreferrer");
      });
    });
  }

  function insertUploadedImage(result: {
    reference: { target: "body"; node: Extract<EditorNode, { type: "image" }> };
  }) {
    const node = result.reference.node;
    editor
      ?.chain()
      .focus()
      .setImage({ src: node.src, alt: node.alt ?? "", title: node.title })
      .run();
    const nextBody = [
      ...(editor ? tiptapToNodes(editor.getJSON()) : body),
      ...(node.caption ? [{ type: "paragraph" as const, text: node.caption }] : []),
    ];
    markDirty(documentRef.current, nextBody);
    setMessage("Image uploaded. Save the post to keep this reference.");
    showToast({ title: "Image uploaded", description: "Save the post to keep it.", tone: "info" });
  }

  function uploadPastedImage(file: File) {
    const formData = new FormData();
    formData.set("target", "body");
    formData.set("postSlug", slugCandidate(documentRef.current));
    formData.set("file", file);
    formData.set("alt", file.name.replace(/\.[^.]+$/, ""));
    setStatus("pending");
    setMessage("Uploading pasted image...");
    startTransition(() => {
      void uploadEditorMediaAction(formData).then((result) => {
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

  function applySelectedImageAttributes(next: { alt?: string; title?: string }) {
    if (!editor || !selectedImage) return;
    const nextImage = {
      ...selectedImage,
      alt: next.alt ?? selectedImage.alt,
      title: next.title ?? selectedImage.title,
    };
    editor
      .chain()
      .focus()
      .setNodeSelection(selectedImage.pos)
      .updateAttributes("image", {
        alt: nextImage.alt,
        title: nextImage.title || null,
      })
      .run();
    setSelectedImage(nextImage);
    const nextBody = tiptapToNodes(editor.getJSON());
    markDirty(documentRef.current, nextBody);
    setImageAttributesOpen(false);
  }

  return (
    <div className="overflow-hidden rounded-md border border-border bg-background">
      <ToastStack placement="bottom-right">
        {toast ? (
          <Toast
            key={toast.id}
            description={toast.description}
            onOpenChange={(open) => {
              if (!open) setToast(undefined);
            }}
            open
            showCloseButton
            title={toast.title}
            tone={toast.tone}
          />
        ) : null}
      </ToastStack>
      <RecoveryBanner
        message={message}
        onDiscard={() => {
          setMessage(undefined);
          setRetryToken(undefined);
        }}
        onRetry={retryToken ? retryRefresh : save}
      />
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="text-lg font-semibold">Editor</h2>
        <div className="flex min-w-0 items-center gap-3">
          <p className="hidden max-w-[42vw] truncate text-xs text-muted-foreground sm:block">
            {savedMetadata(document)}
          </p>
          <SaveStatusBadge status={isPending ? "pending" : status} />
        </div>
      </div>
      <EditorToolbar
        actionLoading={isPending}
        editor={editor}
        onMediaUploaded={(result) => {
          if (result.reference.target === "body") {
            insertUploadedImage({ reference: result.reference });
          }
        }}
        onArchive={() => runPublication("archive")}
        onPreview={openPreview}
        onPublish={() => runPublication("publish")}
        onSave={save}
        onUnpublish={() => runPublication("unpublish")}
        postSlug={slugCandidate(document)}
        publishDisabled={!document.frontmatter.title.trim() || isPending}
        saveDisabled={!document.frontmatter.title.trim() || isPending}
      />
      <div className="grid min-h-[560px] grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px]">
        <main className="min-w-0">
          <EditorContent editor={editor} />
        </main>
        <aside className="border-l border-border">
          <FrontmatterPanel
            categories={categories}
            frontmatter={document.frontmatter}
            onChange={(frontmatter) => markDirty({ ...document, frontmatter })}
            postSlug={slugCandidate(document)}
          />
          <SeoPanel links={analyticsLinks} report={seoReport} />
        </aside>
      </div>
      <Modal open={imageAttributesOpen} onOpenChange={(open) => setImageAttributesOpen(open)}>
        <ModalPortal>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              <ModalTitleStack>
                <ModalTitle>Image attributes</ModalTitle>
                <ModalDescription>
                  Set alt text and title for the selected body image.
                </ModalDescription>
              </ModalTitleStack>
            </ModalHeader>
            <ModalBody>
              {selectedImage ? (
                <div className="space-y-4">
                  <img
                    alt={selectedImage.alt || "Selected body image"}
                    className="aspect-video w-full rounded-md border border-border object-contain"
                    src={selectedImage.src}
                  />
                  <div className="space-y-2">
                    <CmsTextField
                      id="selected-image-alt"
                      label="Alt text"
                      onChange={(event) =>
                        setSelectedImage((current) =>
                          current ? { ...current, alt: event.currentTarget.value } : current,
                        )
                      }
                      onValueChange={(value) =>
                        setSelectedImage((current) =>
                          current ? { ...current, alt: value } : current,
                        )
                      }
                      placeholder="Describe the image"
                      value={selectedImage.alt}
                    />
                  </div>
                  <div className="space-y-2">
                    <CmsTextField
                      id="selected-image-title"
                      label="Title"
                      onChange={(event) =>
                        setSelectedImage((current) =>
                          current ? { ...current, title: event.currentTarget.value } : current,
                        )
                      }
                      onValueChange={(value) =>
                        setSelectedImage((current) =>
                          current ? { ...current, title: value } : current,
                        )
                      }
                      placeholder="Optional title"
                      value={selectedImage.title}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      label="Cancel"
                      onClick={() => setImageAttributesOpen(false)}
                      type="button"
                      variant="secondary"
                    />
                    <Button
                      label="Apply"
                      onClick={() =>
                        applySelectedImageAttributes({
                          alt: selectedImage.alt,
                          title: selectedImage.title,
                        })
                      }
                      type="button"
                    />
                  </div>
                </div>
              ) : null}
            </ModalBody>
          </ModalContent>
        </ModalPortal>
      </Modal>
    </div>
  );
}
