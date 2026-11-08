import { afterEach, describe, expect, it, vi } from "vitest";
import { canonicalQuery, hasOwnerName } from "@blog-platform/core/search";
import { factualAnswer } from "./factual";
import { groundedQuestion, isRagResult } from "@blog-platform/core/search";
import { retrieve } from "./server";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("portfolio owner identity", () => {
  it.each([
    "최호",
    "최호는 누구야?",
    "호조리카 소개해줘",
    "Hozorica에 대해 알려줘",
    "HOZORICA",
    "최호랑 호조리카는 같은 사람이야?",
  ])("uses the public resume for %s", (query) => {
    const result = factualAnswer(query);
    expect(result?.answer).toContain("호조리카(Hozorica)는 최호");
    expect(result?.answer).toContain("Frontend Engineer");
    expect(result?.sources[0]?.url).toBe("/resume");
    expect(isRagResult(result)).toBe(true);
  });

  it.each(["호조리카가 쓴 React 글", "최호 프로젝트 소개해줘", "Hozorica 나이", "최호 전화번호"])(
    "does not replace specific requests with a biography: %s",
    (query) => {
      expect(factualAnswer(query)).toBeNull();
    },
  );

  it("preserves career handling and avoids partial names", () => {
    expect(factualAnswer("호조리카 경력")?.answer).toContain("아이겐 코리아");
    expect(hasOwnerName("최호준 소개해줘")).toBe(false);
    expect(hasOwnerName("Hozorical 소개해줘")).toBe(false);
    expect(canonicalQuery("HOZORICA가 쓴 React 글")).toBe("최호가 쓴 React 글");
    expect(groundedQuestion([], "호조리카 프로젝트")).toContain("방문자의 질문: 최호 프로젝트");
  });

  it("sends alias queries through retrieval with the same canonical name", async () => {
    vi.stubEnv("RAG_API_URL", "http://localhost:8787");
    vi.stubEnv("RAG_SEARCH_TOKEN", "test-token");
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({ sources: [] })));
    vi.stubGlobal("fetch", fetcher);
    await retrieve("호조리카가 쓴 React 글");
    expect(JSON.parse(fetcher.mock.calls[0]![1].body).query).toBe("React 글");
  });
});
