import { createBlogEvent, initializeProvider, toProviderPayload } from "@blog-platform/analytics";

export function analyticsConfig(site: { analytics?: { provider?: string } }) {
  return {
    provider: site.analytics?.provider ?? "disabled",
    measurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
    containerId: process.env.NEXT_PUBLIC_GTM_ID,
  };
}

export function analyticsInit(site: { analytics?: { provider?: string } }) {
  return initializeProvider(analyticsConfig(site));
}

export function publishedPostEvent(input: {
  provider: string;
  slug: string;
  url: string;
  category?: string;
  tags?: string[];
}) {
  const event = createBlogEvent({
    name: "page_view",
    slug: input.slug,
    url: input.url,
    category: input.category,
    tags: input.tags,
    occurredAt: new Date().toISOString(),
    provider: input.provider,
  });
  return toProviderPayload(event, analyticsConfig({ analytics: { provider: input.provider } }));
}
