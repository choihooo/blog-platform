import type { RagResult } from "@blog-platform/core/search";
import { retrieve } from "../server";
import { conversationAnswer } from "../conversation";
import { resolveFollowUp } from "../follow-up";
import type { SearchContext } from "../contracts";
export async function answerQuestion(
  query: string,
  context?: SearchContext,
  signal?: AbortSignal,
): Promise<RagResult & { resolvedQuery: string }> {
  const special = await conversationAnswer(query, context, signal);
  const resolved = special ? { query: context?.query ?? query } : resolveFollowUp(query, context);
  const result =
    special ??
    (resolved.clarification
      ? { answer: resolved.clarification, sources: [], kind: "clarification" }
      : await retrieve(resolved.query, signal));
  return { ...result, resolvedQuery: resolved.query };
}
