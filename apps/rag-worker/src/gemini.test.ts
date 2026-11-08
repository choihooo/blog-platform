import { afterEach, describe, expect, it, vi } from "vitest";
import { embedGemini, generateGeminiAnswer } from "./gemini";

afterEach(() => vi.unstubAllGlobals());
describe("Gemini embeddings", () => {
  it("uses retrieval task types and normalizes reduced dimensions", async () => {
    const calls: Record<string, unknown>[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (_url, init) => {
        calls.push(JSON.parse(init.body));
        expect(init.headers["x-goog-api-key"]).toBe("test-secret");
        return Response.json({ embedding: { values: [3, 4, ...Array(766).fill(0)] } });
      }),
    );
    const document = await embedGemini({
      texts: ["자료"],
      taskType: "RETRIEVAL_DOCUMENT",
      apiKey: "test-secret",
    });
    await embedGemini({ texts: ["질문"], taskType: "RETRIEVAL_QUERY", apiKey: "test-secret" });
    expect(document[0]!.slice(0, 2)).toEqual([0.6, 0.8]);
    expect(calls.map((c) => [c.model, c.taskType, c.outputDimensionality])).toEqual([
      ["models/gemini-embedding-001", "RETRIEVAL_DOCUMENT", 768],
      ["models/gemini-embedding-001", "RETRIEVAL_QUERY", 768],
    ]);
  });
  it.each(
    [[], Array(767).fill(1), Array(768).fill(0), [...Array(767).fill(1), null]].map((values) => ({
      values,
    })),
  )("rejects malformed or zero embeddings %#", async ({ values }) => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ embedding: { values } })));
    await expect(
      embedGemini({ texts: ["資料"], taskType: "RETRIEVAL_QUERY", apiKey: "key" }),
    ).rejects.toThrow("embedding_shape");
  });
  it.each([401, 429, 500])("reports HTTP %i without leaking provider details", async (status) => {
    const fetcher = vi.fn().mockResolvedValue(new Response("secret provider details", { status }));
    vi.stubGlobal("fetch", fetcher);
    await expect(
      embedGemini({ texts: ["a", "b"], taskType: "RETRIEVAL_DOCUMENT", apiKey: "key" }),
    ).rejects.toThrow(status === 429 ? "rate_limited" : "gemini_unavailable");
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
  it("does not send requests after cancellation", async () => {
    const fetcher = vi.fn();
    vi.stubGlobal("fetch", fetcher);
    const controller = new AbortController();
    controller.abort();
    await expect(
      embedGemini({
        texts: ["a"],
        taskType: "RETRIEVAL_QUERY",
        apiKey: "key",
        signal: controller.signal,
      }),
    ).rejects.toThrow();
    expect(fetcher).not.toHaveBeenCalled();
  });
});

describe("Gemini generation failures", () => {
  it("uses the named project's organization even when it is not the first source", async () => {
    const reply = (text: string) =>
      Response.json({ candidates: [{ finishReason: "STOP", content: { parts: [{ text }] } }] });
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(reply("아이겐 코리아에서 5종을 검증했습니다."))
        .mockResolvedValueOnce(reply("Nexacro 검증은 야근몬스터에서 수행했습니다.")),
    );
    expect(
      await generateGeminiAnswer({
        query: "Nexacro의 담당 회사는?",
        sources: [
          {
            title: "다국어 리소스 검증",
            url: "/projects/i18n-validation",
            text: "아이겐 코리아",
            score: 1,
          },
          { title: "Nexacro", url: "/projects/nexacro-react-poc", text: "5종 검증", score: 1 },
        ],
        model: "gemini-3.5-flash-lite",
        apiKey: "key",
      }),
    ).toBe("Nexacro 검증은 야근몬스터에서 수행했습니다.");
  });
  it("does not send a retry after cancellation of the first response", async () => {
    const controller = new AbortController();
    const fetcher = vi.fn().mockImplementation(async () => {
      controller.abort();
      return Response.json({
        candidates: [{ finishReason: "STOP", content: { parts: [{ text: "없다고 답하세요." }] } }],
      });
    });
    vi.stubGlobal("fetch", fetcher);
    await expect(
      generateGeminiAnswer({
        query: "글",
        sources: [source],
        model: "gemini-3.5-flash-lite",
        apiKey: "key",
        signal: controller.signal,
      }),
    ).rejects.toThrow();
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
  it("retries an instruction echo once and returns the grounded correction", async () => {
    const reply = (text: string) =>
      Response.json({ candidates: [{ finishReason: "STOP", content: { parts: [{ text }] } }] });
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(reply("없다고 답하세요."))
      .mockResolvedValueOnce(reply("GGUF와 MLX의 차이를 설명한 글입니다."));
    vi.stubGlobal("fetch", fetcher);
    expect(
      await generateGeminiAnswer({
        query: "GGUF MLX 차이 글",
        sources: [source],
        model: "gemini-3.5-flash-lite",
        apiKey: "key",
      }),
    ).toBe("GGUF와 MLX의 차이를 설명한 글입니다.");
  });
  it("retries omission of the authoritative project organization", async () => {
    const reply = (text: string) =>
      Response.json({ candidates: [{ finishReason: "STOP", content: { parts: [{ text }] } }] });
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(reply("5종을 검증했습니다. 회사는 나와 있지 않습니다."))
      .mockResolvedValueOnce(reply("야근몬스터에서 5종을 검증했습니다."));
    vi.stubGlobal("fetch", fetcher);
    expect(
      await generateGeminiAnswer({
        query: "검증 결과와 담당 회사는?",
        sources: [
          { title: "Nexacro", url: "/projects/nexacro-react-poc", text: "화면 5종 검증", score: 1 },
        ],
        model: "gemini-3.5-flash-lite",
        apiKey: "key",
      }),
    ).toBe("야근몬스터에서 5종을 검증했습니다.");
  });
  it("fails closed after two instruction echoes instead of returning a fabricated fallback", async () => {
    const fetcher = vi.fn().mockImplementation(async () =>
      Response.json({
        candidates: [{ finishReason: "STOP", content: { parts: [{ text: "없다고 답하세요." }] } }],
      }),
    );
    vi.stubGlobal("fetch", fetcher);
    await expect(
      generateGeminiAnswer({
        query: "글",
        sources: [source],
        model: "gemini-3.5-flash-lite",
        apiKey: "key",
      }),
    ).rejects.toThrow("gemini_ungrounded_answer");
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
  it("keeps only authoritative source links in generated prose", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        Response.json({
          candidates: [
            {
              finishReason: "STOP",
              content: {
                parts: [
                  {
                    text: "[원문](/blog/fixture) [가짜](https://example.com/fabricated) [관리](/admin)",
                  },
                ],
              },
            },
          ],
        }),
      ),
    );
    expect(
      await generateGeminiAnswer({
        query: "질문",
        sources: [source],
        model: "gemini-3.8-flash",
        apiKey: "key",
      }),
    ).toBe("[원문](/blog/fixture) 가짜 관리");
  });
  const source = { title: "原文", url: "/blog/fixture", text: "根拠", score: 0.9 };
  it.each([
    { candidates: [] },
    { candidates: [{ finishReason: "MAX_TOKENS", content: { parts: [{ text: "partial" }] } }] },
    { candidates: [{ finishReason: "STOP", content: { parts: [{ text: "" }] } }] },
    { candidates: [{ finishReason: "STOP", content: { parts: [{ text: "x".repeat(4001) }] } }] },
    { candidates: [{ finishReason: "SAFETY" }] },
  ])("rejects incomplete or blocked responses %#", async (body) => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json(body)));
    await expect(
      generateGeminiAnswer({
        query: "질문",
        sources: [source],
        model: "gemini-3.8-flash",
        apiKey: "key",
      }),
    ).rejects.toThrow("gemini_invalid_answer");
  });
});
