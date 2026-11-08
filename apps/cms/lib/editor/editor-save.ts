import { createHash } from "node:crypto";

import {
  editorDocumentToPostContent,
  serializePostContent,
  textFromEditorNodes,
  validateEditorDocument,
  type EditorDocument,
} from "@blog-platform/core/content";

import type { ContentAdapter, ContentFailure, PostRecord } from "@blog-platform/core/content";

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function slugFromPath(path: string) {
  return path.replace(/^db\/posts\//, "");
}

type SaveErrorCode =
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

function codeFromContentFailure(code: ContentFailure["code"]): SaveErrorCode {
  if (code === "conflict") return "stale-file";
  if (code === "retryable-failure" || code === "storage-failure" || code === "upstream-failure") {
    return "temporary-connectivity";
  }
  if (code === "auth-required") return "auth-required";
  if (code === "forbidden") return "forbidden";
  if (code === "validation-failure") return "validation-failure";
  return "unknown";
}

function failureResult(
  document: EditorDocument,
  failure: ContentFailure,
  submittedSource?: string,
): SaveEditorDraftResult {
  return {
    ok: false,
    code: codeFromContentFailure(failure.code),
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
  return `db/posts/${slug}`;
}

function documentId(document: EditorDocument, slug: string) {
  if (document.id && !document.id.startsWith("draft-")) return document.id;
  return createHash("md5").update(slug).digest("hex");
}

function documentToPostRecord(
  document: EditorDocument,
  existing?: PostRecord | null,
  now = new Date(),
): PostRecord {
  const slug =
    normalizeSlug(document.frontmatter.slug ?? "") || slugFromPath(pathForDocument(document));
  const content = serializePostContent(editorDocumentToPostContent(document));
  const text = textFromEditorNodes(document.body);
  const status = document.frontmatter.status;
  const updatedAt = now.toISOString();
  const publishedAt =
    status === "published"
      ? (document.frontmatter.publishedAt ?? existing?.publishedAt ?? updatedAt)
      : null;

  return {
    id: existing?.id ?? documentId(document, slug),
    slug,
    title: document.frontmatter.title.trim(),
    content,
    summary: document.frontmatter.excerpt?.trim() || text.slice(0, 240),
    categoryId: existing?.categoryId ?? null,
    categoryPath: document.frontmatter.category ?? existing?.categoryPath ?? null,
    heroImageKey: document.frontmatter.coverImage ?? existing?.heroImageKey ?? null,
    publishedAt,
    updatedAt,
    isPublished: status === "published" ? 1 : 0,
    viewCount: existing?.viewCount ?? 0,
    tags: document.frontmatter.tags ?? existing?.tags ?? [],
    mediaRefs: existing?.mediaRefs ?? [],
  };
}

export async function saveEditorDraft(
  document: EditorDocument,
  adapter: Pick<ContentAdapter, "createPost" | "updatePost" | "getPostBySlug">,
  now = new Date(),
): Promise<SaveEditorDraftResult> {
  if (validateEditorDocument(document).length > 0) {
    return {
      ok: false,
      code: "validation-failure",
      retryable: false,
      message: validateEditorDocument(document)[0]?.message ?? "Invalid editor document",
      submittedDocument: document,
    };
  }

  const previousSlug = document.path ? slugFromPath(document.path) : undefined;
  const slug = slugFromPath(pathForDocument(document));
  const existing = previousSlug
    ? await adapter.getPostBySlug(previousSlug, { includeUnpublished: true })
    : await adapter.getPostBySlug(slug, { includeUnpublished: true });
  if (!existing.ok) return failureResult(document, existing.error);

  const nextDocument: EditorDocument = {
    ...document,
    frontmatter: {
      ...document.frontmatter,
      slug,
      status: document.frontmatter.status === "published" ? "published" : "draft",
    },
  };
  const post = documentToPostRecord(nextDocument, existing.data, now);
  const submittedSource = post.content;
  const result = existing.data
    ? await adapter.updatePost({
        slug: previousSlug ?? existing.data.slug,
        post,
        authorIdentity: "cms-editor",
      })
    : await adapter.createPost({ post, authorIdentity: "cms-editor" });

  if (!result.ok) return failureResult(nextDocument, result.error, submittedSource);

  return {
    ok: true,
    path: pathForDocument(nextDocument),
    sha: `${result.data.updatedAt}:${result.data.slug}`,
    backupCleared: true,
    slug: result.data.slug,
    updatedAt: result.data.updatedAt,
  };
}

export { documentToPostRecord };
