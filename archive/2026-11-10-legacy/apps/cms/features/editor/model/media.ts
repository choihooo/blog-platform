import type { EditorNode } from "@blog-platform/core/content";
export type UploadMediaCode =
  | "validation-failure"
  | "slug-required"
  | "auth-required"
  | "forbidden"
  | "session-expired"
  | "temporary-connectivity"
  | "unknown";

export type UploadEditorMediaResult =
  | {
      ok: true;
      media: {
        path: string;
        publicPath: string;
        sha: string;
        commitId?: string;
        sizeBytes: number;
      };
      reference:
        | { target: "body"; node: Extract<EditorNode, { type: "image" }> }
        | { target: "cover"; coverImage: string };
      message: string;
    }
  | { ok: false; code: UploadMediaCode; retryable: boolean; message: string };

export type MediaUploadState =
  | "idle"
  | "validating"
  | "uploading"
  | "uploaded"
  | "validation-failed"
  | "auth-required"
  | "forbidden"
  | "session-expired"
  | "temporary-connectivity"
  | "failed";
