import { afterEach, describe, expect, it, vi } from "vitest";
import { POST } from "../../app/api/rag/route";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});
const source = { title: "자료", url: "/blog/fixture", text: "공개 본문", score: 0.9 };
const question = (query = "알려지지않은기술") =>
  new Request("https://blog.test/api/rag", {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: "https://blog.test" },
    body: JSON.stringify({ query }),
  });
function setup() {
  vi.stubEnv("RAG_ANSWER_PROVIDER", "");
  vi.stubEnv("RAG_API_URL", "https://worker.test");
  vi.stubEnv("RAG_SEARCH_TOKEN", "key");
}
describe("Gemini answer routing", () => {
  it("uses the answer endpoint and returns validated server prose", async () => {
    setup();
    const fetcher = vi
      .fn()
      .mockResolvedValue(Response.json({ sources: [source], answer: "공개 자료를 설명합니다." }));
    vi.stubGlobal("fetch", fetcher);
    const response = await POST(question());
    expect(response.status).toBe(200);
    expect(String(fetcher.mock.calls[0]![0])).toBe("https://worker.test/answer");
    expect(await response.json()).toMatchObject({
      answer: "공개 자료를 설명합니다.",
      sources: [source],
    });
  });
  it("rejects missing answers instead of silently falling back to the browser", async () => {
    setup();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ sources: [source] })));
    expect((await POST(question())).status).toBe(503);
  });
  it("keeps authoritative profile answers without provider calls", async () => {
    setup();
    const fetcher = vi.fn();
    vi.stubGlobal("fetch", fetcher);
    expect((await POST(question("아이겐 코리아 경력"))).status).toBe(200);
    expect(fetcher).not.toHaveBeenCalled();
  });
  it.each([429, 503])("preserves upstream %i", async (status) => {
    setup();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("", { status })));
    const response = await POST(question());
    expect(response.status).toBe(status);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });
});
