import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { POST } from "../../app/api/rag/route";
import { allVisitorQuestions } from "./visitor-questions";
import { isRagResult } from "@blog-platform/core/search";
import { projects } from "@blog-platform/core/content/catalog";
import { isSearchContext, resolveFollowUp } from "./follow-up";
import { conversationAnswer } from "./conversation";

vi.mock("../blog/server/content-source", () => ({
  getPublishedPostsStrict: vi.fn(async () => []),
}));
const context = { query: "대표 프로젝트", titles: projects.slice(0, 3).map((p) => p.name) };
const request = (query: string, ctx?: unknown) =>
  new Request("http://localhost/api/rag", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, context: ctx }),
  });

describe("all proposed visitor questions: API routing contract, not model semantics", () => {
  beforeEach(() => {
    vi.stubEnv("RAG_API_URL", "https://search.test");
    vi.stubEnv("RAG_SEARCH_TOKEN", "test-token");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        Response.json({
          answer: "공개 테스트 글을 바탕으로 한 서버 답변입니다.",
          sources: [
            {
              title: "공개 테스트 글",
              url: "/blog/test",
              text: "검색 경로 계약을 위한 테스트 자료",
              score: 0.8,
            },
          ],
        }),
      ),
    );
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });
  it.each(allVisitorQuestions)("$group: $query", async ({ group, query }) => {
    const response = await POST(request(query, group === "followUp" ? context : undefined));
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(isRagResult(data)).toBe(true);
    expect(Boolean(data.answer) || data.sources.length > 0).toBe(true);
  });
  it("does not mask an upstream failure as missing evidence", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(null, { status: 503 })),
    );
    expect((await POST(request("React 최적화 원리"))).status).toBe(503);
  });
});

describe("grounded conversation behavior", () => {
  it("compares actual records, not fabricated history descriptions", async () => {
    const result = await conversationAnswer("표로 비교해줘", context);
    expect(result?.answer).toContain("| 프로젝트 | 역할 | 기술 | 기록된 성과 |");
    expect(result?.answer).toContain("5/5");
    expect(result?.sources).toHaveLength(3);
  });
  it("restores an earlier list after selecting another project", () => {
    const remembered = { query: "Nexacro 성과", titles: [projects[1]!.name], history: [context] };
    expect(resolveFollowUp("아까 말한 첫 번째 다시 보여줘", remembered).query).toContain(
      projects[0]!.name,
    );
  });
  it("serves a restored project from its record without remote search", async () => {
    const response = await POST(
      request("아까 말한 첫 번째 다시 보여줘", {
        query: "Nexacro 성과",
        titles: [projects[1]!.name],
        history: [context],
      }),
    );
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.answer).toContain(projects[0]!.description);
  });
  it("limits counts and does not repeat previously displayed projects", async () => {
    expect((await conversationAnswer("두 개만", context))?.sources).toHaveLength(2);
    const more = await conversationAnswer("다른 것도 있어?", context);
    expect(more?.sources).toHaveLength(3);
    expect(more?.sources.every((s) => !context.titles.includes(s.title))).toBe(true);
  });
  it("bounds history and rejects nested or oversized client state", () => {
    expect(isSearchContext({ ...context, history: Array(6).fill(context) })).toBe(false);
    expect(isSearchContext({ ...context, history: [{ ...context, history: [] }] })).toBe(false);
    expect(isSearchContext({ ...context, history: [context] })).toBe(true);
  });
});
