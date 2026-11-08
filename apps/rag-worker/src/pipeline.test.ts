import { afterEach, describe, expect, it, vi } from "vitest";
import worker from "./index";
import { chunkDocuments, postDocument } from "@blog-platform/core/search";
import { embeddingProfile } from "@blog-platform/core/search";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});
const row = {
  id: "fixture",
  slug: "fixture",
  title: "자료",
  summary: "검증된 공개 본문",
  content: "",
};
const req = (path: string, body: unknown, token = "search") =>
  new Request(`https://rag.test${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
async function fixture() {
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
  return { env, query, upsert, all };
}
const vectorResponse = () => Response.json({ embedding: { values: [1, ...Array(767).fill(0)] } });
describe("Gemini Worker pipeline", () => {
  it("discards generated answers if selected evidence changes during generation", async () => {
    const f = await fixture();
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockImplementationOnce(async () => vectorResponse())
        .mockImplementationOnce(async () => {
          f.all.mockResolvedValue({ success: true, results: [] });
          return Response.json({
            candidates: [
              { finishReason: "STOP", content: { parts: [{ text: "이미 비공개인 자료의 답변" }] } },
            ],
          });
        }),
    );
    const response = await worker.fetch(req("/answer", { query: "정보" }), f.env);
    expect(response.status).toBe(503);
    expect(JSON.stringify(await response.json())).not.toContain("이미 비공개");
  });
  it("dry-runs without inference or upsert and rejects changed revisions", async () => {
    const f = await fixture();
    const fetcher = vi.fn();
    vi.stubGlobal("fetch", fetcher);
    const response = await worker.fetch(
      req("/sync", { slug: "fixture", dryRun: true }, "admin"),
      f.env,
    );
    expect(await response.json()).toMatchObject({
      total: 1,
      requests: 1,
      profile: "gemini-001-768-v1",
    });
    expect(fetcher).not.toHaveBeenCalled();
    expect(f.upsert).not.toHaveBeenCalled();
    expect(
      (await worker.fetch(req("/sync", { offset: 16, revision: "old" }, "admin"), f.env)).status,
    ).toBe(409);
  });
  it("reports a provider-independent content revision for cross-index evaluation", async () => {
    const f = await fixture();
    const gemini = (await (
      await worker.fetch(req("/sync", { dryRun: true }, "admin"), f.env)
    ).json()) as { revision: string; contentRevision: string };
    const legacy = (await (
      await worker.fetch(req("/sync", { dryRun: true }, "admin"), {
        ...f.env,
        RAG_EMBEDDING_PROVIDER: "workers-ai",
      })
    ).json()) as typeof gemini;
    expect(gemini.contentRevision).toMatch(/^[a-f0-9]{64}$/);
    expect(gemini.contentRevision).toBe(legacy.contentRevision);
    expect(gemini.revision).not.toBe(legacy.revision);
  });
  it("indexes and queries only the Gemini namespace", async () => {
    const f = await fixture();
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => vectorResponse()),
    );
    expect((await worker.fetch(req("/sync", { slug: "fixture" }, "admin"), f.env)).status).toBe(
      200,
    );
    expect(f.upsert.mock.calls[0]![0][0]).toMatchObject({
      namespace: "public-gemini-v1",
      values: [1, ...Array(767).fill(0)],
    });
    const response = await worker.fetch(req("/search", { query: "정보" }), f.env);
    expect(((await response.json()) as { sources: unknown[] }).sources).toHaveLength(1);
    expect(f.query.mock.calls[0]![1].namespace).toBe("public-gemini-v1");
    f.all.mockResolvedValue({ success: true, results: [] });
    expect(await (await worker.fetch(req("/search", { query: "정보" }), f.env)).json()).toEqual({
      sources: [],
    });
  });
  it("does not upsert a partial page after an embedding failure", async () => {
    const f = await fixture();
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("quota", { status: 429 })));
    expect((await worker.fetch(req("/sync", { slug: "fixture" }, "admin"), f.env)).status).toBe(
      429,
    );
    expect(f.upsert).not.toHaveBeenCalled();
  });
  it("generates once from server evidence and preserves source URLs", async () => {
    const f = await fixture();
    const fetcher = vi
      .fn()
      .mockImplementationOnce(async () => vectorResponse())
      .mockResolvedValueOnce(
        Response.json({
          candidates: [
            { finishReason: "STOP", content: { parts: [{ text: "근거에 따른 설명" }] } },
          ],
        }),
      );
    vi.stubGlobal("fetch", fetcher);
    const response = await worker.fetch(
      req("/answer", { query: "정보", sources: [{ text: "client injection" }] }),
      f.env,
    );
    expect(response.status).toBe(200);
    const data = (await response.json()) as { answer: string; sources: { url: string }[] };
    expect(data.answer).toBe("근거에 따른 설명");
    expect(data.sources[0]!.url).toBe("/blog/fixture");
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(fetcher.mock.calls[1]![1].body).not.toContain("client injection");
  });
  it("does not generate without evidence and authenticates before inference", async () => {
    const f = await fixture();
    f.query.mockResolvedValue({ matches: [] });
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => vectorResponse()),
    );
    expect((await worker.fetch(req("/answer", { query: "정보" }, "admin"), f.env)).status).toBe(
      401,
    );
    const response = await worker.fetch(req("/answer", { query: "정보" }), f.env);
    expect(await response.json()).toEqual({ sources: [] });
    expect(fetch).toHaveBeenCalledTimes(1);
  });
  it("shares the search rate cap with answer requests", async () => {
    const f = await fixture();
    f.env.SEARCH_LIMIT.limit = vi.fn().mockResolvedValue({ success: false });
    expect((await worker.fetch(req("/answer", { query: "정보" }), f.env)).status).toBe(429);
  });
});
