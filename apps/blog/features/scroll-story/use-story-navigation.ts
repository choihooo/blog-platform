"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import type { SceneIndex } from "./story-controller";

const hashes = ["#about", "#blog", "#work"] as const;
export function sceneFromHash(hash: string): SceneIndex {
  return hash === "#blog" ? 1 : hash === "#work" ? 2 : 0;
}

export function useStoryNavigation(
  root: RefObject<HTMLElement | null>,
  reducedMotion: boolean,
  displayed: SceneIndex,
) {
  const [selection, setSelection] = useState<{ target: SceneIndex; immediate: boolean }>({
    target: 0,
    immediate: true,
  });
  const [ready, setReady] = useState(false);
  const target = useRef<SceneIndex>(0);
  const motion = useRef(reducedMotion);
  const pending = useRef<SceneIndex | null>(null);
  useEffect(() => {
    motion.current = reducedMotion;
  }, [reducedMotion]);

  const goTo = useCallback(
    (index: SceneIndex) => {
      const container = root.current;
      if (!container) return;
      target.current = index;
      pending.current = index;
      setSelection({ target: index, immediate: false });
      container.scrollTo({
        top: index * container.clientHeight,
        behavior: motion.current ? "instant" : "smooth",
      });
    },
    [root],
  );

  useEffect(() => {
    const container = root.current;
    if (!container) return;
    function restore() {
      const index = sceneFromHash(window.location.hash);
      target.current = index;
      pending.current = null;
      setSelection({ target: index, immediate: true });
      container!.scrollTo({ top: index * container!.clientHeight, behavior: "instant" });
    }
    function updateProgress() {
      if (!container!.clientHeight) return;
      const index = Math.min(
        2,
        Math.max(0, Math.round(container!.scrollTop / container!.clientHeight)),
      ) as SceneIndex;
      if (pending.current !== null && index !== pending.current) return;
      pending.current = null;
      if (index === target.current) return;
      target.current = index;
      setSelection({ target: index, immediate: false });
    }
    let lastWheel = -Infinity;
    let wheelLockedUntil = 0;
    function wheel(event: WheelEvent) {
      if (!event.deltaY || Math.abs(event.deltaX) > Math.abs(event.deltaY) || event.ctrlKey) return;
      event.preventDefault();
      const now = performance.now();
      const gap = now - lastWheel;
      lastWheel = now;
      if (now < wheelLockedUntil || gap < 160) return;
      const to = Math.min(2, Math.max(0, target.current + Math.sign(event.deltaY))) as SceneIndex;
      if (target.current === to) return;
      wheelLockedUntil = now + 1300;
      goTo(to);
    }
    function keyboard(event: KeyboardEvent) {
      if (
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        (event.target as HTMLElement).closest("input,textarea,select,[contenteditable=true]")
      )
        return;
      const delta =
        event.key === "PageDown" || event.key === "ArrowDown"
          ? 1
          : event.key === "PageUp" || event.key === "ArrowUp"
            ? -1
            : 0;
      if (!delta && event.key !== "Home" && event.key !== "End") return;
      event.preventDefault();
      const index =
        event.key === "Home"
          ? 0
          : event.key === "End"
            ? 2
            : Math.min(2, Math.max(0, target.current + delta));
      goTo(index as SceneIndex);
    }
    restore();
    setReady(true);
    let height = container.clientHeight;
    const observer = new ResizeObserver(() => {
      if (height === container.clientHeight) return;
      height = container.clientHeight;
      pending.current = target.current;
      container.scrollTo({ top: target.current * height, behavior: "instant" });
    });
    observer.observe(container);
    container.addEventListener("scroll", updateProgress, { passive: true });
    container.addEventListener("wheel", wheel, { passive: false });
    container.addEventListener("keydown", keyboard);
    window.addEventListener("hashchange", restore);
    window.addEventListener("popstate", restore);
    window.addEventListener("pageshow", restore);
    return () => {
      observer.disconnect();
      container.removeEventListener("scroll", updateProgress);
      container.removeEventListener("wheel", wheel);
      container.removeEventListener("keydown", keyboard);
      window.removeEventListener("hashchange", restore);
      window.removeEventListener("popstate", restore);
      window.removeEventListener("pageshow", restore);
    };
  }, [root, goTo]);

  useEffect(() => {
    if (!ready || displayed !== selection.target) return;
    const hash = hashes[displayed];
    // Preserve Next's router state; scene changes must not add history entries.
    if (window.location.hash !== hash)
      window.history.replaceState(
        window.history.state,
        "",
        `${window.location.pathname}${window.location.search}${hash}`,
      );
  }, [ready, displayed, selection.target]);

  return { ...selection, ready, goTo };
}
