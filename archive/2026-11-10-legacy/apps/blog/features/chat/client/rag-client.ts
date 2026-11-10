import { isRagResult, type RagResult } from "@blog-platform/core/search";
import type { SearchContext } from "../../rag/contracts";

export async function requestRag(
  input: { query: string; context?: SearchContext },
  signal: AbortSignal,
): Promise<RagResult> {
  const response = await fetch("/api/rag", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    signal: AbortSignal.any([signal, AbortSignal.timeout(40000)]),
  });
  if (!response.ok) throw new Error(response.status === 429 ? "rate_limited" : "unavailable");
  const result: unknown = await response.json();
  if (!isRagResult(result) || !result.answer) throw new Error("invalid_answer");
  return result;
}
