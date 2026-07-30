"use server";

import type { EditorDocument } from "@blog-platform/editor";

import { createLocalContentAdapter } from "../../lib/content-adapter/index";
import {
  createProtectedContentOperations,
  evaluateAccess,
  getCmsSession,
} from "../../lib/auth/index";
import {
  authToUploadCode,
  imageNode,
  mediaPath,
  prepareMediaFile,
  publicPath,
  repositoryToUploadCode,
  saveEditorDraft,
  slugForMedia,
  targetFromForm,
  type UploadEditorMediaResult,
} from "../../lib/editor/index";
import { repositoryRoot } from "../../lib/editor/root";

export async function saveEditorDraftAction(document: EditorDocument) {
  const adapter = createLocalContentAdapter(repositoryRoot());
  const protectedOperations = createProtectedContentOperations(adapter, async () =>
    evaluateAccess(await getCmsSession(), repositoryRoot()),
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
              message: result.message,
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
              message: result.message,
              retryable: result.retryable,
              submittedContent: input.content,
            },
          };
    },
  };

  const result = await saveEditorDraft(document, guardedAdapter);
  return result;
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
    return { ok: false, code: "validation-failure", retryable: false, message: prepared.message };
  }

  const adapter = createLocalContentAdapter(repositoryRoot());
  const protectedOperations = createProtectedContentOperations(adapter, async () =>
    evaluateAccess(await getCmsSession(), repositoryRoot()),
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
      message: result.message,
    };
  }
  if (!result.value.success) {
    return {
      ok: false,
      code: repositoryToUploadCode(result.value.error.code),
      retryable: result.value.error.retryable,
      message: result.value.error.message,
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
