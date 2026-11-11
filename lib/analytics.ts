export type AnalyticsEvents = {
  article_like: { article_slug: string; like_action: "like" | "unlike" };
  comment_submit: { article_slug: string };
  search_open: Record<string, never>;
  blog_search: { query_length: number; result_count: number };
  search_result_click: { article_slug: string; result_position: number };
  code_copy: { copy_status: "success" | "error"; code_language: string; code_index: number };
  github_click: { link_location: string };
  email_click: { link_location: string };
  article_read_progress: { article_slug: string; article_visit_id: string; percent_scrolled: number };
  article_read_summary: {
    article_slug: string; article_visit_id: string; max_scroll_percent: number; last_scroll_percent: number;
    max_section: string; last_section: string; active_read_seconds: number; summary_reason: string; summary_sequence: number;
  };
};

const allowed: { [K in keyof AnalyticsEvents]: readonly (keyof AnalyticsEvents[K])[] } = {
  article_like: ["article_slug", "like_action"], comment_submit: ["article_slug"], search_open: [],
  blog_search: ["query_length", "result_count"], search_result_click: ["article_slug", "result_position"],
  code_copy: ["copy_status", "code_language", "code_index"], github_click: ["link_location"], email_click: ["link_location"],
  article_read_progress: ["article_slug", "article_visit_id", "percent_scrolled"],
  article_read_summary: ["article_slug", "article_visit_id", "max_scroll_percent", "last_scroll_percent", "max_section", "last_section", "active_read_seconds", "summary_reason", "summary_sequence"],
};

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

let destination: string | undefined;

export function installAnalytics(measurementId: string) {
  if (typeof window === "undefined" || !/^G-[A-Z0-9]+$/.test(measurementId)) return () => {};
  destination = measurementId;
  window.dataLayer ??= [];
  // Match Google's command queue protocol, including its Arguments objects.
  // eslint-disable-next-line prefer-rest-params
  window.gtag ??= function () { window.dataLayer!.push(arguments); };
  return () => { if (destination === measurementId) destination = undefined; };
}

export function trackEvent<K extends keyof AnalyticsEvents>(name: K, params: AnalyticsEvents[K], pagePath?: string): boolean {
  if (!destination || typeof window === "undefined") return false;
  try {
    const path = (pagePath || window.location.pathname).split(/[?#]/)[0];
    if (!path.startsWith("/") || path.startsWith("//")) return false;
    const payload: Record<string, string | number> = {};
    for (const key of allowed[name]) {
      const value = params[key];
      if (typeof value === "string") payload[String(key)] = value.slice(0, 100);
      else if (typeof value === "number" && Number.isFinite(value)) payload[String(key)] = value;
    }
    if (!window.gtag) return false;
    window.gtag("event", name, { ...payload, page_path: path, page_location: window.location.origin + path, send_to: destination });
    return true;
  } catch {
    // Analytics must not change whether the user's action succeeds.
    return false;
  }
}

export function getTrackedLink(href: string, placement: string): { name: "github_click" | "email_click"; params: { link_location: string } } | null {
  try {
    const url = new URL(href, "https://hozorica.com");
    if (url.protocol === "mailto:") return { name: "email_click", params: { link_location: placement } };
    if (["http:", "https:"].includes(url.protocol) && ["github.com", "www.github.com"].includes(url.hostname)) return { name: "github_click", params: { link_location: placement } };
  } catch { /* Ignore invalid links. */ }
  return null;
}
