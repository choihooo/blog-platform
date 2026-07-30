"use client";

import { useEffect, useRef } from "react";
import {
  classifyLink,
  createBlogEvent,
  createScrollMilestoneState,
  nextScrollMilestone,
  toProviderPayload,
  type AnalyticsConfig,
  type BlogEventName,
} from "@blog-platform/analytics";

export type PostAnalyticsContext = {
  provider: string;
  slug: string;
  title: string;
  url: string;
  siteUrl: string;
  category?: string;
  tags?: string[];
};

export function payloadForPostEvent(
  context: PostAnalyticsContext,
  name: BlogEventName,
  target?: string,
) {
  const init = typeof window === "undefined" ? undefined : window.__BLOG_ANALYTICS__;
  const config: AnalyticsConfig = {
    provider: context.provider,
    measurementId: init?.ok && init.provider === "ga4" ? init.measurementId : undefined,
    containerId: init?.ok && init.provider === "gtm" ? init.containerId : undefined,
  };
  return toProviderPayload(
    createBlogEvent({ ...context, name, target, occurredAt: new Date().toISOString() }),
    config,
  );
}

export function trackPostEvent(
  context: PostAnalyticsContext,
  name: BlogEventName,
  target?: string,
) {
  if (typeof window === "undefined") return;
  window.__BLOG_TRACK__?.(payloadForPostEvent(context, name, target));
}

export function eventNameForHref(
  href: string | undefined,
  siteUrl: string,
): { name: "internal_link_click" | "external_link_click"; target: string } | undefined {
  const link = classifyLink(href, siteUrl);
  if (link.kind === "ignored") return undefined;
  return {
    name: link.kind === "internal" ? "internal_link_click" : "external_link_click",
    target: link.url,
  };
}

export function PostAnalyticsEvents({ context }: { context: PostAnalyticsContext }) {
  const milestones = useRef(createScrollMilestoneState(context.slug));

  useEffect(() => {
    trackPostEvent(context, "article_view", "post");
  }, [context]);

  useEffect(() => {
    function onScroll() {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const result = nextScrollMilestone(milestones.current, window.scrollY / max);
      milestones.current = result.state;
      if (result.event) trackPostEvent(context, result.event, result.event);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [context]);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      const target = event.target instanceof Element ? event.target.closest("a") : null;
      const href = target?.getAttribute("href");
      if (!target || !href) return;
      const tocTarget = target.closest("[data-analytics-toc]");
      if (tocTarget) {
        trackPostEvent(context, "toc_click", href.replace(/^#/, ""));
        return;
      }
      const linkEvent = eventNameForHref(href, context.siteUrl);
      if (linkEvent) trackPostEvent(context, linkEvent.name, linkEvent.target);
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [context]);

  return null;
}
