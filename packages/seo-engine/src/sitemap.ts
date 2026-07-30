import { homeEntry, publicPostUrl, trimSlash } from "./subject.js";
import type { SeoSite, SeoSubject, SitemapEntry } from "./types.js";

export function generateSitemapOutput(site: SeoSite, subjects: SeoSubject[]): SitemapEntry[] {
  const entries = [homeEntry(site)];
  const seen = new Set(entries.map((entry) => entry.loc));
  const add = (entry: SitemapEntry) => {
    if (!seen.has(entry.loc)) {
      seen.add(entry.loc);
      entries.push(entry);
    }
  };

  for (const subject of subjects.filter((item) => item.status === "published" && item.slug)) {
    add({
      loc: publicPostUrl(site, subject.slug ?? ""),
      lastModified: subject.updatedAt ?? subject.publishedAt,
    });
    if (subject.category)
      add({ loc: `${trimSlash(site.siteUrl)}/categories/${subject.category.slug}` });
    for (const tag of subject.tags) add({ loc: `${trimSlash(site.siteUrl)}/tags/${tag.slug}` });
  }
  return entries;
}

export function serializeSitemap(entries: SitemapEntry[]) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    (entry) =>
      `<url><loc>${entry.loc}</loc>${entry.lastModified ? `<lastmod>${entry.lastModified}</lastmod>` : ""}</url>`,
  )
  .join("\n")}
</urlset>
`;
}
