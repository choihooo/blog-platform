"use client";
import type { EditorDocument, EditorNode } from "@blog-platform/core/content";
import { useRef, useState } from "react";
import { backupKey, clearBackup, writeBackup } from "../model/draft-backup";
import type { PublicRefreshRetryToken } from "../model/public-refresh";
import type { SaveStatus } from "../model/save-status";
import { reconcileSavedDocument } from "../model/save-reconciliation";
export function useEditorSession(initialDocument: EditorDocument) {
  const [document, setDocument] = useState(initialDocument);
  const documentRef = useRef(initialDocument);
  const revisionRef = useRef(0);
  const [body, setBody] = useState(initialDocument.body);
  const [status, setStatus] = useState<SaveStatus>(
    initialDocument.frontmatter.title ? "clean" : "validation",
  );
  const [message, setMessage] = useState<string>();
  const [retryToken, setRetryToken] = useState<PublicRefreshRetryToken>();
  function markDirty(next: EditorDocument, nextBody: EditorNode[] = body) {
    const dirty = {
      ...next,
      body: nextBody,
      dirty: true,
    };
    revisionRef.current += 1;
    documentRef.current = dirty;
    setDocument(dirty);
    setBody(nextBody);
    setStatus(dirty.frontmatter.title.trim() ? "dirty" : "validation");
    if (typeof window !== "undefined" && typeof window.localStorage?.setItem === "function") {
      writeBackup(window.localStorage, dirty);
    }
  }

  function applySavedDocument(
    submitted: EditorDocument,
    saved: EditorDocument,
    submittedRevision: number,
    cleanStatus: SaveStatus = "saved",
  ) {
    const hasNewEdits = revisionRef.current !== submittedRevision;
    const next = reconcileSavedDocument(submitted, saved, documentRef.current, hasNewEdits);
    documentRef.current = next;
    setDocument(next);
    setBody(next.body);
    setStatus(hasNewEdits ? (next.frontmatter.title.trim() ? "dirty" : "validation") : cleanStatus);
    if (typeof window !== "undefined") {
      const storage = window.localStorage;
      if (hasNewEdits && typeof storage?.setItem === "function") {
        writeBackup(storage, next);
        if (backupKey(submitted) !== backupKey(next)) clearBackup(storage, submitted);
      } else if (!hasNewEdits && typeof storage?.removeItem === "function") {
        clearBackup(storage, submitted);
        clearBackup(storage, next);
      }
    }
    return hasNewEdits;
  }

  return {
    document,
    documentRef,
    revisionRef,
    body,
    status,
    setStatus,
    message,
    setMessage,
    retryToken,
    setRetryToken,
    markDirty,
    applySavedDocument,
  };
}
export type EditorSession = ReturnType<typeof useEditorSession>;
