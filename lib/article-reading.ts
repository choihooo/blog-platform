import type { AnalyticsEvents } from "./analytics";

type ReadingEvent = "article_read_progress" | "article_read_summary";
type Send = <K extends ReadingEvent>(name: K, params: AnalyticsEvents[K]) => void;

export function getArticleReadPercent(articleTop: number, articleHeight: number, viewportBottom: number): number {
  if (![articleTop, articleHeight, viewportBottom].every(Number.isFinite) || articleHeight <= 0) return 0;
  return Math.min(100, Math.max(0, Math.floor((viewportBottom - articleTop) / articleHeight * 100)));
}

export function createArticleReadSession(slug: string, send: Send, { now = () => performance.now(), visitId = crypto.randomUUID() }: { now?: () => number; visitId?: string } = {}) {
  const base = { article_slug: slug, article_visit_id: visitId };
  const crossed = new Set<number>();
  let maximum = 0, last = 0, maxSection = "intro", lastSection = "intro";
  let activeSince: number | null = null, activeMs = 0, reportedMs = 0, sequence = 0;
  let previousSummary = "", finished = false;
  const elapsed = () => activeMs + (activeSince === null ? 0 : Math.max(0, now() - activeSince));

  function setActive(active: boolean) {
    if (finished) return;
    if (active && activeSince === null) activeSince = now();
    else if (!active && activeSince !== null) { activeMs = elapsed(); activeSince = null; }
  }

  function summarize(reason: string) {
    if (finished) return;
    const totalMs = Math.round(elapsed() / 100) * 100;
    const signature = JSON.stringify([maximum, last, maxSection, lastSection, totalMs]);
    if (signature === previousSummary) return;
    previousSummary = signature;
    send("article_read_summary", { ...base, max_scroll_percent: maximum, last_scroll_percent: last,
      max_section: maxSection, last_section: lastSection, active_read_seconds: Math.max(0, totalMs - reportedMs) / 1000,
      summary_reason: reason, summary_sequence: ++sequence });
    reportedMs = totalMs;
  }

  return {
    setActive,
    update(percent: number, section: string) {
      if (finished || !Number.isFinite(percent)) return;
      last = Math.min(100, Math.max(0, Math.floor(percent)));
      lastSection = section || "intro";
      if (last > maximum) { maximum = last; maxSection = lastSection; }
      for (const milestone of [25, 50, 75, 90, 100]) {
        if (maximum < milestone || crossed.has(milestone)) continue;
        crossed.add(milestone);
        send("article_read_progress", { ...base, percent_scrolled: milestone });
      }
    },
    summarize,
    finish(reason: string) {
      if (finished) return;
      setActive(false);
      summarize(reason);
      finished = true;
    },
  };
}
