import type { AnalyticsConfig, AnalyticsProvider, ProviderInit } from "./types.js";

export function providerFrom(value: string | undefined): AnalyticsProvider {
  if (value === "ga4" || value === "gtm") return value;
  return "disabled";
}

export function initializeProvider(config: AnalyticsConfig): ProviderInit {
  const provider = providerFrom(config.provider);
  if (provider === "ga4") {
    return config.measurementId
      ? { ok: true, provider, measurementId: config.measurementId }
      : { ok: false, provider: "disabled", reason: "GA4 measurement id is missing" };
  }
  if (provider === "gtm") {
    return config.containerId
      ? { ok: true, provider, containerId: config.containerId }
      : { ok: false, provider: "disabled", reason: "GTM container id is missing" };
  }
  return { ok: false, provider: "disabled", reason: "Analytics provider is disabled" };
}
