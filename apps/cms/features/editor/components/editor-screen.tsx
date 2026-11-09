"use client";
import { slugCandidate } from "../model/document-slug";
import { savedMetadata } from "../model/saved-metadata";

import {
  tiptapToEditorNodes as tiptapToNodes,
  type EditorDocument,
} from "@blog-platform/core/content";
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
import { EditorContent } from "@tiptap/react";
import { useMemo, useState } from "react";
import { useEditorContent } from "../hooks/use-editor-content";
import { useEditorImages } from "../hooks/use-editor-images";
import { useEditorOperations } from "../hooks/use-editor-operations";
import { useEditorSession } from "../hooks/use-editor-session";

import { analyticsLinksForEditorDocument } from "../model/analytics-links";
import type { EditorCommands } from "../model/commands";

import { CmsTextField } from "../../../shared/ui/text-field";
import { seoReportForEditorDocument } from "../model/seo-report";
import { EditorToolbar } from "./editor-toolbar";
import { FrontmatterPanel, type CategoryOption } from "./frontmatter-panel";
import { RecoveryBanner } from "./recovery-banner";
import { SaveStatusBadge } from "./save-status";
import { SeoPanel } from "./seo-panel";

import type { EditorSiteAnalyticsConfig } from "../model/document";

type EditorToastState = {
  id: number;
  title: string;
  description?: string;
  tone: "success" | "error" | "info";
};

export function EditorScreen({
  commands,
  categories = [],
  initialDocument,
  siteAnalytics,
}: {
  commands: EditorCommands;
  categories?: CategoryOption[];
  initialDocument: EditorDocument;
  siteAnalytics?: EditorSiteAnalyticsConfig;
}) {
  const session = useEditorSession(initialDocument);
  const { document, body, status, message, setMessage, retryToken, setRetryToken, markDirty } =
    session;
  const [toast, setToast] = useState<EditorToastState>();

  function showToast(next: Omit<EditorToastState, "id">) {
    setToast((current) => ({ ...next, id: (current?.id ?? 0) + 1 }));
  }

  const images = useEditorImages({
    session,
    upload: commands.upload,
    getEditor: () => editor,
    showToast,
  });
  const {
    selectedImage,
    setSelectedImage,
    imageAttributesOpen,
    setImageAttributesOpen,
    syncSelectedImage,
    insertUploadedImage,
    uploadPastedImage,
    applySelectedImageAttributes,
  } = images;
  const editor = useEditorContent({
    initialDocument,
    session,
    syncSelectedImage,
    uploadPastedImage,
    showToast,
  });
  const {
    save,
    runPublication,
    retryRefresh,
    openPreview,
    isPending: operationPending,
  } = useEditorOperations({ session, commands, currentDocument, showToast, siteAnalytics });

  const isPending = operationPending || images.isPending;

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

  function currentDocument(): EditorDocument {
    return {
      ...document,
      body: editor ? tiptapToNodes(editor.getJSON()) : body,
    };
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
        upload={commands.upload}
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
            upload={commands.upload}
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
                  Set alt text, title and caption for the selected body image.
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
                  <CmsTextField
                    id="selected-image-caption"
                    label="Caption"
                    value={selectedImage.caption}
                    onValueChange={(caption) =>
                      setSelectedImage((current) => (current ? { ...current, caption } : current))
                    }
                  />
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
                          caption: selectedImage.caption,
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
