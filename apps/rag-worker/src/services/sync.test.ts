import { afterEach, expect, it, vi } from "vitest";
import { fixture, row, vectorResponse } from "../test-utils/pipeline";
import { syncPublished } from "./sync";

afterEach(() => vi.unstubAllGlobals());

it("dry-runs without inference or writes and rejects a changed resume revision", async () => {
  const f = await fixture();
  const fetcher = vi.fn();
  vi.stubGlobal("fetch", fetcher);
  const result = await syncPublished(
    { offset: 0, slug: "fixture", dryRun: true },
    f.env,
    new AbortController().signal,
  );
  expect(result).toMatchObject({
    status: 200,
    body: { total: 1, requests: 1, nextOffset: null, profile: "gemini-001-768-v1" },
  });
  expect(fetcher).not.toHaveBeenCalled();
  expect(f.upsert).not.toHaveBeenCalled();
  expect(
    await syncPublished({ offset: 16, revision: "old" }, f.env, new AbortController().signal),
  ).toEqual({ status: 409, body: { error: "corpus_changed_restart_sync" } });
});

it("bounds a page to 16 and embeds only vectors absent from that page", async () => {
  const f = await fixture();
  f.all.mockResolvedValue({
    success: true,
    results: Array.from({ length: 17 }, (_, index) => ({
      ...row,
      id: `post-${index}`,
      slug: `post-${index}`,
    })),
  });
  f.env.INDEX_GEMINI.getByIds = vi.fn(async (ids: string[]) => [{ id: ids[0]!, values: [1] }]);
  const fetcher = vi.fn(async () => vectorResponse());
  vi.stubGlobal("fetch", fetcher);
  const result = await syncPublished({ offset: 0 }, f.env, new AbortController().signal);
  expect(result).toMatchObject({ status: 200, body: { indexed: 15, nextOffset: 16 } });
  expect(fetcher).toHaveBeenCalledTimes(15);
  expect(f.upsert.mock.calls[0]?.[0]).toHaveLength(15);
  expect(f.upsert.mock.calls[0]?.[0][0]).toMatchObject({ namespace: "public-gemini-v1" });
});

it("does not upsert any part of a page if one embedding fails", async () => {
  const f = await fixture();
  f.all.mockResolvedValue({
    success: true,
    results: [{ ...row }, { ...row, id: "second", slug: "second" }],
  });
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockImplementationOnce(async () => vectorResponse())
      .mockResolvedValueOnce(new Response("quota", { status: 429 })),
  );
  await expect(syncPublished({ offset: 0 }, f.env, new AbortController().signal)).rejects.toThrow(
    "rate_limited",
  );
  expect(f.upsert).not.toHaveBeenCalled();
});
