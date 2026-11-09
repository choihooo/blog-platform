import type { EditorDocument } from "@blog-platform/core/content";
import type { UploadEditorMediaResult } from "./media";
import type { PublicRefreshResult, PublicRefreshRetryToken } from "./public-refresh";
import type { PublicationResult } from "./publication";
import type { SaveEditorDraftResult } from "./save-result";
export type PreviewResult =
  | {
      ok: true;
      slug: string;
      contentSha: string;
      path: string;
      sha: string;
      updatedAt?: string;
      expiresInSeconds: number;
      url: string;
    }
  | { ok: false; code: string; message: string };
export type RefreshRetryResult =
  | { ok: true; operation: "retry-public-refresh"; publicRefresh: PublicRefreshResult }
  | {
      ok: false;
      operation: "retry-public-refresh";
      code: string;
      retryable: boolean;
      message: string;
      publicRefresh?: PublicRefreshResult;
    };
export type EditorCommands = {
  save(document: EditorDocument): Promise<SaveEditorDraftResult>;
  publish(input: { document: EditorDocument; nowIso?: string }): Promise<PublicationResult>;
  unpublish(input: { document: EditorDocument }): Promise<PublicationResult>;
  archive(input: { document: EditorDocument }): Promise<PublicationResult>;
  retry(input: { retryToken: PublicRefreshRetryToken }): Promise<RefreshRetryResult>;
  upload(formData: FormData): Promise<UploadEditorMediaResult>;
  preview(input: { document: EditorDocument }): Promise<PreviewResult>;
};
