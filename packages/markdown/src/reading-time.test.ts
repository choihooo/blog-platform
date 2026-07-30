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

  it("uses stable labels for short and long bodies", () => {
    expect(calculateReadingTime("short body").label).toBe("1 min read");
    expect(calculateReadingTime(Array.from({ length: 450 }, () => "word").join(" ")).label).toBe(
      "3 min read",
    );
  });
});
