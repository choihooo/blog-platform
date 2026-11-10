"use client";
import { useEffect, useState, type RefObject } from "react";
import { createVideoScrubber, getScrollProgress } from "./scroll-video";
import { getAboutChapter } from "./about-data";
export function useAboutScroll({
  mode,
  track,
  video,
  progressLine,
}: {
  mode: "static" | "scroll";
  track: RefObject<HTMLDivElement | null>;
  video: RefObject<HTMLVideoElement | null>;
  progressLine: RefObject<HTMLDivElement | null>;
}): number {
  const [chapter, setChapter] = useState(0);
  useEffect(() => {
    if (mode !== "scroll" || !track.current || !video.current) return;
    const element = track.current;
    const scrubber = createVideoScrubber(video.current, {
      requestFrame: (callback) => window.requestAnimationFrame(callback),
      cancelFrame: (id) => window.cancelAnimationFrame(id),
    });
    let frame: number | null = null;
    let activeChapter = -1;
    const measure = () => {
      frame = null;
      const rect = element.getBoundingClientRect();
      const progress = getScrollProgress(rect.top, rect.height, window.innerHeight);
      scrubber.update(progress);
      if (progressLine.current) progressLine.current.style.transform = `scaleX(${progress})`;
      const nextChapter = getAboutChapter(progress);
      if (nextChapter !== activeChapter) {
        activeChapter = nextChapter;
        setChapter(nextChapter);
      }
    };
    const schedule = () => {
      if (frame === null) frame = window.requestAnimationFrame(measure);
    };
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    window.addEventListener("pageshow", schedule);
    schedule();
    return () => {
      if (frame !== null) window.cancelAnimationFrame(frame);
      scrubber.dispose();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("pageshow", schedule);
    };
  }, [mode, track, video, progressLine]);

  return chapter;
}
