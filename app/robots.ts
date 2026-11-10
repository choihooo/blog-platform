import type { MetadataRoute } from "next";
import { getSiteConfig } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const site = getSiteConfig();
  return {
    rules: site.indexable ? { userAgent: "*", allow: "/" } : { userAgent: "*", disallow: "/" },
    ...(site.indexable ? { sitemap: new URL("/sitemap.xml", site.url).href } : {}),
  };
}
