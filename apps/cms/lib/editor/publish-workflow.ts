import {
  createSlugCandidate,
  parsePostFile,
  validateUniqueSlug,
  type PostStatus,
} from "@blog-platform/markdown";
import { editorDocumentToMdx, type EditorDocument } from "@blog-platform/editor";

import type {
  AdapterResult,
  ContentAdapter,
  ContentChangeResult,
  RepositoryFailureCode,
  RepositoryFailureState,
} from "../content-adapter/index";
import { pathForDocument } from "./editor-save";
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
  | "unsupported-mdx"
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
      document?: EditorDocument;
    };

type PublishAdapter = Pick<ContentAdapter, "createFile" | "updateFile" | "listFiles" | "readFile">;

function codeFromRepository(code: RepositoryFailureCode): PublishWorkflowCode {
  if (code === "stale-file") return "stale-file";
  if (code === "temporary-connectivity" || code === "rate-limit") return "temporary-connectivity";
  if (code === "unauthorized") return "forbidden";
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
  failure: RepositoryFailureState,
  submittedSource?: string,
): PublicationResult {
  return {
    ok: false,
    operation,
    code: codeFromRepository(failure.code),
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

function withStatus(document: EditorDocument, status: PostStatus, nowIso: string): EditorDocument {
  const next: EditorDocument = {
    ...document,
    frontmatter: {
      ...document.frontmatter,
      status,
      updatedAt: nowIso,
    },
  };
  if (status === "published") {
    const slug = next.frontmatter.slug || createSlugCandidate(next.frontmatter.title).data;
    next.frontmatter.slug = slug;
    next.frontmatter.publishedAt = next.frontmatter.publishedAt || nowIso;
  }
  return next;
}

async function existingPosts(adapter: Pick<ContentAdapter, "listFiles" | "readFile">) {
  const listed = await adapter.listFiles({ root: "posts" });
  if (!listed.success) return [];
  const files = await Promise.all(
    listed.data.files
      .filter((file) => file.kind === "post")
      .map(async (file) => {
        const read = await adapter.readFile({ path: file.path });
        if (!read.success) return { path: file.path };
        const slug = /^slug:\s*"?([^"\n]+)"?/m.exec(read.data.file.content)?.[1]?.trim();
        return { path: file.path, slug };
      }),
  );
  return files;
}

async function preparePublication(
  operation: PublicationOperation,
  document: EditorDocument,
  adapter: Pick<ContentAdapter, "listFiles" | "readFile">,
  nowIso: string,
) {
  const status: PostStatus =
    operation === "publish" ? "published" : operation === "archive" ? "archived" : "draft";
  const next = withStatus(document, status, nowIso);

  if (operation === "publish") {
    if (!next.frontmatter.slug) {
      return {
        ok: false as const,
        result: {
          ok: false,
          operation,
          code: "validation-failure",
          retryable: false,
          message: "Title cannot produce a usable slug",
          submittedDocument: document,
        } satisfies PublicationResult,
      };
    }
    const unique = validateUniqueSlug({
      candidate: next.frontmatter.slug,
      currentPath: next.path,
      existingPosts: await existingPosts(adapter),
    });
    if (!unique.success) {
      return {
        ok: false as const,
        result: {
          ok: false,
          operation,
          code: "duplicate-slug",
          retryable: false,
          message: unique.issues[0]?.message ?? "Slug is already used by another post",
          submittedDocument: next,
        } satisfies PublicationResult,
      };
    }
  }

  const serialized = editorDocumentToMdx(next);
  if (!serialized.ok) {
    return {
      ok: false as const,
      result: {
        ok: false,
        operation,
        code: serialized.code === "unsupported-format" ? "unsupported-mdx" : "validation-failure",
        retryable: false,
        message: serialized.issues[0]?.message ?? "Editor document cannot be published",
        submittedDocument: next,
      } satisfies PublicationResult,
    };
  }
  if (operation === "publish") {
    const parsed = parsePostFile({ path: pathForDocument(next), source: serialized.source });
    if (!parsed.success) {
      return {
        ok: false as const,
        result: {
          ok: false,
          operation,
          code: "validation-failure",
          retryable: false,
          message: parsed.issues[0]?.message ?? "Published post is invalid",
          submittedDocument: next,
          submittedSource: serialized.source,
        } satisfies PublicationResult,
      };
    }
  }
  return { ok: true as const, document: next, source: serialized.source };
}

export async function runPublicationOperation(input: {
  operation: PublicationOperation;
  document: EditorDocument;
  adapter: PublishAdapter;
  now?: Date;
  refresh?: (target: string) => Promise<void> | void;
}): Promise<PublicationResult> {
  const now = input.now ?? new Date();
  const prepared = await preparePublication(
    input.operation,
    input.document,
    input.adapter,
    now.toISOString(),
  );
  if (!prepared.ok) return prepared.result;

  const path = pathForDocument(prepared.document);
  const intent =
    input.operation === "publish"
      ? "prepare-publish"
      : input.operation === "archive"
        ? "prepare-archive"
        : "prepare-unpublish";
  const repositoryResult: AdapterResult<ContentChangeResult> = prepared.document.sourceSha
    ? await input.adapter.updateFile({
        path,
        content: prepared.source,
        expectedSha: prepared.document.sourceSha,
        intent,
      })
    : await input.adapter.createFile({ path, content: prepared.source, intent });

  if (!repositoryResult.success) {
    return repositoryFailure(
      input.operation,
      prepared.document,
      repositoryResult.error,
      prepared.source,
    );
  }

  const sha = repositoryResult.data.sha ?? prepared.document.sourceSha ?? "";
  const targets = publicRefreshTargets({
    operation: input.operation,
    previous: metadata(input.document),
    next: metadata(prepared.document),
  });
  const publicRefresh = await refreshPublicTargets(targets, input.refresh, now);
  const savedDocument = {
    ...prepared.document,
    path: repositoryResult.data.path,
    sourceSha: sha,
    dirty: false,
    lastSavedAt: now.toISOString(),
  };

  if (!publicRefresh.ok) {
    return {
      ok: false,
      operation: input.operation,
      code: "public-refresh-failed",
      retryable: true,
      message: publicRefresh.message,
      path: repositoryResult.data.path,
      sha,
      commitId: repositoryResult.data.commitId,
      slug: savedDocument.frontmatter.slug,
      publishedAt: savedDocument.frontmatter.publishedAt,
      repository: { ok: true, summary: repositoryResult.data.summary },
      publicRefresh,
      retryToken: createPublicRefreshRetryToken({
        operation: input.operation,
        targets,
        postPath: repositoryResult.data.path,
        postSha: sha,
        now,
      }),
      document: savedDocument,
    };
  }

  return {
    ok: true,
    operation: input.operation,
    path: repositoryResult.data.path,
    sha,
    commitId: repositoryResult.data.commitId,
    slug: savedDocument.frontmatter.slug,
    publishedAt: savedDocument.frontmatter.publishedAt,
    repository: { ok: true, summary: repositoryResult.data.summary },
    publicRefresh,
    backupCleared: true,
    document: savedDocument,
  };
}
