import { generateFeedOutput, serializeFeed } from "@blog-platform/seo-engine";

import { getPublishedPosts, getSiteConfig } from "../../lib/content-source";
import { postsToSeoSubjects, siteForSeo } from "../../lib/seo";

export const revalidate = 900;

export async function GET() {
  const [site, posts] = await Promise.all([
    getSiteConfig(),
    getPublishedPosts({ includeTotal: false, includeMedia: false, analyzeBody: false }),
  ]);
  const seoSite = siteForSeo(site);
  const output = generateFeedOutput(seoSite, postsToSeoSubjects(posts, seoSite));
  return new Response(serializeFeed(output), {
    headers: { "content-type": "application/rss+xml; charset=utf-8" },
  });
}
