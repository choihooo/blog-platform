import { validateEditorDocument, type EditorDocument } from "@blog-platform/editor";

import type { ContentAdapter, ContentFailure } from "../content-adapter/content-adapter.interface";
import { documentToPostRecord, pathForDocument, slugFromPath } from "./editor-save";
import {
  createPublicRefreshRetryToken,
  publicRefreshTargets,
  refreshPublicTargets,
  type PublicRefreshResult,
  type PublicRefreshRetryToken,
} from "./public-refresh";

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

type PublishAdapter = Pick<ContentAdapter, "createPost" | "updatePost" | "getPostBySlug">;

function codeFromContentFailure(code: ContentFailure["code"]): PublishWorkflowCode {
  if (code === "conflict") return "duplicate-slug";
  if (code === "retryable-failure" || code === "storage-failure" || code === "upstream-failure") {
    return "temporary-connectivity";
  }
  if (code === "auth-required") return "auth-required";
  if (code === "forbidden") return "forbidden";
  if (code === "validation-failure") return "validation-failure";
  return "unknown";
}

export function mapPublishAuthFailure(
  operation: PublicationOperation,
  document: EditorDocument,
  failure: {
    code: "auth-required" | "forbidden" | "auth-misconfigured" | "session-expired";
    message: string;
    retryable: boolean;
  },
): PublicationResult {
  return {
    ok: false,
    operation,
    code: failure.code === "auth-misconfigured" ? "forbidden" : failure.code,
    retryable: failure.retryable,
    message: failure.message,
    submittedDocument: document,
  };
}

function repositoryFailure(
  operation: PublicationOperation,
  document: EditorDocument,
  failure: ContentFailure,
  submittedSource?: string,
): PublicationResult {
  return {
    ok: false,
    operation,
    code: codeFromContentFailure(failure.code),
    retryable: failure.retryable,
    message: failure.message,
    submittedDocument: document,
    submittedSource,
  };
}

function metadata(document: EditorDocument) {
  return {
    slug: document.frontmatter.slug,
    category: document.frontmatter.category,
    tags: document.frontmatter.tags,
    status: document.frontmatter.status,
  };
}

function slugCandidate(title: string) {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function withStatus(document: EditorDocument, operation: PublicationOperation, nowIso: string) {
  const status =
    operation === "publish" ? "published" : operation === "archive" ? "archived" : "draft";
  const next: EditorDocument = {
    ...document,
    frontmatter: {
      ...document.frontmatter,
      status,
      updatedAt: nowIso,
    },
  };
  if (status === "published") {
    next.frontmatter.slug = next.frontmatter.slug || slugCandidate(next.frontmatter.title);
    next.frontmatter.publishedAt = next.frontmatter.publishedAt || nowIso;
  }
  return next;
}

export async function runPublicationOperation(input: {
  operation: PublicationOperation;
  document: EditorDocument;
  adapter: PublishAdapter;
  now?: Date;
  refresh?: (target: string) => Promise<void> | void;
}): Promise<PublicationResult> {
  const now = input.now ?? new Date();
  const next = withStatus(input.document, input.operation, now.toISOString());
  if (validateEditorDocument(next).length > 0) {
    return {
      ok: false,
      operation: input.operation,
      code: "validation-failure",
      retryable: false,
      message: validateEditorDocument(next)[0]?.message ?? "Invalid editor document",
      submittedDocument: input.document,
    };
  }
  if (input.operation === "publish" && !next.frontmatter.slug) {
    return {
      ok: false,
      operation: input.operation,
      code: "validation-failure",
      retryable: false,
      message: "Title cannot produce a usable slug",
      submittedDocument: input.document,
    };
  }

  const previousSlug = input.document.path ? slugFromPath(input.document.path) : undefined;
  const targetSlug = slugFromPath(pathForDocument(next));
  const [current, conflict] = await Promise.all([
    previousSlug
      ? input.adapter.getPostBySlug(previousSlug, { includeUnpublished: true })
      : input.adapter.getPostBySlug(targetSlug, { includeUnpublished: true }),
    input.adapter.getPostBySlug(targetSlug, { includeUnpublished: true }),
  ]);
  if (!current.ok) return repositoryFailure(input.operation, next, current.error);
  if (!conflict.ok) return repositoryFailure(input.operation, next, conflict.error);
  if (
    input.operation === "publish" &&
    conflict.data &&
    current.data &&
    conflict.data.id !== current.data.id
  ) {
    return {
      ok: false,
      operation: input.operation,
      code: "duplicate-slug",
      retryable: false,
      message: "Slug is already used by another post",
      submittedDocument: next,
    };
  }

  const post = documentToPostRecord(next, current.data, now);
  const repositoryResult = current.data
    ? await input.adapter.updatePost({
        slug: previousSlug ?? current.data.slug,
        post,
        authorIdentity: "cms-editor",
      })
    : await input.adapter.createPost({ post, authorIdentity: "cms-editor" });

  if (!repositoryResult.ok) {
    return repositoryFailure(input.operation, next, repositoryResult.error, post.content);
  }

  const savedDocument = {
    ...next,
    path: pathForDocument(next),
    sourceSha: `${repositoryResult.data.updatedAt}:${repositoryResult.data.slug}`,
    dirty: false,
    lastSavedAt: repositoryResult.data.updatedAt,
  };
  const targets = publicRefreshTargets({
    operation: input.operation,
    previous: metadata(input.document),
    next: metadata(savedDocument),
  });
  const publicRefresh = await refreshPublicTargets(targets, input.refresh, now);
  const sha = savedDocument.sourceSha ?? "";

  if (!publicRefresh.ok) {
    return {
      ok: false,
      operation: input.operation,
      code: "public-refresh-failed",
      retryable: true,
      message: publicRefresh.message,
      path: savedDocument.path,
      sha,
      slug: savedDocument.frontmatter.slug,
      publishedAt: savedDocument.frontmatter.publishedAt,
      updatedAt: savedDocument.frontmatter.updatedAt ?? savedDocument.lastSavedAt,
      repository: { ok: true, summary: `${input.operation} ${savedDocument.path}` },
      publicRefresh,
      retryToken: createPublicRefreshRetryToken({
        operation: input.operation,
        targets,
        postPath: savedDocument.path,
        postSha: sha,
        now,
      }),
      document: savedDocument,
    };
  }

  return {
    ok: true,
    operation: input.operation,
    path: savedDocument.path,
    sha,
    slug: savedDocument.frontmatter.slug,
    publishedAt: savedDocument.frontmatter.publishedAt,
    updatedAt: savedDocument.frontmatter.updatedAt ?? savedDocument.lastSavedAt,
    repository: { ok: true, summary: `${input.operation} ${savedDocument.path}` },
    publicRefresh,
    backupCleared: true,
    document: savedDocument,
  };
}
