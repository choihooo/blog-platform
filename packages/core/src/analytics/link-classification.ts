import type { LinkClassification } from "./types.js";

export function classifyLink(href: string | undefined, siteUrl: string): LinkClassification {
  if (!href) return { kind: "ignored", url: "", reason: "Missing href" };
  if (href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
    return { kind: "ignored", url: href, reason: "Unsupported href" };
  }
  try {
    const site = new URL(siteUrl);
    const url = new URL(href, site.origin);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return { kind: "ignored", url: href, reason: "Unsupported protocol" };
    }
    return url.origin === site.origin
      ? { kind: "internal", url: url.toString() }
      : { kind: "external", url: url.toString() };
  } catch {
    return { kind: "ignored", url: href, reason: "Invalid URL" };
  }
}
