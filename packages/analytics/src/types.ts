export type AnalyticsProvider = "ga4" | "gtm" | "disabled";

export type AnalyticsConfig = {
  provider: AnalyticsProvider | string;
  measurementId?: string;
  containerId?: string;
  ga4PropertyId?: string;
  searchConsoleProperty?: string;
};

export type BlogEventName =
  "page_view" | "post_read" | "heading_navigate" | "external_link_click" | "share_attempt";

export type BlogEvent = {
  name: BlogEventName;
  slug: string;
  url: string;
  category?: string;
  tags?: string[];
  occurredAt: string;
  provider: AnalyticsProvider;
};

export type ProviderPayload =
  | { ok: true; provider: "ga4"; event: string; params: Record<string, string | string[]> }
  | { ok: true; provider: "gtm"; dataLayer: Record<string, string | string[]> }
  | { ok: false; provider: "disabled"; reason: string };

export type ProviderInit =
  | { ok: true; provider: "ga4"; measurementId: string }
  | { ok: true; provider: "gtm"; containerId: string }
  | { ok: false; provider: "disabled"; reason: string };

export type ExternalConsoleLinks = {
  publicPostUrl?: string;
  ga4Url?: string;
  searchConsoleUrl?: string;
  disabledReasons: string[];
};
