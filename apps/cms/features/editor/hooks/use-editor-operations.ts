"use client";
import type { EditorDocument } from "@blog-platform/core/content";
import { useTransition } from "react";
import type { EditorCommands } from "../model/commands";
import type { EditorSiteAnalyticsConfig } from "../model/document";
import { slugCandidate } from "../model/document-slug";
import { clearBackup } from "../model/draft-backup";
import { savedMetadata } from "../model/saved-metadata";
import type { OperationToast } from "../model/toast";
import type { EditorSession } from "./use-editor-session";
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
    document,
    documentRef,
    setDocument,
    setBody,
    setStatus,
    setMessage,
    retryToken,
    setRetryToken,
  } = session;
  const [isPending, startTransition] = useTransition();
  function save() {
    const submitted = {
      ...document,
      body: currentDocument().body,
    };
    setStatus("pending");
    startTransition(() => {
      void commands.save(submitted).then((result) => {
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

  function runPublication(operation: "publish" | "unpublish" | "archive") {
    const submitted = currentDocument();
    const action =
      operation === "publish"
        ? commands.publish({ document: submitted })
        : operation === "archive"
          ? commands.archive({ document: submitted })
          : commands.unpublish({ document: submitted });
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
      void commands.retry({ retryToken }).then((result) => {
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
      void commands.preview({ document: submitted }).then((result) => {
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

  return { save, runPublication, retryRefresh, openPreview, isPending, startTransition };
}
export type EditorOperations = ReturnType<typeof useEditorOperations>;
