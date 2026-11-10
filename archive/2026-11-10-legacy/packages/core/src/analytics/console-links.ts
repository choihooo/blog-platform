import type { AnalyticsConfig, DashboardConsoleLinks, ExternalConsoleLinks } from "./types.js";

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
  postStatus?: string;
  config: AnalyticsConfig;
}): ExternalConsoleLinks {
  const origin = cleanSiteUrl(input.siteUrl);
  const disabledReasons: string[] = [];
  if (input.postStatus && input.postStatus !== "published") {
    return { disabledReasons: ["Only published posts have public analytics links"] };
  }
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

export function createDashboardConsoleLinks(config: AnalyticsConfig): DashboardConsoleLinks {
  const links: DashboardConsoleLinks = { disabledReasons: [] };

  if (config.provider === "ga4" && config.ga4PropertyId) {
    links.ga4Url = `https://analytics.google.com/analytics/web/#/p${encodeURIComponent(
      config.ga4PropertyId,
    )}/reports/intelligenthome`;
  } else {
    links.disabledReasons.push("GA4 property is not configured");
  }

  if (config.searchConsoleProperty) {
    links.searchConsoleUrl = `https://search.google.com/search-console?resource_id=${encodeURIComponent(
      config.searchConsoleProperty,
    )}`;
  } else {
    links.disabledReasons.push("Search Console property is not configured");
  }

  return links;
}
