import { describe, expect, it } from "vitest";

import { calculateReadingTime } from "./reading-time.js";

describe("calculateReadingTime", () => {
  it("is deterministic", () => {
    const body = "one two three";

    expect(calculateReadingTime(body)).toEqual(calculateReadingTime(body));
  });

  it("handles empty body", () => {
    expect(calculateReadingTime("")).toEqual({ minutes: 0, words: 0, label: "0 min read" });
  });
});
