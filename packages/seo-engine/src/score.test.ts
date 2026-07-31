import { describe, expect, it } from "vitest";
import { scoreSeo } from "./score.js";
import { seoSubject } from "./test-fixtures.js";

describe("scoreSeo", () => {
  it("scores complete posts at 100 and blocks missing required fields", () => {
    expect(scoreSeo(seoSubject()).score).toBe(100);
    expect(
      scoreSeo(seoSubject({ title: "", slug: "" })).blocking.map((issue) => issue.code),
    ).toEqual(["missing-title", "missing-slug"]);
  });

  it("does not require body-authored internal links", () => {
    const result = scoreSeo(seoSubject({ internalLinks: [] }));

    expect(result.score).toBe(100);
    expect(result.checks.map((issue) => issue.code)).not.toContain("internal-link");
  });
});
