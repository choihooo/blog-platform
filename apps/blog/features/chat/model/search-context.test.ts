import { describe, expect, it } from "vitest";
import { advanceSearchContext } from "./search-context";

describe("search evidence context", () => {
  it("keeps context when an answer has no sources", () => {
    const previous = { query: "old", titles: ["Old"] };
    expect(advanceSearchContext(previous, "new", { answer: "Clarify", sources: [] })).toBe(
      previous,
    );
  });
  it("deduplicates titles and keeps only five earlier searches", () => {
    const previous = {
      query: "q6",
      titles: ["Six"],
      history: [1, 2, 3, 4, 5].map((n) => ({ query: "q" + n, titles: ["T" + n] })),
    };
    const source = (title: string) => ({ title, url: "/blog/a", text: "evidence", score: 1 });
    const result = advanceSearchContext(previous, "new", {
      sources: ["A", "A", "B", "C", "D"].map(source),
      resolvedQuery: "resolved",
    });
    expect(result).toEqual({
      query: "resolved",
      titles: ["A", "B", "C"],
      history: [
        { query: "q2", titles: ["T2"] },
        { query: "q3", titles: ["T3"] },
        { query: "q4", titles: ["T4"] },
        { query: "q5", titles: ["T5"] },
        { query: "q6", titles: ["Six"] },
      ],
    });
  });
});
