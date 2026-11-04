import { describe, expect, it } from "vitest";
import { reduceStory, type StoryState } from "./story-controller";

const start: StoryState = { displayed: 0, target: 0, transition: null };
describe("home scene transitions", () => {
  it("keeps the old scene until the matching transition finishes", () => {
    const next = reduceStory(start, { type: "select", to: 1, id: 1, immediate: false });
    expect(next).toEqual({ displayed: 0, target: 1, transition: { id: 1, from: 0, to: 1 } });
    expect(reduceStory(next, { type: "complete", id: 1 })).toEqual({
      displayed: 1,
      target: 1,
      transition: null,
    });
  });
  it("ignores a stale video after a cancelled gesture", () => {
    const first = reduceStory(start, { type: "select", to: 1, id: 1, immediate: false });
    const cancelled = reduceStory(first, { type: "select", to: 0, id: 2, immediate: false });
    expect(reduceStory(cancelled, { type: "complete", id: 1 })).toEqual(start);
  });
  it("ignores a stale completion while another target is loading", () => {
    const first = reduceStory(start, { type: "select", to: 1, id: 1, immediate: false });
    const latest = reduceStory(first, { type: "select", to: 2, id: 2, immediate: false });
    expect(reduceStory(latest, { type: "complete", id: 1 })).toEqual(latest);
    expect(reduceStory(latest, { type: "complete", id: 2 }).displayed).toBe(2);
  });
  it("immediately selects static scenes for restored navigation or reduced motion", () => {
    expect(reduceStory(start, { type: "select", to: 2, id: 1, immediate: true })).toEqual({
      displayed: 2,
      target: 2,
      transition: null,
    });
  });
});
