import { describe, expect, it } from "vitest";
import {
  evaluateCase,
  summarizeEvaluation,
  type EvaluationCase,
} from "../../scripts/rag-evaluation.mjs";
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { projectCatalog } from "./discovery";
import fixtures from "../../../../docs/fixtures/rag-gemini-evaluation.json";

const listCase = {
  id: "list",
  group: "project-list",
  responseType: "project-list" as const,
  minProjectCount: 2,
  allowedProjectUrls: ["/projects/one", "/projects/two", "/projects/three"],
};
const listSources = [
  { title: "하나", url: "/projects/one", text: "설명 하나", score: 1 },
  { title: "둘", url: "/projects/two", text: "설명 둘", score: 1 },
];

describe("RAG quality evaluation", () => {
  it("evaluates project lists separately from single-document recall", () => {
    const list = evaluateCase(
      listCase,
      { sources: listSources, answer: "1. 하나 — 설명 하나\n2. 둘 — 설명 둘" },
      200,
    );
    expect(list.retrievalPass).toBe(true);
    expect(summarizeEvaluation([list, { group: "positive", retrievalPass: false }]).recallAt3).toBe(
      0,
    );
    expect(summarizeEvaluation([list])).toMatchObject({ projectLists: { total: 1, passed: 1 } });
  });
  it.each([
    { sources: [], answer: "목록 없음" },
    { sources: [listSources[0]], answer: "하나" },
    { sources: [listSources[0], listSources[0]], answer: "하나" },
    { sources: listSources, answer: "하나" },
    {
      sources: [listSources[0], { ...listSources[1], url: "/projects/invented" }],
      answer: "하나 둘",
    },
    { sources: [listSources[0], { ...listSources[1], text: "" }], answer: "하나 둘" },
    { sources: listSources },
  ])("rejects missing, duplicate, unlisted or unmentioned project items %#", (result) => {
    expect(evaluateCase(listCase, result, 200).retrievalPass).toBe(false);
  });
  it("does not accept an upstream error as a valid project list", () => {
    expect(
      evaluateCase(listCase, { sources: listSources, answer: "하나 둘" }, 503).retrievalPass,
    ).toBe(false);
  });
  it("accepts the real catalog without requiring ai-workflow", () => {
    const item = fixtures.find((c) => c.id === "p1")! as EvaluationCase;
    const response = projectCatalog("대표 프로젝트", {
      excludeTitles: new Set(["AI 수정 workflow 자동화"]),
    })!;
    expect(response.sources.every((s) => s.url !== "/projects/ai-workflow")).toBe(true);
    expect(evaluateCase(item, response, 200).retrievalPass).toBe(true);
    expect(summarizeEvaluation([evaluateCase(item, response, 200)]).recallAt3).toBeNull();
  });
  it("skips API-only project lists in direct Worker evaluations", () => {
    const dir = mkdtempSync(join(tmpdir(), "rag-list-eval-"));
    try {
      const cases = join(dir, "cases.json"),
        output = join(dir, "output.json");
      writeFileSync(cases, JSON.stringify([{ ...listCase, query: "대표 프로젝트" }]));
      execFileSync(
        process.execPath,
        [
          fileURLToPath(new URL("../../scripts/evaluate-rag.mjs", import.meta.url)),
          "--mode",
          "retrieval",
          "--endpoint",
          "http://127.0.0.1:1/search",
          "--cases",
          cases,
          "--output",
          output,
          "--corpus-revision",
          "test",
          "--requests-per-minute",
          "30",
        ],
        { env: { ...process.env, RAG_SEARCH_TOKEN: "test-only" }, stdio: "pipe" },
      );
      const report = JSON.parse(readFileSync(output, "utf8"));
      expect(report.complete).toBe(true);
      expect(report.results).toEqual([]);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
  it("fails generation evaluation when evidence is returned without an answer", () => {
    const result = evaluateCase(
      { id: "p", group: "positive", expectedUrls: ["/resume"] },
      { sources: [{ url: "/resume" }] },
      200,
      "generation",
    );
    expect(result.generationPass).toBe(false);
    expect(summarizeEvaluation([result]).failures).toBe(1);
  });
  it("counts allowed evidence, false positives and forbidden claims separately", () => {
    expect(
      evaluateCase(
        { id: "p", group: "positive", expectedUrls: ["/resume"] },
        { sources: [{ title: "경력", url: "/resume", text: "내용", score: 0.8 }], answer: "근거" },
        200,
      ).retrievalPass,
    ).toBe(true);
    expect(
      evaluateCase(
        { id: "n", group: "negative", expectedUrls: [] },
        { sources: [{ title: "무관", url: "/resume", text: "내용", score: 0.8 }] },
        200,
      ).retrievalPass,
    ).toBe(false);
    expect(
      evaluateCase(
        { id: "i", group: "injection", forbiddenClaims: ["INJECTION_SUCCESS"] },
        { sources: [], answer: "INJECTION_SUCCESS" },
        200,
      ).claimsPass,
    ).toBe(false);
  });
  it("never treats upstream errors as successful rejection and excludes calibration from recall", () => {
    const fail = evaluateCase(
      { id: "n", group: "negative", expectedUrls: [] },
      { sources: [] },
      503,
    );
    expect(fail.retrievalPass).toBe(false);
    const summary = summarizeEvaluation([
      { group: "positive", retrievalPass: true },
      { group: "positive", retrievalPass: false },
      { group: "calibration", retrievalPass: true },
      { group: "negative", retrievalPass: false },
    ]);
    expect(summary.recallAt3).toBe(0.5);
    expect(summary.falsePositives).toBe(1);
  });
});
