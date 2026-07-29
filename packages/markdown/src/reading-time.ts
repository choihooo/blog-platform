import readingTime from "reading-time";

import type { ReadingTimeResult } from "./types.js";

export function calculateReadingTime(body: string): ReadingTimeResult {
  const stats = readingTime(body);
  const minutes = body.trim() ? Math.max(1, Math.ceil(stats.minutes)) : 0;
  return {
    minutes,
    words: stats.words,
    label: minutes === 1 ? "1 min read" : `${minutes} min read`,
  };
}
