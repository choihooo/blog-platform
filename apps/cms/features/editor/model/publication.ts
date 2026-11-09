import type { EditorDocument } from "@blog-platform/core/content";
import type { PublicRefreshResult, PublicRefreshRetryToken } from "./public-refresh";
export type PublicationOperation = "publish" | "unpublish" | "archive";

export type PublishWorkflowCode =
  | "validation-failure"
  | "duplicate-slug"
  | "unsupported-content"
  | "auth-required"
  | "forbidden"
  | "session-expired"
  | "stale-file"
  | "temporary-connectivity"
  | "public-refresh-failed"
  | "unknown";

export type PublicationResult =
  | {
      ok: true;
      operation: PublicationOperation;
      path: string;
      sha: string;
      commitId?: string;
      slug?: string;
      publishedAt?: string;
      updatedAt?: string;
      repository: { ok: true; summary: string };
      publicRefresh: PublicRefreshResult;
      backupCleared: true;
      document: EditorDocument;
    }
  | {
      ok: false;
      operation: PublicationOperation;
      code: PublishWorkflowCode;
      retryable: boolean;
      message: string;
      submittedDocument?: EditorDocument;
      submittedSource?: string;
      path?: string;
      sha?: string;
      commitId?: string;
      slug?: string;
      publishedAt?: string;
      repository?: { ok: true; summary: string };
      publicRefresh?: PublicRefreshResult;
      retryToken?: PublicRefreshRetryToken;
      updatedAt?: string;
      document?: EditorDocument;
    };
