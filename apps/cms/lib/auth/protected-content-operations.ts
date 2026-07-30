import type { ContentAdapter, ContentChangeRequest } from "../content-adapter/index";
import { guardMutation } from "./mutation-guard";
import type { AccessDecision, GuardedMutationResult } from "./types";

type DecisionProvider = () => Promise<AccessDecision> | AccessDecision;

export function createProtectedContentOperations(
  adapter: ContentAdapter,
  getDecision: DecisionProvider,
) {
  const withAuth = async <T>(operation: () => Promise<T>): Promise<GuardedMutationResult<T>> =>
    guardMutation(await getDecision(), operation);

  return {
    createFile(input: ContentChangeRequest) {
      return withAuth(() => adapter.createFile(input));
    },
    updateFile(input: ContentChangeRequest & { expectedSha: string }) {
      return withAuth(() => adapter.updateFile(input));
    },
    deleteFile(input: { path: string; expectedSha: string; intent: "delete-file" }) {
      return withAuth(() => adapter.deleteFile(input));
    },
    commitMedia(input: {
      path: string;
      contentBase64: string;
      expectedSha?: string;
      intent: "save-media";
    }) {
      return withAuth(() => adapter.commitMedia(input));
    },
    updateSettings(input: ContentChangeRequest & { expectedSha: string }) {
      return withAuth(() => adapter.updateFile(input));
    },
  };
}
