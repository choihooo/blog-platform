import { afterEach, expect, it, vi } from "vitest";
import { corpus, embed, indexFor, profileFor, searchPublished } from "./retrieval";
import { fixture, row, vectorResponse } from "./test-utils/pipeline";

afterEach(() => vi.unstubAllGlobals());

it("keeps provider-specific indexes and rejects an uncalibrated Gemini profile", async () => {
  const f = await fixture();
  expect(indexFor(f.env)).toBe(f.env.INDEX_GEMINI);
  expect(profileFor(f.env)).toMatchObject({ dimensions: 768, namespace: "public-gemini-v1" });
  expect(() => profileFor({ ...f.env, GEMINI_MIN_SCORE: undefined })).toThrow(
    "gemini_min_score_required",
  );
  const index = {} as VectorizeIndex;
  const legacy = { ...f.env, RAG_EMBEDDING_PROVIDER: undefined, INDEX: index };
  expect(indexFor(legacy)).toBe(index);
  expect(profileFor(legacy)).toMatchObject({
    model: "@cf/baai/bge-m3",
    dimensions: 1024,
    namespace: "public-v1",
  });
  const run = vi.fn().mockResolvedValue({ data: [Array(1024).fill(0)] });
  const fetcher = vi.fn();
  vi.stubGlobal("fetch", fetcher);
  await expect(
    embed({ ...legacy, AI: { run } } as unknown as Env, ["query"], "RETRIEVAL_QUERY"),
  ).resolves.toHaveLength(1);
  expect(run).toHaveBeenCalledWith("@cf/baai/bge-m3", { text: ["query"] });
  expect(fetcher).not.toHaveBeenCalled();
});

it("reads fresh primary content after the vector lookup before exposing evidence", async () => {
  const f = await fixture();
  const selected = f.chunks[0]!.id;
  f.query.mockImplementation(async () => {
    f.all.mockResolvedValue({ success: true, results: [] });
    return { matches: [{ id: selected, score: 0.99 }] };
  });
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => vectorResponse()),
  );
  const result = await searchPublished("정보", f.env);
  expect(result).toEqual({ sources: [], evidence: [] });
  expect(f.env.DB.withSession).toHaveBeenCalledWith("first-primary");
  expect(f.query).toHaveBeenCalledWith(expect.any(Array), {
    topK: 100,
    namespace: "public-gemini-v1",
    returnMetadata: "none",
  });
});

it.each(["failure", "overflow"])("fails closed for a corpus %s", async (condition) => {
  const f = await fixture();
  f.all.mockResolvedValue(
    condition === "failure"
      ? { success: false, results: [] }
      : { success: true, results: Array(1001).fill(row) },
  );
  await expect(corpus(f.env)).rejects.toThrow("corpus_unavailable");
});
