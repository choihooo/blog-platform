"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { getTrackedLink, installAnalytics, trackEvent } from "@/lib/analytics";
import { createArticleReadSession, getArticleReadPercent } from "@/lib/article-reading";

export function AnalyticsEvents({ measurementId }: { measurementId: string }) {
  const pathname = usePathname();

  useEffect(() => installAnalytics(measurementId), [measurementId]);

  useEffect(() => {
    function click(event: MouseEvent) {
      if (!(event.target instanceof Element)) return;
      const link = event.target.closest("a[href]");
      if (!link) return;
      const placement = link.closest("footer") ? "footer" : link.closest("article") ? "article" : link.closest("header") ? "header" : "other";
      const tracked = getTrackedLink(link.getAttribute("href") || "", placement);
      if (tracked) trackEvent(tracked.name, tracked.params);
    }
    document.addEventListener("click", click, true);
    return () => document.removeEventListener("click", click, true);
  }, []);

  useEffect(() => {
    const slug = pathname.match(/^\/blog\/([a-z0-9]+(?:-[a-z0-9]+)*)\/?$/)?.[1];
    const article = document.querySelector<HTMLElement>("article.prose");
    if (!slug || !article) return;
    // The title/metadata and table of contents are not article body reading.
    const firstBodyElement = article.querySelector<HTMLElement>(":scope > :not(header):not(nav):not(script)") || article;
    const session = createArticleReadSession(slug, (name, params) => { trackEvent(name, params, pathname); });
    let frame = 0;

    function measure() {
      frame = 0;
      if (!article!.isConnected || document.hidden) return;
      const top = firstBodyElement.getBoundingClientRect().top;
      const bottom = article!.getBoundingClientRect().bottom;
      if (bottom <= top) return;
      session.setActive(!document.hidden && top < innerHeight && bottom > 0);
      let section = "intro";
      for (const heading of article!.querySelectorAll<HTMLElement>("h2[id], h3[id]")) {
        if (heading.getBoundingClientRect().top <= innerHeight / 2) section = heading.id;
      }
      session.update(getArticleReadPercent(top, bottom - top, innerHeight), section);
    }
    function schedule() { if (!frame && !document.hidden) frame = requestAnimationFrame(() => measure()); }
    function pause(reason: string) {
      if (frame) { cancelAnimationFrame(frame); frame = 0; }
      // Keep the last visible sample; background geometry is not a view.
      if (!document.hidden) measure();
      session.setActive(false);
      session.summarize(reason);
    }
    function visibility() {
      if (document.hidden) pause("tab_hidden");
      else measure();
    }
    function pagehide() { pause("page_exit"); }
    function pageshow() { if (!document.hidden) measure(); }
    const resize = new ResizeObserver(schedule);
    resize.observe(article);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    window.addEventListener("pagehide", pagehide);
    window.addEventListener("pageshow", pageshow);
    document.addEventListener("visibilitychange", visibility);
    measure();

    return () => {
      if (frame) cancelAnimationFrame(frame);
      resize.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("pagehide", pagehide);
      window.removeEventListener("pageshow", pageshow);
      document.removeEventListener("visibilitychange", visibility);
      session.finish("route_change");
    };
  }, [pathname]);

  return null;
}
