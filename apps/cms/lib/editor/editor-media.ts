import type { EditorNode } from "@blog-platform/editor";

import type { RepositoryFailureCode } from "../content-adapter";
import type { MediaTarget } from "./media-path";

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

export function imageNode(input: {
  src: string;
  alt?: string;
  title?: string;
  caption?: string;
}): Extract<EditorNode, { type: "image" }> {
  return {
    type: "image",
    src: input.src,
    alt: input.alt || undefined,
    title: input.title || undefined,
    caption: input.caption || undefined,
  };
}

export function repositoryToUploadCode(code: RepositoryFailureCode): UploadMediaCode {
  if (code === "unauthorized") return "forbidden";
  if (code === "temporary-connectivity" || code === "rate-limit") return "temporary-connectivity";
  if (code === "validation-failure") return "validation-failure";
  return "unknown";
}

export function authToUploadCode(code: string): UploadMediaCode {
  if (code === "auth-required") return "auth-required";
  if (code === "session-expired") return "session-expired";
  if (code === "forbidden" || code === "auth-misconfigured") return "forbidden";
  return "unknown";
}

export function uploadStateFromResult(result: UploadEditorMediaResult): MediaUploadState {
  if (result.ok) return "uploaded";
  if (result.code === "validation-failure" || result.code === "slug-required")
    return "validation-failed";
  return result.code === "unknown" ? "failed" : result.code;
}

export function targetFromForm(value: FormDataEntryValue | null): MediaTarget | null {
  return value === "body" || value === "cover" ? value : null;
}
