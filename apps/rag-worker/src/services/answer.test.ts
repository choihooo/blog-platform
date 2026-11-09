import { afterEach, expect, it, vi } from "vitest";
import { fixture, row, vectorResponse } from "../test-utils/pipeline";
import { answerPublished } from "./answer";
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});
it.each(["deleted", "unpublished", "changed"])(
  "rejects an answer if selected evidence becomes %s during generation",
  async (mutation) => {
    const f = await fixture();
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockImplementationOnce(async () => vectorResponse())
        .mockImplementationOnce(async () => {
          f.all.mockResolvedValue({
            success: true,
            results: mutation === "changed" ? [{ ...row, summary: "Changed public text" }] : [],
          });
          return Response.json({
            candidates: [
              { finishReason: "STOP", content: { parts: [{ text: "Generated answer" }] } },
            ],
          });
        }),
    );
    await expect(answerPublished("정보", f.env, new AbortController().signal)).rejects.toThrow(
      "evidence_changed",
    );
  },
);
it("returns no sources without generating an answer or exposing evidence IDs", async () => {
  const f = await fixture();
  f.query.mockResolvedValue({ matches: [] });
  const fetcher = vi.fn(async () => vectorResponse());
  vi.stubGlobal("fetch", fetcher);
  const result = await answerPublished("정보", f.env, new AbortController().signal);
  expect(result).toEqual({ sources: [] });
  expect(fetcher).toHaveBeenCalledTimes(1);
});
