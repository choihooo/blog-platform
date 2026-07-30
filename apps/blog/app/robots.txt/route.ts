import { generateRobotsPolicy, serializeRobots } from "@blog-platform/seo-engine";

import { getSiteConfig } from "../../lib/content-source";
import { siteForSeo } from "../../lib/seo";

export async function GET() {
  const site = await getSiteConfig();
  return new Response(serializeRobots(generateRobotsPolicy(siteForSeo(site))), {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
