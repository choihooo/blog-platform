import { type EditorDocument, editorDocumentToMdx } from "@blog-platform/editor";

import type {
  AdapterResult,
  ContentAdapter,
  ContentChangeResult,
  RepositoryFailureCode,
  RepositoryFailureState,
} from "../content-adapter/index";

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function slugFromPath(path: string) {
  return path.replace(/^content\/posts\//, "").replace(/\.mdx$/, "");
}

type SaveErrorCode =
  | "validation-failure"
  | "unsupported-mdx"
  | "auth-required"
  | "forbidden"
  | "session-expired"
  | "stale-file"
  | "temporary-connectivity"
  | "unknown";

export type SaveEditorDraftResult =
  | { ok: true; path: string; sha: string; commitId?: string; backupCleared: true }
  | {
      ok: false;
      code: SaveErrorCode;
      retryable: boolean;
      message: string;
      submittedDocument: EditorDocument;
      submittedSource?: string;
    };

function codeFromRepository(code: RepositoryFailureCode): SaveErrorCode {
  if (code === "stale-file") return "stale-file";
  if (code === "temporary-connectivity" || code === "rate-limit") return "temporary-connectivity";
  if (code === "unauthorized") return "forbidden";
  if (code === "validation-failure") return "validation-failure";
  return "unknown";
}

function failureResult(
  document: EditorDocument,
  failure: RepositoryFailureState,
  submittedSource?: string,
): SaveEditorDraftResult {
  return {
    ok: false,
    code: codeFromRepository(failure.code),
    retryable: failure.retryable,
    message: failure.message,
    submittedDocument: document,
    submittedSource,
  };
}

export function mapAuthFailure(
  document: EditorDocument,
  failure: {
    code: "auth-required" | "forbidden" | "auth-misconfigured" | "session-expired";
    message: string;
    retryable: boolean;
  },
  submittedSource?: string,
): SaveEditorDraftResult {
  return {
    ok: false,
    code: failure.code === "auth-misconfigured" ? "forbidden" : failure.code,
    retryable: failure.retryable,
    message: failure.message,
    submittedDocument: document,
    submittedSource,
  };
}

export function pathForDocument(document: EditorDocument) {
  const fallback = slugFromPath(document.path ?? "");
  const slug =
    normalizeSlug(document.frontmatter.slug ?? "") ||
    normalizeSlug(document.frontmatter.title) ||
    fallback ||
    `draft-${Date.now()}`;
  return `content/posts/${slug}.mdx`;
}

export async function saveEditorDraft(
  document: EditorDocument,
  adapter: Pick<ContentAdapter, "createFile" | "updateFile"> & {
    deleteFile?: ContentAdapter["deleteFile"];
  },
): Promise<SaveEditorDraftResult> {
  const serialized = editorDocumentToMdx(document);
  if (!serialized.ok) {
    return {
      ok: false,
      code: serialized.code === "unsupported-format" ? "unsupported-mdx" : "validation-failure",
      retryable: false,
      message: serialized.issues[0]?.message ?? "Editor document cannot be saved",
      submittedDocument: document,
    };
  }

  const path = pathForDocument(document);
  const nextDocument: EditorDocument = {
    ...document,
    frontmatter: {
      ...document.frontmatter,
      slug: normalizeSlug(document.frontmatter.slug ?? ""),
    },
  };

  if (document.sourceSha && document.path && document.path !== path) {
    if (!adapter.deleteFile) {
      return {
        ok: false,
        code: "forbidden",
        retryable: false,
        message: "Draft rename requires delete permission",
        submittedDocument: nextDocument,
      };
    }
    const createResult = await adapter.createFile({
      path,
      content: serialized.source,
      intent: "create-draft",
    });
    if (!createResult.success) return failureResult(nextDocument, createResult.error, serialized.source);
    const deleteResult = await adapter.deleteFile({
      path: document.path,
      expectedSha: document.sourceSha,
      intent: "delete-file",
    });
    if (!deleteResult.success) return failureResult(nextDocument, deleteResult.error, serialized.source);
    return {
      ok: true,
      path: createResult.data.path,
      sha: createResult.data.sha ?? "",
      commitId: createResult.data.commitId,
      backupCleared: true,
    };
  }

  const result: AdapterResult<ContentChangeResult> = document.sourceSha
    ? await adapter.updateFile({
        path,
        content: serialized.source,
        expectedSha: document.sourceSha,
        intent: "save-draft",
      })
    : await adapter.createFile({
        path,
        content: serialized.source,
        intent: "create-draft",
      });

  if (!result.success) return failureResult(nextDocument, result.error, serialized.source);
  return {
    ok: true,
    path: result.data.path,
    sha: result.data.sha ?? document.sourceSha ?? "",
    commitId: result.data.commitId,
    backupCleared: true,
  };
}
