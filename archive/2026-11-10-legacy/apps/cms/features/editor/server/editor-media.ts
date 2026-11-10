import type { ContentFailureCode, EditorNode } from "@blog-platform/core/content";
import type { MediaUploadState, UploadEditorMediaResult, UploadMediaCode } from "../model/media";
export type { MediaUploadState, UploadEditorMediaResult, UploadMediaCode } from "../model/media";

import type { MediaTarget } from "./media-path";

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

export function contentToUploadCode(code: ContentFailureCode): UploadMediaCode {
  if (code === "auth-required") return "auth-required";
  if (code === "forbidden") return "forbidden";
  if (code === "validation-failure") return "validation-failure";
  if (code === "storage-failure" || code === "retryable-failure" || code === "upstream-failure")
    return "temporary-connectivity";
  return "unknown";
}
