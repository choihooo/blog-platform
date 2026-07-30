import { createOgImagePayload } from "@blog-platform/seo-engine";

import { getPostBySlug, getSiteConfig } from "../../../lib/content-source";
import { postToSeoSubject, siteForSeo } from "../../../lib/seo";

function escapeXml(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function titleLines(title: string) {
  const words = title.split(/\s+/);
  const lines: string[] = [];
  for (const word of words) {
    const last = lines.at(-1);
    if (last && `${last} ${word}`.length <= 30) lines[lines.length - 1] = `${last} ${word}`;
    else lines.push(word);
  }
  return lines.slice(0, 3);
}

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [post, site] = await Promise.all([getPostBySlug(slug), getSiteConfig()]);
  if (!post) return new Response("Not found", { status: 404 });
  const payload = createOgImagePayload(postToSeoSubject(post, siteForSeo(site)));
  const category = payload.category ? escapeXml(payload.category) : "";
  const lines = titleLines(payload.title);
  const cover = payload.coverImage ? escapeXml(payload.coverImage) : "";
  return new Response(
    `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <rect width="1200" height="630" fill="#111827"/>
  ${cover ? `<image href="${cover}" x="760" y="0" width="440" height="630" preserveAspectRatio="xMidYMid slice" opacity="0.42"/>` : ""}
  <text x="80" y="120" fill="#93c5fd" font-size="32" font-family="Arial, sans-serif">${category}</text>
  <text x="80" y="250" fill="#f9fafb" font-size="64" font-family="Arial, sans-serif">
${lines.map((line, index) => `    <tspan x="80" dy="${index === 0 ? 0 : 78}">${escapeXml(line)}</tspan>`).join("\n")}
  </text>
  <text x="80" y="540" fill="#d1d5db" font-size="34" font-family="Arial, sans-serif">${escapeXml(payload.siteName)}</text>
</svg>`,
    { headers: { "content-type": "image/svg+xml; charset=utf-8" } },
  );
}
