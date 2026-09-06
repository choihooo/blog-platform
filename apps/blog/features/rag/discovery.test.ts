import { describe, expect, it } from "vitest";
import { projectCatalog, noEvidence } from "./discovery";
import { factualAnswer } from "./factual";
import { isSearchContext, resolveFollowUp } from "./follow-up";
import { chunkDocuments, currentMatches } from "./corpus";
import { isRagResult } from "./contracts";

describe("portfolio question regression set", () => {
  it.each([
    "대표 프로젝트",
    "대표프로젝트",
    "주요 프로젝트 알려줘",
    "프로젝트 목록",
    "프로젝트 추천",
    "전체 프로젝트",
    "개인 프로젝트 있어?",
    "사이드 프로젝트",
    "팀 프로젝트",
    "회사 프로젝트",
    "호조리카 프로젝트",
    "Hozorica 프로젝트",
    "프로젝트를 알려주세요.",
  ])("reads catalog: %s", (q) => {
    const result = projectCatalog(q);
    expect(isRagResult(result)).toBe(true);
    expect(result?.sources).toHaveLength(3);
  });
  it.each([
    "최호",
    "호조리카 소개해줘",
    "Hozorica 누구야",
    "기술 스택",
    "개발 경험",
    "수상",
    "활동",
    "아이겐 코리아 경력",
    "야근몬스터에서 어떤 일을 했나요?",
    "Nexacro 성과",
    "거부기린 성과",
    "Comma 담당 역할",
  ])("keeps factual evidence: %s", (q) => {
    const result = factualAnswer(q);
    expect(isRagResult(result)).toBe(true);
    expect(result?.sources.length).toBeGreaterThan(0);
  });
  it.each([
    "React 프로젝트 성능 개선",
    "Nexacro 프로젝트 왜 만들었어",
    "프로젝트 AI 관련 글",
    "삼성 프로젝트",
    "프로젝트 비밀번호",
  ])("preserves specific requests: %s", (q) => expect(projectCatalog(q)).toBeNull());
  it("filters side projects", () => {
    expect(projectCatalog("개인 프로젝트")?.sources.map((s) => s.title)).toEqual([
      "Kusting",
      "Comma",
      "거부기린",
    ]);
  });
  it("does not equate company work with team work", () => {
    expect(projectCatalog("팀 프로젝트")?.sources.map((s) => s.title)).not.toContain(
      "Nexacro–React 전환 자동화",
    );
  });
  it("resolves ordinal references and clarifies ambiguity", () => {
    const context = { query: "대표 프로젝트", titles: ["Nexacro", "Comma"] };
    expect(resolveFollowUp("첫 번째 더 자세히", context).query).toBe("Nexacro 더 자세히");
    expect(resolveFollowUp("2번 성과", context).query).toBe("Comma 성과");
    expect(resolveFollowUp("3번", context).clarification).toBeTruthy();
    expect(resolveFollowUp("그거 자세히", context).clarification).toContain("Comma");
    expect(resolveFollowUp("관련 글 있어?", { query: "Nexacro", titles: ["Nexacro"] }).query).toBe(
      "Nexacro 관련 글 있어?",
    );
    expect(resolveFollowUp("React 글 있어?", context).query).toBe("React 글 있어?");
    expect(resolveFollowUp("그거").clarification).toBeTruthy();
    expect(isSearchContext({ query: "x", titles: ["x".repeat(201)] })).toBe(false);
  });
  it("retrieves current metadata without stale vectors or incidental body mentions", async () => {
    const chunks = await chunkDocuments([
      { key: "a", title: "React 개발 도구", url: "/blog/react", text: "디버깅" },
      { key: "b", title: "UI 검증", tags: ["AI"], url: "/blog/ai", text: "검증 정보" },
      { key: "c", title: "chair", url: "/blog/chair", text: "React 예시" },
    ]);
    expect(currentMatches(chunks, [{ id: "stale", score: 1 }], "React 글 추천")[0]?.url).toBe(
      "/blog/react",
    );
    expect(currentMatches(chunks, [], "AI 글 있어?").map((s) => s.url)).toEqual(["/blog/ai"]);
    expect(currentMatches([], [{ id: chunks[0]!.id, score: 1 }], "React 글")).toEqual([]);
    expect(currentMatches(chunks, [], "양자역학 글")).toEqual([]);
  });
  it("distinguishes uncertainty instead of claiming no articles exist", () => {
    expect(noEvidence("AI 글").answer).toContain("단정할 수는 없어요");
    expect(noEvidence("모르겠어").answer).toContain("어떤 쪽");
  });
});
