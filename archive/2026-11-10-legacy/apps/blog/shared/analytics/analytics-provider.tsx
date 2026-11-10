"use client";

import type { ReactNode } from "react";
import type { ProviderInit, ProviderPayload } from "@blog-platform/core/analytics";

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    gtag?: (command: "event", event: string, params: Record<string, string | string[]>) => void;
    __BLOG_ANALYTICS__?: ProviderInit;
    __BLOG_TRACK__?: (payload: ProviderPayload) => void;
  }
}

export function sendAnalyticsPayload(payload: ProviderPayload) {
  if (!payload.ok || typeof window === "undefined") return;
  if (payload.provider === "ga4") {
    window.gtag?.("event", payload.event, payload.params);
    return;
  }
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push(payload.dataLayer);
}

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  if (typeof window !== "undefined") window.__BLOG_TRACK__ = sendAnalyticsPayload;
  return children;
}
