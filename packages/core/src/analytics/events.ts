import { providerFrom } from "./provider.js";
import type { AnalyticsConfig, BlogEvent, BlogEventName, ProviderPayload } from "./types.js";

const eventNames = new Set<BlogEventName>([
  "article_view",
  "scroll_50",
  "scroll_90",
  "code_copy",
  "toc_click",
  "internal_link_click",
  "external_link_click",
  "search",
  "share",
  "search_result_click",
  "recommended_post_click",
  "post_card_click",
  "category_click",
  "tag_click",
]);

export function createBlogEvent(
  input: Omit<BlogEvent, "provider"> & { provider: string },
): BlogEvent | undefined {
  const provider = providerFrom(input.provider);
  if (provider === "disabled") return undefined;
  if (!eventNames.has(input.name) || !input.slug || !input.url) return undefined;
  if (input.name === "search" && !input.target?.trim()) return undefined;
  return {
    name: input.name,
    slug: input.slug,
    title: input.title,
    url: input.url,
    category: input.category,
    tags: input.tags ?? [],
    target: input.target?.trim(),
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
        title: event.title ?? "",
        url: event.url,
        category: event.category ?? "",
        tags: event.tags ?? [],
        target: event.target ?? "",
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
        title: event.title ?? "",
        url: event.url,
        category: event.category ?? "",
        tags: event.tags ?? [],
        target: event.target ?? "",
      },
    };
  }
  return { ok: false, provider: "disabled", reason: "Analytics provider is disabled" };
}
