import { describe, expect, it } from "vitest";
import { sceneFromHash } from "./use-story-navigation";

describe("home scene deep links", () => {
  it.each([
    ["", 0],
    ["#about", 0],
    ["#unknown", 0],
    ["#blog", 1],
    ["#work", 2],
  ] as const)("maps %s to scene %s", (hash, expected) => {
    expect(sceneFromHash(hash)).toBe(expected);
  });
});
