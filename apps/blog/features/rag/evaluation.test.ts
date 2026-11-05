import { describe, expect, it } from "vitest";
import { evaluateCase, summarizeEvaluation } from "../../scripts/rag-evaluation.mjs";

describe("RAG quality evaluation", () => {
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
