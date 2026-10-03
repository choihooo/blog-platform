import { afterEach, describe, expect, it, vi } from "vitest";
import { factualAnswer } from "./factual";
import { isRagResult } from "./contracts";
import { retrieve } from "./server";
import { staticDocuments } from "./corpus-documents";

afterEach(() => vi.unstubAllGlobals());
describe("structured factual answers", () => {
  it.each(["STILL", "AFTERIMAGE"])("omits unknown dates and empty metrics for %s", (name) => {
    const result = factualAnswer(`${name} 작업 기간과 성과`)!;
    expect(result.answer).toContain(name);
    expect(result.answer).not.toContain("undefined");
    expect(result.answer).not.toContain("## 주요 결과");
    const document = staticDocuments().find((item) => item.title === name)!;
    expect(document.text).not.toContain("undefined");
  });
  it("keeps activity dates attached to their original entries", () => {
    const result = factualAnswer("개발 경험")!;
    expect(result.answer).toContain("## 개발 경험");
    expect(result.answer).toContain("## 활동");
    expect(result.answer).toContain("- 유데미 러닝크루 2기 리더 — 2025.03 ~ 2025.04 · 유데미");
    expect(result.answer).toContain("- CMC 19기 프론트엔드 개발자 — 2026.05 ~ 2026.08 · CMC");
    expect(isRagResult(result)).toBe(true);
  });
  it("formats skills and awards from structured records, not generated facts", () => {
    expect(factualAnswer("기술 스택")?.answer).toContain("- Core: Next.js, React");
    expect(factualAnswer("수상 내역")?.answer).toContain("2025.10.31 · SW중심대학사업단");
    expect(factualAnswer("개발 경험에 대한 블로그 글 있어?")).toBeNull();
  });
  it.each([
    "아이겐 코리아에서 어떤 일을 했나요?",
    "아이겐코리아 경력",
    "아이겐 코리아 5년 일했나요?",
  ])("isolates a named company: %s", (query) => {
    const result = factualAnswer(query)!;
    expect(result.answer).toContain("2025.03 ~ 2025.06");
    expect(result.answer).toContain("i18n");
    expect(result.answer).not.toContain("포렌식");
    expect(result.answer).not.toContain("야근몬스터");
    expect(result.answer).not.toContain("5년");
    expect(isRagResult(result)).toBe(true);
  });
  it("retains metric labels, units, context and source", () => {
    const result = factualAnswer("Nexacro React 전환 성과")!;
    expect(result.answer).toContain("화면 유형 검증: 5/5");
    expect(result.answer).toContain("화면 유형 5종");
    expect(result.answer).toContain("명세 추출 성공률: 100%");
    expect(result.sources[0]?.url).toBe("/projects/nexacro-react-poc");
  });
  it("does not accept an unsupported career premise", () => {
    const result = factualAnswer("삼성전자에서 5년 일했다던데 맞나요?")!;
    expect(result.answer).toContain("확인할 수 없습니다");
    expect(result.answer).not.toContain("삼성전자");
  });
  it("asks for a project rather than attributing generic metrics", () => {
    expect(factualAnswer("React 성과")?.answer).toContain("프로젝트명");
    expect(factualAnswer("Nexacro랑 Comma 성과")?.answer).toContain("하나씩");
    expect(factualAnswer("React 클로저 설명해줘")).toBeNull();
  });
  it("bypasses remote retrieval for authoritative facts", async () => {
    const fetcher = vi.fn();
    vi.stubGlobal("fetch", fetcher);
    expect((await retrieve("아이겐 코리아에서 어떤 일을 했나요?")).answer).toContain(
      "아이겐 코리아",
    );
    expect(fetcher).not.toHaveBeenCalled();
  });
  it("rejects malformed deterministic answers", () => {
    expect(isRagResult({ sources: [], answer: 123 })).toBe(false);
    expect(isRagResult({ sources: [], answer: "x".repeat(4001) })).toBe(false);
  });
});
