import { generateFeedOutput, serializeFeed } from "@blog-platform/seo-engine";

import { getPublishedPosts, getSiteConfig } from "../../lib/content";
import { postsToSeoSubjects, siteForSeo } from "../../lib/seo";

export async function GET() {
  const [site, posts] = await Promise.all([getSiteConfig(), getPublishedPosts()]);
  const seoSite = siteForSeo(site);
  const output = generateFeedOutput(seoSite, postsToSeoSubjects(posts, seoSite));
  return new Response(serializeFeed(output), {
    headers: { "content-type": "application/rss+xml; charset=utf-8" },
  });
}
