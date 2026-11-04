export type SceneIndex = 0 | 1 | 2;
export type StoryState = {
  displayed: SceneIndex;
  target: SceneIndex;
  transition: { id: number; from: SceneIndex; to: SceneIndex } | null;
};
export type StoryEvent =
  | { type: "select"; to: SceneIndex; id: number; immediate: boolean }
  | { type: "complete"; id: number };

export function reduceStory(state: StoryState, event: StoryEvent): StoryState {
  if (event.type === "complete") {
    if (state.transition?.id !== event.id) return state;
    return { displayed: state.target, target: state.target, transition: null };
  }
  if (event.immediate || event.to === state.displayed) {
    return { displayed: event.to, target: event.to, transition: null };
  }
  return {
    displayed: state.displayed,
    target: event.to,
    transition: { id: event.id, from: state.displayed, to: event.to },
  };
}
