import { getPublishedPosts, getSiteConfig } from "../../lib/content";

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export async function GET() {
  const [site, posts] = await Promise.all([getSiteConfig(), getPublishedPosts()]);
  const items = posts
    .map(
      (post) => `<item>
  <title>${escapeXml(post.title)}</title>
  <link>${site.siteUrl}/posts/${post.slug}</link>
  <guid>${site.siteUrl}/posts/${post.slug}</guid>
  <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>
  ${post.excerpt ? `<description>${escapeXml(post.excerpt)}</description>` : ""}
</item>`,
    )
    .join("\n");
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
<title>${escapeXml(site.siteName)}</title>
<link>${site.siteUrl}</link>
${items}
</channel>
</rss>
`,
    { headers: { "content-type": "application/rss+xml; charset=utf-8" } },
  );
}
