import type { AnalyticsConfig, AnalyticsProvider, ProviderInit } from "./types.js";

export function providerFrom(value: string | undefined): AnalyticsProvider {
  if (value === "ga4" || value === "gtm") return value;
  return "disabled";
}

export function initializeProvider(config: AnalyticsConfig): ProviderInit {
  const provider = providerFrom(config.provider);
  if (provider === "ga4") {
    const measurementId = config.measurementId?.trim();
    return measurementId && /^G-[A-Z0-9]+$/.test(measurementId)
      ? { ok: true, provider, measurementId }
      : { ok: false, provider: "disabled", reason: "GA4 measurement id is missing or invalid" };
  }
  if (provider === "gtm") {
    const containerId = config.containerId?.trim();
    return containerId && /^GTM-[A-Z0-9]+$/.test(containerId)
      ? { ok: true, provider, containerId }
      : { ok: false, provider: "disabled", reason: "GTM container id is missing or invalid" };
  }
  return { ok: false, provider: "disabled", reason: "Analytics provider is disabled" };
}
