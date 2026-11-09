"use client";
import type { EditorDocument } from "@blog-platform/core/content";
import { useRef, useState } from "react";
import type { EditorCommands } from "../model/commands";
import type { EditorSiteAnalyticsConfig } from "../model/document";
import { slugCandidate } from "../model/document-slug";
import { savedMetadata } from "../model/saved-metadata";
import type { OperationToast } from "../model/toast";
import type { EditorSession } from "./use-editor-session";

const NEWER_EDITS_MESSAGE = "The submitted version was saved. Newer edits are still unsaved.";

function savedSnapshot(
  submitted: EditorDocument,
  result: { path: string; sha: string; slug?: string; updatedAt?: string },
  canonical = submitted,
): EditorDocument {
  const updatedAt = result.updatedAt ?? canonical.frontmatter.updatedAt ?? new Date().toISOString();
  return {
    ...canonical,
    path: result.path,
    sourceSha: result.sha,
    frontmatter: {
      ...canonical.frontmatter,
      slug: result.slug ?? canonical.frontmatter.slug ?? slugCandidate(submitted),
      updatedAt,
    },
    dirty: false,
    lastSavedAt: updatedAt,
  };
}

export function useEditorOperations({
  session,
  commands,
  currentDocument,
  showToast,
  siteAnalytics,
}: {
  session: EditorSession;
  commands: EditorCommands;
  currentDocument: () => EditorDocument;
  showToast: (toast: OperationToast) => void;
  siteAnalytics?: EditorSiteAnalyticsConfig;
}) {
  const {
    documentRef,
    revisionRef,
    applySavedDocument,
    setStatus,
    setMessage,
    retryToken,
    setRetryToken,
  } = session;
  const inFlight = useRef(false);
  const [isPending, setIsPending] = useState(false);

  function unsavedStatus() {
    return documentRef.current.frontmatter.title.trim()
      ? ("dirty" as const)
      : ("validation" as const);
  }

  function runTask(task: () => Promise<void>) {
    if (inFlight.current) return;
    inFlight.current = true;
    setIsPending(true);
    setStatus("pending");
    const startedRevision = revisionRef.current;
    void task()
      .catch(() => {
        setStatus(revisionRef.current !== startedRevision ? unsavedStatus() : "failed");
        setMessage("The operation could not be completed. Please try again.");
        showToast({ title: "Operation failed", tone: "error" });
      })
      .finally(() => {
        inFlight.current = false;
        setIsPending(false);
      });
  }

  function save() {
    runTask(async () => {
      const submitted = currentDocument();
      const submittedRevision = revisionRef.current;
      const result = await commands.save(submitted);
      if (result.ok) {
        const saved = savedSnapshot(submitted, result);
        const hasNewEdits = applySavedDocument(submitted, saved, submittedRevision);
        setMessage(hasNewEdits ? NEWER_EDITS_MESSAGE : undefined);
        setRetryToken(undefined);
        showToast({
          title: "Draft saved",
          description: hasNewEdits ? NEWER_EDITS_MESSAGE : `Saved ${savedMetadata(saved)}`,
          tone: "success",
        });
        return;
      }
      // Failure snapshots describe the submitted revision, never the current user input.
      setStatus(
        revisionRef.current !== submittedRevision
          ? unsavedStatus()
          : result.code === "validation-failure"
            ? "validation"
            : "failed",
      );
      setMessage(result.message);
      showToast({ title: "Save failed", tone: "error" });
    });
  }

  function runPublication(operation: "publish" | "unpublish" | "archive") {
    runTask(async () => {
      const submitted = currentDocument();
      const submittedRevision = revisionRef.current;
      const result = await (operation === "publish"
        ? commands.publish({ document: submitted })
        : operation === "archive"
          ? commands.archive({ document: submitted })
          : commands.unpublish({ document: submitted }));
      if (result.ok) {
        const saved = savedSnapshot(submitted, result, result.document);
        const hasNewEdits = applySavedDocument(
          submitted,
          saved,
          submittedRevision,
          operation === "publish" ? "published" : "saved",
        );
        setMessage(hasNewEdits ? NEWER_EDITS_MESSAGE : undefined);
        setRetryToken(undefined);
        showToast({
          title:
            operation === "publish"
              ? "Post published"
              : operation === "archive"
                ? "Post archived"
                : "Post unpublished",
          description: hasNewEdits ? NEWER_EDITS_MESSAGE : savedMetadata(saved),
          tone: "success",
        });
        return;
      }
      // A public-refresh failure may still contain a successfully persisted revision.
      if (result.repository?.ok && result.document && result.path && result.sha) {
        applySavedDocument(
          submitted,
          savedSnapshot(
            submitted,
            { path: result.path, sha: result.sha, slug: result.slug, updatedAt: result.updatedAt },
            result.document,
          ),
          submittedRevision,
        );
      }
      setStatus(
        revisionRef.current !== submittedRevision
          ? unsavedStatus()
          : result.code === "public-refresh-failed"
            ? "refreshFailed"
            : "failed",
      );
      setRetryToken(result.retryToken);
      setMessage(result.message);
      showToast({
        title: result.code === "public-refresh-failed" ? "Refresh failed" : "Publication failed",
        tone: "error",
      });
    });
  }

  function retryRefresh() {
    if (!retryToken) {
      save();
      return;
    }
    runTask(async () => {
      const result = await commands.retry({ retryToken });
      if (result.ok) {
        setStatus(documentRef.current.dirty ? unsavedStatus() : "saved");
        setMessage(undefined);
        setRetryToken(undefined);
        showToast({ title: "Public refresh completed", tone: "success" });
        return;
      }
      setStatus(documentRef.current.dirty ? unsavedStatus() : "refreshFailed");
      setMessage(result.message);
      showToast({ title: "Refresh failed", tone: "error" });
    });
  }

  function openPreview() {
    runTask(async () => {
      const submitted = currentDocument();
      const submittedRevision = revisionRef.current;
      const result = await commands.preview({ document: submitted });
      if (!result.ok) {
        setStatus(revisionRef.current !== submittedRevision ? unsavedStatus() : "failed");
        setMessage(result.message);
        showToast({ title: "Preview failed", tone: "error" });
        return;
      }
      const saved = savedSnapshot(submitted, result);
      const hasNewEdits = applySavedDocument(submitted, saved, submittedRevision);
      setMessage(hasNewEdits ? NEWER_EDITS_MESSAGE : undefined);
      showToast({
        title: "Preview opened",
        description: hasNewEdits ? NEWER_EDITS_MESSAGE : savedMetadata(saved),
        tone: "info",
      });
      const previewUrl = siteAnalytics?.siteUrl
        ? new URL(result.url, siteAnalytics.siteUrl).toString()
        : result.url;
      window.open(previewUrl, "_blank", "noopener,noreferrer");
    });
  }

  return { save, runPublication, retryRefresh, openPreview, isPending };
}
export type EditorOperations = ReturnType<typeof useEditorOperations>;
