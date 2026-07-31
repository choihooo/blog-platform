"use server";

import { createHash } from "node:crypto";

import type { EditorDocument } from "@blog-platform/editor";
import { editorDocumentToMdx } from "@blog-platform/editor";
import { revalidatePath } from "next/cache";

import { createRuntimeContentAdapter } from "../../lib/content-adapter/index";
import {
  createProtectedContentOperations,
  evaluateAccess,
  getCmsSession,
} from "../../lib/auth/index";
import {
  authToUploadCode,
  imageNode,
  mapPublishAuthFailure,
  mediaPath,
  prepareMediaFile,
  publicPath,
  createConfiguredPublicRefresh,
  refreshPublicTargets,
  runPublicationOperation,
  repositoryToUploadCode,
  saveEditorDraft,
  slugForMedia,
  targetFromForm,
  type PublicRefreshRetryToken,
  type UploadEditorMediaResult,
} from "../../lib/editor/index";
import { repositoryRoot } from "../../lib/editor/root";
import { issuePreviewToken, secretFreeMessage } from "../../lib/security";

function responseSecrets() {
  return [
    process.env.GITHUB_TOKEN,
    process.env.GITHUB_APP_PRIVATE_KEY,
    process.env.PREVIEW_TOKEN_SECRET,
    process.env.NEXTAUTH_SECRET,
    process.env.AUTH_SECRET,
  ];
}

function redact(message: string | undefined) {
  return secretFreeMessage(message, responseSecrets());
}

function editorPathFromContentPath(path?: string) {
  if (!path || !/^(?:content|db)\/posts\//.test(path)) return;
  return `/posts/${path.replace(/^(?:content|db)\/posts\//, "").replace(/\.mdx$/, "")}`;
}

function refreshCmsEditorPaths(path?: string) {
  revalidatePath("/posts");
  const editorPath = editorPathFromContentPath(path);
  if (editorPath) revalidatePath(editorPath);
}

export async function saveEditorDraftAction(document: EditorDocument) {
  const root = repositoryRoot();
  const adapter = await createRuntimeContentAdapter(root);
  const protectedOperations = createProtectedContentOperations(adapter, async () =>
    evaluateAccess(await getCmsSession(), root),
  );

  const guardedAdapter = {
    async createFile(input: Parameters<typeof adapter.createFile>[0]) {
      const result = await protectedOperations.createFile(input);
      return result.ok
        ? result.value
        : {
            success: false as const,
            error: {
              code: "unauthorized" as const,
              message: redact(result.message),
              retryable: result.retryable,
              submittedContent: input.content,
            },
          };
    },
    async updateFile(input: Parameters<typeof adapter.updateFile>[0]) {
      const result = await protectedOperations.updateFile(input);
      return result.ok
        ? result.value
        : {
            success: false as const,
            error: {
              code: "unauthorized" as const,
              message: redact(result.message),
              retryable: result.retryable,
              submittedContent: input.content,
            },
          };
    },
    async deleteFile(input: Parameters<typeof adapter.deleteFile>[0]) {
      const result = await protectedOperations.deleteFile(input);
      return result.ok
        ? result.value
        : {
            success: false as const,
            error: {
              code: "unauthorized" as const,
              message: redact(result.message),
              retryable: result.retryable,
              submittedContent: "",
            },
          };
    },
  };

  const result = await saveEditorDraft(document, guardedAdapter);
  if (result.ok) refreshCmsEditorPaths(result.path);
  return result;
}

async function publicationAction(
  operation: "publish" | "unpublish" | "archive",
  document: EditorDocument,
  now?: Date,
) {
  const root = repositoryRoot();
  const decision = await evaluateAccess(await getCmsSession(), root);
  if (decision.status !== "authorized") {
    return mapPublishAuthFailure(operation, document, {
      code:
        decision.status === "unauthenticated"
          ? "auth-required"
          : decision.status === "expired"
            ? "session-expired"
            : decision.status === "misconfigured"
              ? "auth-misconfigured"
              : "forbidden",
      message: redact(decision.reason),
      retryable: decision.status === "unauthenticated" || decision.status === "expired",
    });
  }

  const adapter = await createRuntimeContentAdapter(root);
  const result = await runPublicationOperation({
    operation,
    document,
    adapter,
    now,
    refresh: createConfiguredPublicRefresh(),
  });
  if (result.ok) refreshCmsEditorPaths(result.path);
  return result;
}

export async function publishPostAction(input: { document: EditorDocument; nowIso?: string }) {
  return publicationAction(
    "publish",
    input.document,
    input.nowIso ? new Date(input.nowIso) : undefined,
  );
}

export async function unpublishPostAction(input: { document: EditorDocument }) {
  return publicationAction("unpublish", input.document);
}

export async function archivePostAction(input: { document: EditorDocument }) {
  return publicationAction("archive", input.document);
}

export async function retryPublicRefreshAction(input: { retryToken: PublicRefreshRetryToken }) {
  const root = repositoryRoot();
  const decision = await evaluateAccess(await getCmsSession(), root);
  if (decision.status !== "authorized") {
    return {
      ok: false as const,
      operation: "retry-public-refresh" as const,
      code:
        decision.status === "unauthenticated"
          ? "auth-required"
          : decision.status === "expired"
            ? "session-expired"
            : "forbidden",
      retryable: decision.status === "unauthenticated" || decision.status === "expired",
      message: redact(decision.reason),
    };
  }
  const publicRefresh = await refreshPublicTargets(
    input.retryToken.targets,
    createConfiguredPublicRefresh(),
  );
  return publicRefresh.ok
    ? { ok: true as const, operation: "retry-public-refresh" as const, publicRefresh }
    : {
        ok: false as const,
        operation: "retry-public-refresh" as const,
        code: "public-refresh-failed" as const,
        retryable: publicRefresh.retryable,
        message: redact(publicRefresh.message),
        publicRefresh,
      };
}

export async function uploadEditorMediaAction(
  formData: FormData,
): Promise<UploadEditorMediaResult> {
  const target = targetFromForm(formData.get("target"));
  const file = formData.get("file");
  const slug = slugForMedia(String(formData.get("postSlug") ?? ""));
  const alt = String(formData.get("alt") ?? "");
  const title = String(formData.get("title") ?? "");
  const caption = String(formData.get("caption") ?? "");

  if (!target) {
    return {
      ok: false,
      code: "validation-failure",
      retryable: false,
      message: "Invalid upload target",
    };
  }
  if (!slug) {
    return {
      ok: false,
      code: "slug-required",
      retryable: false,
      message: "Title is required before uploading media",
    };
  }
  if (!(file instanceof File)) {
    return {
      ok: false,
      code: "validation-failure",
      retryable: false,
      message: "Image file is required",
    };
  }

  const prepared = await prepareMediaFile(file);
  if (!prepared.ok) {
    return {
      ok: false,
      code: "validation-failure",
      retryable: false,
      message: redact(prepared.message),
    };
  }

  const root = repositoryRoot();
  const adapter = await createRuntimeContentAdapter(root);
  const protectedOperations = createProtectedContentOperations(adapter, async () =>
    evaluateAccess(await getCmsSession(), root),
  );
  const path = mediaPath({ target, slug, hash: prepared.hash, extension: prepared.extension });
  const result = await protectedOperations.commitMedia({
    path,
    contentBase64: prepared.base64,
    intent: "save-media",
  });

  if (!result.ok) {
    return {
      ok: false,
      code: authToUploadCode(result.code),
      retryable: result.retryable,
      message: redact(result.message),
    };
  }
  if (!result.value.success) {
    return {
      ok: false,
      code: repositoryToUploadCode(result.value.error.code),
      retryable: result.value.error.retryable,
      message: redact(result.value.error.message),
    };
  }

  const publicMediaPath = publicPath(path);
  return {
    ok: true,
    media: {
      path,
      publicPath: publicMediaPath,
      sha: result.value.data.sha ?? "",
      commitId: result.value.data.commitId,
      sizeBytes: prepared.sizeBytes,
    },
    reference:
      target === "cover"
        ? { target, coverImage: publicMediaPath }
        : { target, node: imageNode({ src: publicMediaPath, alt, title, caption }) },
    message: "Image uploaded. Save the post to keep this reference.",
  };
}

export async function createPreviewTokenAction(input: { document: EditorDocument }) {
  const secret = process.env.PREVIEW_TOKEN_SECRET;
  if (!secret) {
    return {
      ok: false as const,
      code: "preview-misconfigured" as const,
      message: "Preview token secret is not configured.",
    };
  }

  const serialized = editorDocumentToMdx(input.document);
  if (!serialized.ok) {
    return {
      ok: false as const,
      code: serialized.code,
      message: "Preview is unavailable until the document is valid.",
    };
  }

  const slug = input.document.frontmatter.slug || input.document.id;
  const contentSha = createHash("sha256").update(serialized.source).digest("hex");
  const token = issuePreviewToken({ slug, contentSha, secret });
  return {
    ok: true as const,
    slug,
    contentSha,
    expiresInSeconds: 30 * 60,
    url: `/preview/${encodeURIComponent(slug)}?token=${encodeURIComponent(token)}`,
  };
}
