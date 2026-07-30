export type AnalyticsProvider = "ga4" | "gtm" | "disabled";

export type AnalyticsConfig = {
  provider: AnalyticsProvider | string;
  measurementId?: string;
  containerId?: string;
  ga4PropertyId?: string;
  searchConsoleProperty?: string;
};

export type BlogEventName =
  | "article_view"
  | "scroll_50"
  | "scroll_90"
  | "code_copy"
  | "toc_click"
  | "internal_link_click"
  | "external_link_click"
  | "search"
  | "share";

export type BlogEvent = {
  name: BlogEventName;
  slug: string;
  title?: string;
  url: string;
  category?: string;
  tags?: string[];
  target?: string;
  occurredAt: string;
  provider: AnalyticsProvider;
};

export type ProviderPayload =
  | { ok: true; provider: "ga4"; event: BlogEventName; params: Record<string, string | string[]> }
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

export type LinkClassification =
  { kind: "internal" | "external"; url: string } | { kind: "ignored"; url: string; reason: string };
