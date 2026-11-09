"use client";
import type { EditorDocument, EditorNode } from "@blog-platform/core/content";
import { useEffect, useRef, useState } from "react";
import { writeBackup } from "../model/draft-backup";
import type { PublicRefreshRetryToken } from "../model/public-refresh";
import type { SaveStatus } from "../model/save-status";
export function useEditorSession(initialDocument: EditorDocument) {
  const [document, setDocument] = useState(initialDocument);
  const documentRef = useRef(initialDocument);
  const [body, setBody] = useState(initialDocument.body);
  const [status, setStatus] = useState<SaveStatus>(
    initialDocument.frontmatter.title ? "clean" : "validation",
  );
  const [message, setMessage] = useState<string>();
  const [retryToken, setRetryToken] = useState<PublicRefreshRetryToken>();
  useEffect(() => {
    documentRef.current = document;
  }, [document]);
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

  return {
    document,
    setDocument,
    documentRef,
    body,
    setBody,
    status,
    setStatus,
    message,
    setMessage,
    retryToken,
    setRetryToken,
    markDirty,
  };
}
export type EditorSession = ReturnType<typeof useEditorSession>;
