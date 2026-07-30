import { publicPostUrl, trimSlash } from "./subject.js";
import type { FeedOutput, SeoSite, SeoSubject } from "./types.js";

export function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function generateFeedOutput(site: SeoSite, subjects: SeoSubject[]): FeedOutput {
  const items = subjects
    .filter((subject) => subject.status === "published" && subject.slug && subject.title)
    .sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""))
    .map((subject) => {
      const link = publicPostUrl(site, subject.slug ?? "");
      return {
        title: subject.title ?? "",
        link,
        guid: link,
        pubDate: new Date(subject.publishedAt ?? subject.updatedAt ?? 0).toUTCString(),
        description: subject.excerpt,
      };
    });
  return { title: site.siteName, link: trimSlash(site.siteUrl), items };
}

export function serializeFeed(output: FeedOutput) {
  const items = output.items
    .map(
      (item) => `<item>
  <title>${escapeXml(item.title)}</title>
  <link>${escapeXml(item.link)}</link>
  <guid>${escapeXml(item.guid)}</guid>
  <pubDate>${escapeXml(item.pubDate)}</pubDate>
  ${item.description ? `<description>${escapeXml(item.description)}</description>` : ""}
</item>`,
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
<title>${escapeXml(output.title)}</title>
<link>${escapeXml(output.link)}</link>
${items}
</channel>
</rss>
`;
}
