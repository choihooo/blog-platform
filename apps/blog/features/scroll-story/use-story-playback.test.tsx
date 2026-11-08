// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it } from "vitest";
import { useStoryPlayback } from "./use-story-playback";
import type { SceneIndex, StoryState } from "./story-controller";
it("contains rejected playback and pauses scenes while a transition clip runs", async () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  const scene = document.createElement("video");
  const clip = document.createElement("video");
  let scenePaused = false,
    clipStarted = false;
  Object.defineProperties(scene, {
    play: { value: () => Promise.reject(new Error("autoplay blocked")) },
    pause: {
      value: () => {
        scenePaused = true;
      },
    },
  });
  Object.defineProperties(clip, {
    play: {
      value: async () => {
        clipStarted = true;
      },
    },
    pause: { value: () => {} },
  });
  const videos = { current: [scene] },
    transitionVideo = { current: clip };
  const root = createRoot(document.createElement("div"));
  const hidden = Object.getOwnPropertyDescriptor(document, "hidden");
  Object.defineProperty(document, "hidden", { configurable: true, value: false });
  function Harness({ transition }: { transition: StoryState["transition"] }) {
    useStoryPlayback({
      videos,
      transitionVideo,
      displayed: 0,
      transition,
      reducedMotion: false,
      videoReady: [],
    });
    return <p>Ready</p>;
  }
  try {
    await act(async () => root.render(<Harness transition={null} />));
    await act(async () => root.render(<Harness transition={{ id: 1, from: 0, to: 1 }} />));
    expect(scenePaused).toBe(true);
    expect(clipStarted).toBe(true);
  } finally {
    await act(async () => root.unmount());
    if (hidden) Object.defineProperty(document, "hidden", hidden);
    else Reflect.deleteProperty(document, "hidden");
  }
});
it("plays only the selected scene and pauses hidden or reduced-motion media", async () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  const media = () => {
    const video = document.createElement("video");
    let paused = true;
    Object.defineProperties(video, {
      paused: { get: () => paused },
      play: {
        value: async () => {
          paused = false;
        },
      },
      pause: {
        value: () => {
          paused = true;
        },
      },
    });
    return video;
  };
  const videos = { current: [media(), media(), media()] },
    transitionVideo = { current: media() };
  const ready = [true, true, true];
  const root = createRoot(document.createElement("div"));
  function Harness({
    displayed = 0,
    reduced = false,
    transition = null,
  }: {
    displayed?: SceneIndex;
    reduced?: boolean;
    transition?: StoryState["transition"];
  }) {
    useStoryPlayback({
      videos,
      transitionVideo,
      displayed,
      transition,
      reducedMotion: reduced,
      videoReady: ready,
    });
    return null;
  }
  const hidden = Object.getOwnPropertyDescriptor(document, "hidden");
  try {
    Object.defineProperty(document, "hidden", { configurable: true, value: false });
    await act(async () => root.render(<Harness />));
    expect(videos.current.map((v) => v.paused)).toEqual([false, true, true]);
    await act(async () => root.render(<Harness displayed={1} />));
    expect(videos.current.map((v) => v.paused)).toEqual([true, false, true]);
    Object.defineProperty(document, "hidden", { configurable: true, value: true });
    await act(async () => document.dispatchEvent(new Event("visibilitychange")));
    expect(videos.current.every((v) => v.paused)).toBe(true);
    expect(transitionVideo.current.paused).toBe(true);
    Object.defineProperty(document, "hidden", { configurable: true, value: false });
    await act(async () => root.render(<Harness reduced />));
    expect(videos.current.every((v) => v.paused)).toBe(true);
  } finally {
    await act(async () => root.unmount());
    if (hidden) Object.defineProperty(document, "hidden", hidden);
    else Reflect.deleteProperty(document, "hidden");
  }
});
