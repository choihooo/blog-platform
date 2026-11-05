import { describe, expect, it } from "vitest";
import { calculateReadingTime } from "./post-content.js";

describe("calculateReadingTime", () => {
  it.each([
    ["", 0, 1],
    [Array(220).fill("word").join(" "), 220, 1],
    [Array(221).fill("한글").join(" "), 221, 2],
  ])("counts Unicode words and rounds up at 220 words per minute", (text, words, minutes) => {
    expect(calculateReadingTime(text)).toEqual({ words, minutes, label: `${minutes} min read` });
  });
});
