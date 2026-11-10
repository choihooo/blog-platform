import { chunkDocuments, embeddingProfile, postDocument } from "@blog-platform/core/search";
import { vi, type Mock } from "vitest";
export const row = {
  id: "fixture",
  slug: "fixture",
  title: "자료",
  summary: "검증된 공개 본문",
  content: "",
};
export const req = (path: string, body: unknown, token = "search") =>
  new Request(`https://rag.test${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
export async function fixture(): Promise<{
  env: Env;
  query: Mock;
  upsert: Mock;
  all: Mock;
  chunks: Awaited<ReturnType<typeof chunkDocuments>>;
}> {
  const chunks = await chunkDocuments([postDocument(row)], embeddingProfile("gemini", 0.65));
  const all = vi.fn().mockResolvedValue({ success: true, results: [row] });
  const prepare = vi.fn().mockReturnValue({ all, bind: () => ({ all }) });
  const upsert = vi.fn().mockResolvedValue({});
  const query = vi.fn().mockResolvedValue({ matches: [{ id: chunks[0]!.id, score: 0.9 }] });
  const env = {
    DB: { withSession: vi.fn().mockReturnValue({ prepare }) },
    INDEX_GEMINI: { query, getByIds: vi.fn().mockResolvedValue([]), upsert },
    RAG_ADMIN_TOKEN: "admin",
    RAG_SEARCH_TOKEN: "search",
    RAG_EMBEDDING_PROVIDER: "gemini",
    GEMINI_MIN_SCORE: "0.65",
    GEMINI_API_KEY: "key",
    GEMINI_EMBED_DELAY_MS: "0",
    GEMINI_GENERATION_MODEL: "gemini-3.8-flash",
    SEARCH_LIMIT: { limit: vi.fn().mockResolvedValue({ success: true }) },
  } as unknown as Env;
  return { env, query, upsert, all, chunks };
}
export const vectorResponse = () =>
  Response.json({ embedding: { values: [1, ...Array(767).fill(0)] } });
