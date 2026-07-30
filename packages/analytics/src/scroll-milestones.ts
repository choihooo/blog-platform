import type { BlogEventName } from "./types.js";

export type ScrollMilestoneState = {
  articleSlug: string;
  sent50: boolean;
  sent90: boolean;
};

export function createScrollMilestoneState(articleSlug: string): ScrollMilestoneState {
  return { articleSlug, sent50: false, sent90: false };
}

export function nextScrollMilestone(
  state: ScrollMilestoneState,
  progress: number,
): { state: ScrollMilestoneState; event?: BlogEventName } {
  if (progress >= 0.9 && !state.sent90) {
    return { state: { ...state, sent90: true }, event: "scroll_90" };
  }
  if (progress >= 0.5 && !state.sent50) {
    return { state: { ...state, sent50: true }, event: "scroll_50" };
  }
  return { state };
}
