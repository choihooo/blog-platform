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
});
