import { createBlogEvent, initializeProvider, toProviderPayload } from "@blog-platform/analytics";
import type { AnalyticsConfig, BlogEventName } from "@blog-platform/analytics";

export function analyticsConfig(site: { analytics?: { provider?: string } }) {
  return {
    provider: site.analytics?.provider ?? "disabled",
    measurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
    containerId: process.env.NEXT_PUBLIC_GTM_ID,
  } satisfies AnalyticsConfig;
}

export function analyticsInit(site: { analytics?: { provider?: string } }) {
  return initializeProvider(analyticsConfig(site));
}

export function publishedPostEvent(input: {
  name?: BlogEventName;
  provider: string;
  slug: string;
  title?: string;
  url: string;
  category?: string;
  tags?: string[];
  target?: string;
}) {
  const event = createBlogEvent({
    name: input.name ?? "article_view",
    slug: input.slug,
    title: input.title,
    url: input.url,
    category: input.category,
    tags: input.tags,
    target: input.target,
    occurredAt: new Date().toISOString(),
    provider: input.provider,
  });
  return toProviderPayload(event, analyticsConfig({ analytics: { provider: input.provider } }));
}
