import type { RagResult } from "@blog-platform/core/search";
import { generateGeminiAnswer } from "../gemini";
import { corpus, evidenceIds, searchPublished } from "../retrieval";
export async function answerPublished(
  query: string,
  env: Env,
  signal: AbortSignal,
  onStage?: (stage: string) => void,
): Promise<RagResult> {
  onStage?.("search");
  const { evidence, ...result } = await searchPublished(query, env, signal);
  if (result.sources.length) {
    onStage?.("generation");
    result.answer = await generateGeminiAnswer({
      query,
      sources: result.sources,
      apiKey: env.GEMINI_API_KEY ?? "",
      model: env.GEMINI_GENERATION_MODEL ?? "",
      signal: signal,
    });
    onStage?.("evidence_revalidation");
    signal.throwIfAborted();
    const currentEvidence = evidenceIds(await corpus(env), result.sources);
    if (evidence.join(",") !== currentEvidence.join(",")) throw new Error("evidence_changed");
  }
  return result;
}
