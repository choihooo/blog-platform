"use client";

import { ThemeSwitch as HozuiThemeSwitch } from "@hozui/react";
import { useEffect, useState } from "react";

type ThemeMode = "light" | "dark";

const storageKey = "blog-theme";

function preferredTheme(): ThemeMode {
  if (typeof window === "undefined") return "light";
  const stored = window.localStorage.getItem(storageKey);
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme: ThemeMode) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
}

export function ThemeSwitch() {
  const [theme, setTheme] = useState<ThemeMode>("light");

  useEffect(() => {
    const nextTheme = preferredTheme();
    setTheme(nextTheme);
    applyTheme(nextTheme);
  }, []);

  function updateTheme(nextTheme: ThemeMode) {
    setTheme(nextTheme);
    window.localStorage.setItem(storageKey, nextTheme);
    applyTheme(nextTheme);
  }

  return <HozuiThemeSwitch theme={theme} onThemeChange={updateTheme} aria-label="다크 모드" />;
}
