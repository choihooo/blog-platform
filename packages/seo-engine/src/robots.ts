import { trimSlash } from "./subject.js";
import type { RobotsPolicy, SeoSite } from "./types.js";

export function generateRobotsPolicy(site: SeoSite): RobotsPolicy {
  return {
    lines: [
      "User-agent: *",
      "Allow: /",
      "Disallow: /cms",
      "Disallow: /preview",
      `Sitemap: ${trimSlash(site.siteUrl)}/sitemap.xml`,
    ],
  };
}

export function serializeRobots(policy: RobotsPolicy) {
  return `${policy.lines.join("\n")}\n`;
}
