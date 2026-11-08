import { generateFeedOutput, serializeFeed } from "@blog-platform/core/seo";

import { postsToSeoSubjects, siteForSeo } from "@/features/blog/lib/seo";
import { getPublishedPosts, getSiteConfig } from "@/features/blog/server/content-source";

export const revalidate = 900;

export async function GET() {
  const [site, posts] = await Promise.all([
    getSiteConfig(),
    getPublishedPosts({ limit: 20, includeTotal: false, includeMedia: false, analyzeBody: false }),
  ]);
  const seoSite = siteForSeo(site);
  const output = generateFeedOutput(seoSite, postsToSeoSubjects(posts, seoSite));
  return new Response(serializeFeed(output), {
    headers: { "content-type": "application/rss+xml; charset=utf-8" },
  });
}
