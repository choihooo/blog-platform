function clamp(value: number) {
  return Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0;
}

export function getScrollProgress(top: number, height: number, viewport: number) {
  return height > viewport ? clamp(-top / (height - viewport)) : 0;
}

export function getVideoTime(progress: number, duration: number) {
  if (!Number.isFinite(duration) || duration <= 0) return 0;
  return Math.min(clamp(progress) * duration, Math.max(0, duration - 1 / 24));
}

type ScrubVideo = EventTarget & {
  currentTime: number;
  duration: number;
  readyState: number;
  seeking: boolean;
};

type FrameScheduler = {
  requestFrame: (callback: FrameRequestCallback) => number;
  cancelFrame: (id: number) => void;
};

/** A seek in flight is never interrupted: seeked applies the newest scroll target. */
export function createVideoScrubber(video: ScrubVideo, scheduler: FrameScheduler) {
  let progress = 0;
  let frame: number | null = null;
  let disposed = false;

  function flush() {
    frame = null;
    if (disposed || video.readyState < 1 || video.seeking) return;
    const target = getVideoTime(progress, video.duration);
    if (Math.abs(video.currentTime - target) > 1 / 60) video.currentTime = target;
  }

  function schedule() {
    if (!disposed && frame === null) frame = scheduler.requestFrame(flush);
  }

  video.addEventListener("loadedmetadata", schedule);
  video.addEventListener("seeked", schedule);

  return {
    update(nextProgress: number) {
      progress = clamp(nextProgress);
      schedule();
    },
    dispose() {
      disposed = true;
      if (frame !== null) scheduler.cancelFrame(frame);
      frame = null;
      video.removeEventListener("loadedmetadata", schedule);
      video.removeEventListener("seeked", schedule);
    },
  };
}
