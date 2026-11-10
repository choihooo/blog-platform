export type EmbeddingProfile = {
  id: string;
  provider: "workers-ai" | "gemini";
  model: string;
  dimensions: number;
  namespace: string;
  inputVersion: string;
  minScore: number;
};

export function embeddingProfile(
  provider: "workers-ai" | "gemini",
  geminiMinScore?: number,
): EmbeddingProfile {
  if (provider === "workers-ai")
    return {
      id: "bge-m3-v1",
      provider,
      model: "@cf/baai/bge-m3",
      dimensions: 1024,
      namespace: "public-v1",
      inputVersion: "v1",
      minScore: 0.48,
    };
  if (
    geminiMinScore === undefined ||
    !Number.isFinite(geminiMinScore) ||
    geminiMinScore < -1 ||
    geminiMinScore > 1
  )
    throw new Error("gemini_min_score_required");
  return {
    id: "gemini-001-768-v1",
    provider,
    model: "gemini-embedding-001",
    dimensions: 768,
    namespace: "public-gemini-v1",
    inputVersion: "taxonomy-v1-document-l2-v1",
    minScore: geminiMinScore,
  };
}
