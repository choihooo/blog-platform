"use client";

import { useMemo, useState, useTransition } from "react";
import type { EditorDocument, EditorNode } from "@blog-platform/editor";

import { saveEditorDraftAction } from "../../app/actions/editor-actions";
import { clearBackup, writeBackup } from "../../lib/editor/draft-backup";
import { EditorToolbar } from "./editor-toolbar";
import { FrontmatterPanel } from "./frontmatter-panel";
import { PreviewPanel } from "./preview-panel";
import { RecoveryBanner } from "./recovery-banner";
import { SaveStatusBadge, type SaveStatus } from "./save-status";

function nodesToText(nodes: EditorNode[]) {
  return nodes
    .map((node) => {
      if (node.type === "horizontalRule") return "---";
      if (node.type === "image") return `![${node.alt ?? ""}](${node.src})`;
      return "text" in node ? node.text : "";
    })
    .join("\n\n");
}

export function EditorScreen({ initialDocument }: { initialDocument: EditorDocument }) {
  const [document, setDocument] = useState(initialDocument);
  const [body, setBody] = useState(nodesToText(initialDocument.body));
  const [status, setStatus] = useState<SaveStatus>(
    initialDocument.frontmatter.title ? "clean" : "validation",
  );
  const [message, setMessage] = useState<string>();
  const [isPending, startTransition] = useTransition();

  const previewDocument = useMemo(
    () => ({ ...document, body: body ? [{ type: "paragraph" as const, text: body }] : [] }),
    [body, document],
  );

  function markDirty(next: EditorDocument, nextBody = body) {
    const dirty = {
      ...next,
      body: nextBody ? [{ type: "paragraph" as const, text: nextBody }] : [],
      dirty: true,
    };
    setDocument(dirty);
    setStatus(dirty.frontmatter.title.trim() ? "dirty" : "validation");
    if (typeof window !== "undefined" && typeof window.localStorage?.setItem === "function") {
      writeBackup(window.localStorage, dirty);
    }
  }

  function save() {
    const submitted = {
      ...document,
      body: body ? [{ type: "paragraph" as const, text: body }] : [],
    };
    setStatus("pending");
    startTransition(() => {
      void saveEditorDraftAction(submitted).then((result) => {
        if (result.ok) {
          const saved = {
            ...submitted,
            path: result.path,
            sourceSha: result.sha,
            dirty: false,
            lastSavedAt: new Date().toISOString(),
          };
          setDocument(saved);
          setStatus("saved");
          setMessage(undefined);
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
      });
    });
  }

  return (
    <div className="overflow-hidden rounded-md border border-border bg-background">
      <RecoveryBanner message={message} onDiscard={() => setMessage(undefined)} onRetry={save} />
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="text-lg font-semibold">Editor</h2>
        <SaveStatusBadge status={isPending ? "pending" : status} />
      </div>
      <EditorToolbar onSave={save} saveDisabled={!document.frontmatter.title.trim() || isPending} />
      <div className="grid min-h-[560px] grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px]">
        <main className="min-w-0">
          <textarea
            aria-label="Post body"
            className="min-h-[420px] w-full resize-y bg-background p-4 font-mono text-sm leading-6 outline-none"
            value={body}
            onChange={(event) => {
              setBody(event.currentTarget.value);
              markDirty(document, event.currentTarget.value);
            }}
          />
          <PreviewPanel document={previewDocument} />
        </main>
        <FrontmatterPanel
          frontmatter={document.frontmatter}
          onChange={(frontmatter) => markDirty({ ...document, frontmatter })}
        />
      </div>
    </div>
  );
}
