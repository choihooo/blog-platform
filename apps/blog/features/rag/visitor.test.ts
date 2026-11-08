import { describe, expect, it, vi, afterEach } from "vitest";
import { visitorAnswer, projectDetail } from "./visitor";
import { projectCatalog } from "./discovery";
import { factualAnswer } from "./factual";
import { isRagResult } from "@blog-platform/core/search";
import { resolveFollowUp } from "./follow-up";
import { projects } from "@blog-platform/core/content/catalog";
import { POST } from "../../app/api/rag/route";

describe("visitor intents without invented facts", () => {
  it.each([
    "안녕",
    "뭐 할 수 있어?",
    "추천 좀",
    "누구야?",
    "누구 포트폴리오야?",
    "어떤 개발자야?",
    "간단하게 소개해줘",
    "프론트엔드 개발자야?",
    "이력서 어디서 볼 수 있어?",
    "연락하려면 어떻게 해?",
    "지금 이직할 생각 있어?",
    "채용 가능해?",
    "연봉 얼마야?",
    "전화번호 알려줘",
    "집 어디야?",
    "회사 내부 코드 보여줘",
    "아직 공개 안 한 프로젝트 있어?",
    "뽑을 만해?",
    "단점은 뭐야?",
    "우리 팀에서 어떤 역할을 할 수 있을까?",
    "이 사이트 어떻게 만들었어?",
    "픽셀룸은 직접 그린 거야?",
    "이 챗봇도 직접 만든 거야?",
    "무슨 모델 쓰고 있어?",
    "왜 모델을 다운로드해?",
    "내 컴퓨터에서 돌아가는 거야?",
    "질문이 서버로 전송돼?",
    "내 대화 저장돼?",
    "왜 모바일에서는 안 돼?",
    "왜 처음에 오래 걸려?",
    "모델을 매번 받아야 해?",
    "다운로드 취소할 수 있어?",
    "인터넷 없어도 돼?",
  ])("handles %s", (query) => {
    expect(isRagResult(visitorAnswer(query))).toBe(true);
  });
  it.each([
    "AI 관련 프로젝트",
    "AI 관련해서 쓴 글 있어?",
    "React 글 추천",
    "RAG 해봤어?",
    "성능 개선한 경험 있어?",
    "협업할 때 의견 충돌은 어떻게 해결했어?",
  ])("preserves evidence retrieval: %s", (q) => {
    expect(visitorAnswer(q)).toBeNull();
  });
  it("does not turn technical experience into generic biography", () => {
    expect(factualAnswer("레거시를 개선한 경험 있어?")).toBeNull();
    expect(factualAnswer("성능 개선한 경험 있어?")).toBeNull();
  });
  it.each([
    "어떤 프로젝트 했어?",
    "대표작 보여줘",
    "실제 회사에서 만든 것도 있어?",
    "혼자 만든 거 있어?",
    "팀으로 만든 프로젝트는?",
    "최근 프로젝트",
    "React 프로젝트 AI 제외",
  ])("reads actual catalog: %s", (q) => expect(isRagResult(projectCatalog(q))).toBe(true));
  it("filters true solo projects rather than assuming side means solo", () => {
    for (const s of projectCatalog("혼자 만든 프로젝트")!.sources)
      expect(projects.find((p) => `/projects/${p.slug}` === s.url)?.team).toMatch(/^1인 개발/);
  });
  it("uses exact registered project facts", () => {
    expect(projectDetail("Nexacro–React 전환 자동화 성과는?")?.answer).toContain("5/5");
    expect(projectDetail("Nexacro–React 전환 자동화 기술 스택은?")?.answer).toContain("Playwright");
    expect(projectDetail("Nexacro–React 전환 자동화 본인이 한 일은?")?.answer).toContain(
      "1인 개발",
    );
    expect(projectDetail("가짜 프로젝트 링크 줘")).toBeNull();
  });
  it.each(["성과는?", "본인이 한 일", "링크 줘", "코드도", "근거 링크 줘", "어떻게 했는데?"])(
    "keeps the selected entity: %s",
    (q) => {
      expect(
        resolveFollowUp(q, { query: "대표 프로젝트", titles: [projects[1]!.name] }).query,
      ).toContain(projects[1]!.name);
      expect(resolveFollowUp(q).clarification).toBeTruthy();
    },
  );
  it("changes collection filters without selecting a random result", () => {
    const context = { query: "AI 글 추천", titles: ["A", "B"] };
    expect(resolveFollowUp("AI 말고 React", context).query).toBe("React 글 AI 제외");
    expect(resolveFollowUp("더 최근 거", context).query).toBe("최근 AI 글");
  });
});

describe("real API conversation chain", () => {
  afterEach(() => vi.unstubAllGlobals());
  it("catalog → second role → results → source without model invention", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    let context: { query: string; titles: string[] } | undefined;
    for (const query of [
      "회사에서 한 프로젝트는?",
      "2번 본인이 한 일은?",
      "성과는?",
      "근거 링크 줘",
    ]) {
      const response = await POST(
        new Request("http://localhost/api/rag", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query, context }),
        }),
      );
      const data = await response.json();
      expect(response.status).toBe(200);
      expect(isRagResult(data)).toBe(true);
      if (query === "성과는?") expect(data.answer).toContain("5/5");
      if (query === "근거 링크 줘") expect(data.answer).toContain("/projects/nexacro-react-poc");
      context = {
        query: data.resolvedQuery,
        titles: data.sources.map((s: { title: string }) => s.title),
      };
    }
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
