import { generateSitemapOutput, serializeSitemap, trimSlash } from "@blog-platform/seo-engine";

import { getPublishedPosts, getSiteConfig } from "../../lib/content-source";
import { postsToSeoSubjects, siteForSeo } from "../../lib/seo";

export const revalidate = 900;

export async function GET() {
  const [site, posts] = await Promise.all([
    getSiteConfig(),
    getPublishedPosts({ includeTotal: false, includeMedia: false, analyzeBody: false }),
  ]);
  const seoSite = siteForSeo(site);
  const entries = generateSitemapOutput(seoSite, postsToSeoSubjects(posts, seoSite));
  entries.push({ loc: `${trimSlash(site.siteUrl)}/tags` });
  return new Response(serializeSitemap(entries), {
    headers: { "content-type": "application/xml; charset=utf-8" },
  });
}
