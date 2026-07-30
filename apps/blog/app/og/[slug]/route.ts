import { createOgImagePayload } from "@blog-platform/seo-engine";

import { getPostBySlug, getSiteConfig } from "../../../lib/content";
import { postToSeoSubject, siteForSeo } from "../../../lib/seo";

function escapeXml(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [post, site] = await Promise.all([getPostBySlug(slug), getSiteConfig()]);
  if (!post) return new Response("Not found", { status: 404 });
  const payload = createOgImagePayload(postToSeoSubject(post, siteForSeo(site)));
  const title = escapeXml(payload.title);
  const category = payload.category ? escapeXml(payload.category) : "";
  return new Response(
    `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <rect width="1200" height="630" fill="#111827"/>
  <text x="80" y="120" fill="#93c5fd" font-size="32" font-family="Arial, sans-serif">${category}</text>
  <text x="80" y="300" fill="#f9fafb" font-size="72" font-family="Arial, sans-serif">${title}</text>
  <text x="80" y="540" fill="#d1d5db" font-size="34" font-family="Arial, sans-serif">${escapeXml(payload.siteName)}</text>
</svg>`,
    { headers: { "content-type": "image/svg+xml; charset=utf-8" } },
  );
}
