import type { AnalyticsConfig, ExternalConsoleLinks } from "./types.js";

function cleanSiteUrl(siteUrl: string) {
  try {
    return new URL(siteUrl).origin;
  } catch {
    return undefined;
  }
}

export function createExternalConsoleLinks(input: {
  siteUrl: string;
  postSlug?: string;
  config: AnalyticsConfig;
}): ExternalConsoleLinks {
  const origin = cleanSiteUrl(input.siteUrl);
  const disabledReasons: string[] = [];
  if (!origin || !input.postSlug) {
    return { disabledReasons: ["Published post URL is unavailable"] };
  }

  const publicPostUrl = `${origin}/posts/${input.postSlug}`;
  const links: ExternalConsoleLinks = { publicPostUrl, disabledReasons };

  if (input.config.provider === "ga4" && input.config.ga4PropertyId) {
    links.ga4Url = `https://analytics.google.com/analytics/web/#/p${encodeURIComponent(input.config.ga4PropertyId)}/reports/explorer?params=${encodeURIComponent(publicPostUrl)}`;
  } else {
    disabledReasons.push("GA4 property is not configured");
  }

  if (input.config.searchConsoleProperty) {
    links.searchConsoleUrl = `https://search.google.com/search-console/performance/search-analytics?resource_id=${encodeURIComponent(input.config.searchConsoleProperty)}&page=${encodeURIComponent(publicPostUrl)}`;
  } else {
    disabledReasons.push("Search Console property is not configured");
  }

  return links;
}
