import { afterEach, describe, expect, it, vi } from "vitest";
import { requestRag } from "./rag-client";
afterEach(() => vi.unstubAllGlobals());
describe("RAG browser request", () => {
  it("posts the current question and evidence context and accepts a validated answer", async () => {
    const input = { query: "React", context: { query: "earlier", titles: ["Title"] } };
    let sent: RequestInit | undefined;
    vi.stubGlobal("fetch", async (url: string, init: RequestInit) => {
      expect(url).toBe("/api/rag");
      sent = init;
      return Response.json({ answer: "Answer", sources: [] });
    });
    expect(await requestRag(input, new AbortController().signal)).toEqual({
      answer: "Answer",
      sources: [],
    });
    expect(JSON.parse(sent!.body as string)).toEqual(input);
    expect(sent!.method).toBe("POST");
  });
  it.each([
    [429, "rate_limited"],
    [503, "unavailable"],
  ])("maps %s failures", async (status, message) => {
    vi.stubGlobal("fetch", async () => new Response(null, { status: status as number }));
    await expect(requestRag({ query: "q" }, new AbortController().signal)).rejects.toThrow(
      message as string,
    );
  });
  it("rejects citations without a generated answer", async () => {
    vi.stubGlobal("fetch", async () =>
      Response.json({ sources: [{ title: "T", url: "/blog/a", text: "E", score: 1 }] }),
    );
    await expect(requestRag({ query: "q" }, new AbortController().signal)).rejects.toThrow(
      "invalid_answer",
    );
  });
});
