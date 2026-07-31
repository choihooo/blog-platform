import { generateSitemapOutput, serializeSitemap } from "@blog-platform/seo-engine";

import { getPublishedPosts, getSiteConfig } from "../../lib/content-source";
import { postsToSeoSubjects, siteForSeo } from "../../lib/seo";

export const dynamic = "force-dynamic";

export async function GET() {
  const [site, posts] = await Promise.all([getSiteConfig(), getPublishedPosts()]);
  const seoSite = siteForSeo(site);
  const entries = generateSitemapOutput(seoSite, postsToSeoSubjects(posts, seoSite));
  return new Response(serializeSitemap(entries), {
    headers: { "content-type": "application/xml; charset=utf-8" },
  });
}
