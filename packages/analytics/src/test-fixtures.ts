import type { AnalyticsConfig, BlogEvent } from "./types.js";

export const ga4Config: AnalyticsConfig = {
  provider: "ga4",
  measurementId: "G-TEST",
  ga4PropertyId: "123",
  searchConsoleProperty: "sc-domain:example.com",
};

export const gtmConfig: AnalyticsConfig = {
  provider: "gtm",
  containerId: "GTM-TEST",
};

export const disabledConfig: AnalyticsConfig = { provider: "disabled" };

export const sampleEvent: BlogEvent = {
  name: "article_view",
  slug: "hello-world",
  title: "Hello World",
  url: "https://example.com/posts/hello-world",
  category: "engineering",
  tags: ["mdx"],
  target: "post",
  occurredAt: "2026-07-30T00:00:00.000Z",
  provider: "ga4",
};
