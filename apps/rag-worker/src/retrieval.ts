import {
  chunkDocuments,
  currentMatches,
  EMBEDDING_MODEL,
  postDocument,
  staticDocuments,
  type PublicPostRow,
} from "../../blog/features/rag/corpus";
import { embeddingProfile } from "../../blog/features/rag/embedding-profile";
import type { RagResult } from "../../blog/features/rag/contracts";
import type { RagChunk } from "../../blog/features/rag/corpus-types";
import { embedGemini } from "./gemini";

export function profileFor(env: Env) {
  const provider = env.RAG_EMBEDDING_PROVIDER ?? "workers-ai";
  if (provider !== "workers-ai" && provider !== "gemini")
    throw new Error("invalid_embedding_provider");
  return embeddingProfile(
    provider,
    env.GEMINI_MIN_SCORE?.trim() ? Number(env.GEMINI_MIN_SCORE) : undefined,
  );
}
export function indexFor(env: Env) {
  return profileFor(env).provider === "gemini" ? env.INDEX_GEMINI : env.INDEX;
}
export async function corpus(env: Env, slug?: string) {
  // Fresh primary session: no cached or replicated publication status.
  const db = env.DB.withSession("first-primary");
  const sql = `SELECT p.id, p.slug, p.title, p.summary, p.content,
    c.name AS category_name, c.slug AS category_slug,
    parent.name AS parent_category_name, parent.slug AS parent_category_slug,
    (SELECT json_group_array(json_object('name', t.name, 'slug', t.slug))
      FROM post_tags pt JOIN tags t ON t.id = pt.tag_id
      WHERE pt.post_id = p.id) AS tags_json
    FROM posts p
    LEFT JOIN categories c ON c.id = p.category_id
    LEFT JOIN categories parent ON parent.id = c.parent_id
    WHERE p.is_published = 1`;
  const result = slug
    ? await db.prepare(`${sql} AND p.slug = ?`).bind(slug).all<PublicPostRow>()
    : await db.prepare(`${sql} ORDER BY p.id LIMIT 1001`).all<PublicPostRow>();
  if (!result.success || result.results.length > 1000) throw new Error("corpus_unavailable");
  return chunkDocuments(
    [...(slug ? [] : staticDocuments()), ...result.results.map(postDocument)],
    profileFor(env),
  );
}

export async function embed(
  env: Env,
  text: string[],
  taskType: "RETRIEVAL_DOCUMENT" | "RETRIEVAL_QUERY",
  signal?: AbortSignal,
) {
  if (profileFor(env).provider === "gemini") {
    const delayMs = taskType === "RETRIEVAL_DOCUMENT" ? Number(env.GEMINI_EMBED_DELAY_MS) : 0;
    if (!Number.isFinite(delayMs) || delayMs < 0 || delayMs > 60000)
      throw new Error("gemini_delay_required");
    return embedGemini({
      texts: text,
      taskType,
      apiKey: env.GEMINI_API_KEY ?? "",
      signal,
      delayMs,
    });
  }
  signal?.throwIfAborted();
  const result = await env.AI.run(EMBEDDING_MODEL, { text });
  if (
    !("data" in result) ||
    !Array.isArray(result.data) ||
    result.data.length !== text.length ||
    result.data.some((v) => v.length !== 1024 || v.some((n) => !Number.isFinite(n)))
  )
    throw new Error("embedding_shape");
  return result.data;
}

export function evidenceIds(chunks: RagChunk[], sources: RagResult["sources"]): string[] {
  const urls = new Set(sources.map((source) => source.url));
  return chunks
    .filter((chunk) => urls.has(chunk.url))
    .map((chunk) => chunk.id)
    .sort();
}

export async function searchPublished(
  query: string,
  env: Env,
  signal?: AbortSignal,
): Promise<RagResult & { evidence: string[] }> {
  const profile = profileFor(env);
  const vectors = await embed(env, [query], "RETRIEVAL_QUERY", signal);
  const matches = await indexFor(env).query(vectors[0]!, {
    topK: 100,
    namespace: profile.namespace,
    returnMetadata: "none",
  });
  const chunks = await corpus(env);
  const sources = currentMatches(chunks, matches.matches, query, profile.minScore);
  return { sources, evidence: evidenceIds(chunks, sources) };
}
