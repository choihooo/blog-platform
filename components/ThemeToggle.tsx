"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import styles from "./ScrollToTop.module.css";

function subscribe(onChange: () => void) {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  function followSystem() {
    try {
      const saved = localStorage.getItem("blog_theme");
      if (saved === "light" || saved === "dark") return;
    } catch { /* Keep the current choice when storage is unavailable. */ }
    document.documentElement.dataset.theme = media.matches ? "dark" : "light";
    onChange();
  }
  window.addEventListener("blog-theme-change", onChange);
  media.addEventListener("change", followSystem);
  return () => {
    window.removeEventListener("blog-theme-change", onChange);
    media.removeEventListener("change", followSystem);
  };
}

function getSnapshot() {
  return document.documentElement.dataset.theme === "dark";
}

export function ThemeToggle() {
  const dark = useSyncExternalStore(subscribe, getSnapshot, () => false);
  const label = dark ? "라이트 모드로 전환" : "다크 모드로 전환";

  function toggleTheme() {
    const theme = getSnapshot() ? "light" : "dark";
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem("blog_theme", theme); } catch { /* The toggle still works without persistence. */ }
    window.dispatchEvent(new Event("blog-theme-change"));
  }

  return (
    <button type="button" className={`${styles.button} ${styles.theme}`} aria-label={label} title={label} onClick={toggleTheme}>
      {dark ? <Sun size={20} strokeWidth={1.7} aria-hidden="true" /> : <Moon size={20} strokeWidth={1.7} aria-hidden="true" />}
    </button>
  );
}
