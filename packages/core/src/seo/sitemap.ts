import { escapeXml } from "./feed.js";
import { contentHomeUrl, homeEntry, publicPostUrl } from "./subject.js";
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
      add({ loc: `${contentHomeUrl(site)}/categories/${subject.category.slug}` });
    for (const tag of subject.tags) add({ loc: `${contentHomeUrl(site)}/tags/${tag.slug}` });
  }
  return entries;
}

export function serializeSitemap(entries: SitemapEntry[]) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    (entry) =>
      `<url><loc>${escapeXml(entry.loc)}</loc>${entry.lastModified ? `<lastmod>${escapeXml(entry.lastModified)}</lastmod>` : ""}</url>`,
  )
  .join("\n")}
</urlset>
`;
}
