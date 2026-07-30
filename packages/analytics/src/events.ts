import { providerFrom } from "./provider.js";
import type { AnalyticsConfig, BlogEvent, BlogEventName, ProviderPayload } from "./types.js";

const eventNames = new Set<BlogEventName>([
  "page_view",
  "post_read",
  "heading_navigate",
  "external_link_click",
  "share_attempt",
]);

export function createBlogEvent(
  input: Omit<BlogEvent, "provider"> & { provider: string },
): BlogEvent | undefined {
  const provider = providerFrom(input.provider);
  if (provider === "disabled") return undefined;
  if (!eventNames.has(input.name) || !input.slug || !input.url) return undefined;
  return {
    name: input.name,
    slug: input.slug,
    url: input.url,
    category: input.category,
    tags: input.tags ?? [],
    occurredAt: input.occurredAt,
    provider,
  };
}

export function toProviderPayload(
  event: BlogEvent | undefined,
  config: AnalyticsConfig,
): ProviderPayload {
  if (!event) return { ok: false, provider: "disabled", reason: "No event to send" };
  if (event.provider === "ga4") {
    if (!config.measurementId) {
      return { ok: false, provider: "disabled", reason: "GA4 measurement id is missing" };
    }
    return {
      ok: true,
      provider: "ga4",
      event: event.name,
      params: {
        slug: event.slug,
        url: event.url,
        category: event.category ?? "",
        tags: event.tags ?? [],
      },
    };
  }
  if (event.provider === "gtm") {
    if (!config.containerId) {
      return { ok: false, provider: "disabled", reason: "GTM container id is missing" };
    }
    return {
      ok: true,
      provider: "gtm",
      dataLayer: {
        event: event.name,
        slug: event.slug,
        url: event.url,
        category: event.category ?? "",
        tags: event.tags ?? [],
      },
    };
  }
  return { ok: false, provider: "disabled", reason: "Analytics provider is disabled" };
}
