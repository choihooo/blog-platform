import { describe, expect, it } from "vitest";
import { createScrollMilestoneState, nextScrollMilestone } from "./scroll-milestones.js";

describe("scroll milestones", () => {
  it("emits each threshold once per article state", () => {
    let state = createScrollMilestoneState("hello");
    let result = nextScrollMilestone(state, 0.51);
    expect(result.event).toBe("scroll_50");
    state = result.state;
    expect(nextScrollMilestone(state, 0.7).event).toBeUndefined();
    result = nextScrollMilestone(state, 0.91);
    expect(result.event).toBe("scroll_90");
    expect(nextScrollMilestone(result.state, 1).event).toBeUndefined();
  });
});
