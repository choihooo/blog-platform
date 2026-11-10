"use client";

import { useSyncExternalStore } from "react";
import { ArrowUp } from "lucide-react";
import styles from "./ScrollToTop.module.css";

function subscribe(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true });
  window.addEventListener("resize", onChange);
  return () => {
    window.removeEventListener("scroll", onChange);
    window.removeEventListener("resize", onChange);
  };
}

function getSnapshot() {
  const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
  const threshold = Math.min(320, scrollableHeight / 2);
  return window.scrollY > 0 && window.scrollY >= threshold;
}

function getServerSnapshot() {
  return false;
}

export function ScrollToTop() {
  const visible = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  if (!visible) return null;

  function scrollToTop() {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reducedMotion ? "instant" : "smooth" });
    // Move focus to a stable control before this button disappears near the top.
    document.querySelector<HTMLElement>(".blog-header a")?.focus({ preventScroll: true });
  }

  return (
    <button type="button" className={styles.button} aria-label="맨 위로 이동" title="맨 위로 이동" onClick={scrollToTop}>
      <ArrowUp size={20} strokeWidth={1.7} aria-hidden="true" />
    </button>
  );
}
