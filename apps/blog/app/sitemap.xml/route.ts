import { generateSitemapOutput, serializeSitemap, trimSlash } from "@blog-platform/core/seo";

import { postsToSeoSubjects, siteForSeo } from "@/features/blog/lib/seo";
import { getAllPublishedPosts, getSiteConfig } from "@/features/blog/server/content-source";
import { projects } from "@blog-platform/core/content/catalog";

export const revalidate = 900;

export async function GET() {
  const [site, posts] = await Promise.all([
    getSiteConfig(),
    getAllPublishedPosts({ includeMedia: false, analyzeBody: false }),
  ]);
  const seoSite = siteForSeo(site);
  const entries = generateSitemapOutput(seoSite, postsToSeoSubjects(posts, seoSite));
  entries.unshift(
    { loc: trimSlash(site.siteUrl) },
    { loc: `${trimSlash(site.siteUrl)}/projects` },
    ...projects.map((project) => ({
      loc: `${trimSlash(site.siteUrl)}/projects/${project.slug}`,
    })),
    { loc: `${trimSlash(site.siteUrl)}/resume` },
  );
  entries.push({ loc: `${trimSlash(site.siteUrl)}/blog/tags` });
  return new Response(serializeSitemap(entries), {
    headers: { "content-type": "application/xml; charset=utf-8" },
  });
}
