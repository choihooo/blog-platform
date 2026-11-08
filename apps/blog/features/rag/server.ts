import { isRagResult, type RagResult } from "@blog-platform/core/search";
import { factualAnswer } from "./factual";
import { searchQuery } from "@blog-platform/core/search";
import { projectCatalog, noEvidence } from "./discovery";
import { visitorAnswer, projectDetail } from "./visitor";
import { articleDiscovery } from "./article-discovery";

export async function retrieve(query: string, signal?: AbortSignal): Promise<RagResult> {
  const facts =
    visitorAnswer(query) ?? projectDetail(query) ?? projectCatalog(query) ?? factualAnswer(query);
  if (facts) return facts;
  if (/글|블로그|포스트/.test(query) && /최근|요즘|AI 제외/.test(query)) {
    const { getPublishedPostsStrict } = await import("../blog/server/content-source");
    return articleDiscovery(
      query,
      await getPublishedPostsStrict({ limit: 100, analyzeBody: false }),
    );
  }
  const base = process.env.RAG_API_URL;
  const token = process.env.RAG_SEARCH_TOKEN;
  if (!base || !token) throw new Error("rag_not_configured");
  const provider = process.env.RAG_ANSWER_PROVIDER ?? "local";
  if (provider !== "local" && provider !== "gemini") throw new Error("invalid_answer_provider");
  const timeout = provider === "gemini" ? 35000 : 20000;
  const response = await fetch(new URL(provider === "gemini" ? "/answer" : "/search", base), {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ query: searchQuery(query) }),
    cache: "no-store",
    signal: signal
      ? AbortSignal.any([signal, AbortSignal.timeout(timeout)])
      : AbortSignal.timeout(timeout),
  });
  if (!response.ok)
    throw new Error(response.status === 429 ? "rate_limited" : "retrieval_unavailable");
  const result: unknown = await response.json();
  if (!isRagResult(result)) throw new Error("invalid_retrieval");
  if (provider === "gemini" && result.sources.length && !result.answer)
    throw new Error("generation_unavailable");
  return result.sources.length || result.answer ? result : noEvidence(query);
}

export async function syncPost(slug: string): Promise<void> {
  const base = process.env.RAG_API_URL;
  const token = process.env.RAG_ADMIN_TOKEN;
  if (!base || !token) throw new Error("rag_sync_not_configured");
  let offset: number | null = 0;
  let revision: string | undefined;
  for (let page = 0; offset !== null && page < 20; page++) {
    const response = await fetch(new URL("/sync", base), {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ slug, offset, revision }),
      cache: "no-store",
      signal: AbortSignal.timeout(30_000),
    });
    if (!response.ok) throw new Error("rag_sync_failed");
    const result = (await response.json()) as { nextOffset: number | null; revision: string };
    offset = result.nextOffset;
    revision = result.revision;
  }
  if (offset !== null) throw new Error("rag_sync_incomplete");
}
