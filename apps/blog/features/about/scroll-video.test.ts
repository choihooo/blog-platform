import { describe, expect, it } from "vitest";

import { createVideoScrubber, getScrollProgress, getVideoTime } from "./scroll-video";
import { getAboutPresentation } from "./about-data";

class FakeVideo extends EventTarget {
  duration = 10;
  readyState = 1;
  seeking = false;
  currentTime = 0;
}

function setup() {
  const video = new FakeVideo();
  let nextId = 0;
  const frames = new Map<number, FrameRequestCallback>();
  const scrubber = createVideoScrubber(video, {
    requestFrame: (callback) => {
      frames.set(++nextId, callback);
      return nextId;
    },
    cancelFrame: (id) => frames.delete(id),
  });
  const flush = () => {
    const pending = [...frames.values()];
    frames.clear();
    pending.forEach((callback) => callback(0));
  };
  return { video, scrubber, frames, flush };
}

describe("about scroll timeline", () => {
  it("uses readable document flow for short screens, reduced motion and media failure", () => {
    expect(getAboutPresentation(false, 375, false)).toBe("static");
    expect(getAboutPresentation(false, 540, false)).toBe("static");
    expect(getAboutPresentation(true, 844, false)).toBe("static");
    expect(getAboutPresentation(false, 900, true)).toBe("static");
    expect(getAboutPresentation(false, 844, false)).toBe("scroll");
  });
  it("maps a sticky track to bounded progress in both directions", () => {
    expect(getScrollProgress(30, 6000, 1000)).toBe(0);
    expect(getScrollProgress(-2500, 6000, 1000)).toBe(0.5);
    expect(getScrollProgress(-9000, 6000, 1000)).toBe(1);
    expect(getScrollProgress(0, 500, 1000)).toBe(0);
  });

  it("keeps the last seek on a decoded frame and rejects unknown durations", () => {
    expect(getVideoTime(0.5, 10)).toBe(5);
    expect(getVideoTime(1, 10)).toBeCloseTo(10 - 1 / 24);
    expect(getVideoTime(-1, 10)).toBe(0);
    expect(getVideoTime(1, Number.NaN)).toBe(0);
    expect(getVideoTime(1, Infinity)).toBe(0);
  });

  it("restores the latest scroll position when metadata arrives late", () => {
    const { video, scrubber, flush } = setup();
    video.readyState = 0;
    video.duration = Number.NaN;
    scrubber.update(0.8);
    flush();
    expect(video.currentTime).toBe(0);
    video.readyState = 1;
    video.duration = 10;
    video.dispatchEvent(new Event("loadedmetadata"));
    flush();
    expect(video.currentTime).toBe(8);
    scrubber.dispose();
  });

  it("coalesces rapid scrolls and seeks to the latest reversed target after seeked", () => {
    const { video, scrubber, frames, flush } = setup();
    scrubber.update(0.4);
    scrubber.update(0.5);
    expect(frames.size).toBe(1);
    flush();
    expect(video.currentTime).toBe(5);
    video.seeking = true;
    scrubber.update(0.9);
    scrubber.update(0.1);
    flush();
    expect(video.currentTime).toBe(5);
    video.seeking = false;
    video.dispatchEvent(new Event("seeked"));
    flush();
    expect(video.currentTime).toBe(1);
    scrubber.dispose();
  });

  it("cancels queued work and stops listening when the page is left", () => {
    const { video, scrubber, frames, flush } = setup();
    scrubber.update(0.6);
    scrubber.dispose();
    expect(frames.size).toBe(0);
    video.dispatchEvent(new Event("seeked"));
    scrubber.update(0.9);
    flush();
    expect(video.currentTime).toBe(0);
  });
});
