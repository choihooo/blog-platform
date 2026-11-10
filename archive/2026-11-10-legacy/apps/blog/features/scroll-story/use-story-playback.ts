"use client";
import { useEffect, type RefObject } from "react";
import type { SceneIndex, StoryState } from "./story-controller";
export function useStoryPlayback({
  videos,
  transitionVideo,
  displayed,
  transition,
  reducedMotion,
  videoReady,
}: {
  videos: RefObject<(HTMLVideoElement | null)[]>;
  transitionVideo: RefObject<HTMLVideoElement | null>;
  displayed: SceneIndex;
  transition: StoryState["transition"];
  reducedMotion: boolean;
  videoReady: readonly boolean[];
}) {
  useEffect(() => {
    function updatePlayback() {
      videos.current.forEach((video, index) => {
        if (!video) return;
        if (index === displayed && !transition && !reducedMotion && !document.hidden) {
          void video.play().catch(() => {});
        } else {
          video.pause();
        }
      });
      const clip = transitionVideo.current;
      if (clip) {
        if (document.hidden) clip.pause();
        else if (!reducedMotion) void clip.play().catch(() => {});
      }
    }
    updatePlayback();
    document.addEventListener("visibilitychange", updatePlayback);
    return () => document.removeEventListener("visibilitychange", updatePlayback);
  }, [displayed, transition, reducedMotion, videoReady, videos, transitionVideo]);
}
