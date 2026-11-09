import { describe, expect, it } from "vitest";

import { bundledSiteConfigFallback } from "./site-config";

describe("loadSiteConfig", () => {
  it("keeps the bundled production URL independent from stale environment fallback values", () => {
    const previousSiteUrl = process.env.SITE_URL;
    process.env.SITE_URL = "https://www.howu.run";
    const config = bundledSiteConfigFallback();
    if (previousSiteUrl === undefined) delete process.env.SITE_URL;
    else process.env.SITE_URL = previousSiteUrl;

    expect(config.siteUrl).toBe("https://hozorica.com");
    expect(config.siteName).toBe("Hozorica");
  });
});
