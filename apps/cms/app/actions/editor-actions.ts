"use server";

import type { EditorDocument } from "@blog-platform/editor";

import { createLocalContentAdapter } from "../../lib/content-adapter/index";
import {
  createProtectedContentOperations,
  evaluateAccess,
  getCmsSession,
} from "../../lib/auth/index";
import { saveEditorDraft } from "../../lib/editor/index";
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
