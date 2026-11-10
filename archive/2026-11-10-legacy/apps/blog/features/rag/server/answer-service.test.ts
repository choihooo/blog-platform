import { afterEach, expect, it, vi } from "vitest";
import { answerQuestion } from "./answer-service";
import { POST } from "../../../app/api/rag/route";
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});
it("clarifies an ambiguous follow-up without querying the provider", async () => {
  const fetcher = vi.fn();
  vi.stubGlobal("fetch", fetcher);
  const result = await answerQuestion("그거");
  expect(result.kind).toBe("clarification");
  expect(result.sources).toEqual([]);
  expect(result.resolvedQuery).toBe("그거");
  expect(fetcher).not.toHaveBeenCalled();
});
it("resolves a selected title and propagates cancellation to Gemini retrieval", async () => {
  vi.stubEnv("RAG_API_URL", "https://worker.test");
  vi.stubEnv("RAG_SEARCH_TOKEN", "fixture");
  let signal: AbortSignal;
  vi.stubGlobal("fetch", async (url: string, init: RequestInit) => {
    expect(String(url)).toBe("https://worker.test/answer");
    signal = init.signal as AbortSignal;
    return Response.json({ answer: "Evidence answer", sources: [] });
  });
  const controller = new AbortController();
  const result = await answerQuestion(
    "2번",
    { query: "이전", titles: ["A", "B"] },
    controller.signal,
  );
  expect(result.resolvedQuery).toBe("B 자세히 설명");
  controller.abort();
  expect(signal!.aborted).toBe(true);
});
it.each([
  "{",
  JSON.stringify({ query: "" }),
  JSON.stringify({ query: "q", context: { history: [] } }),
])("keeps invalid HTTP requests at 400: %s", async (body) => {
  const response = await POST(
    new Request("http://blog.test/api/rag", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    }),
  );
  expect(response.status).toBe(400);
});
