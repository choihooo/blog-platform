import { describe, expect, it } from "vitest";
import { getPostRows } from "./post-rows";

describe("progressive post rows", () => {
  it("keeps an odd final card when grouping desktop rows", () => {
    expect(getPostRows(["a", "b", "c", "d", "e"], 8, 2)).toEqual([["a", "b"], ["c", "d"], ["e"]]);
  });

  it("only exposes the loaded batch, preserving order across a mobile resize", () => {
    const posts = ["a", "b", "c", "d", "e"];
    expect(getPostRows(posts, 4, 2)).toEqual([
      ["a", "b"],
      ["c", "d"],
    ]);
    expect(getPostRows(posts, 4, 1)).toEqual([["a"], ["b"], ["c"], ["d"]]);
    expect(getPostRows(posts, 8, 1).flat()).toEqual(posts);
    expect(getPostRows([], 8, 2)).toEqual([]);
  });
});
