import type { EditorDocument } from "@blog-platform/core/content";
export type SaveErrorCode =
  | "validation-failure"
  | "unsupported-content"
  | "auth-required"
  | "forbidden"
  | "session-expired"
  | "stale-file"
  | "temporary-connectivity"
  | "unknown";

export type SaveEditorDraftResult =
  | {
      ok: true;
      path: string;
      sha: string;
      commitId?: string;
      backupCleared: true;
      slug?: string;
      updatedAt?: string;
    }
  | {
      ok: false;
      code: SaveErrorCode;
      retryable: boolean;
      message: string;
      submittedDocument: EditorDocument;
      submittedSource?: string;
    };
