import { getSiteConfig } from "../../lib/content";

export async function GET() {
  const site = await getSiteConfig();
  return new Response(`User-agent: *\nAllow: /\nSitemap: ${site.siteUrl}/sitemap.xml\n`, {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
