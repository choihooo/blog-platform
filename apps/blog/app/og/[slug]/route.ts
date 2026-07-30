import { getPostBySlug } from "../../../lib/content";

function escapeXml(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return new Response("Not found", { status: 404 });
  const title = escapeXml(post.title);
  return new Response(
    `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <rect width="1200" height="630" fill="#111827"/>
  <text x="80" y="320" fill="#f9fafb" font-size="72" font-family="Arial, sans-serif">${title}</text>
</svg>`,
    { headers: { "content-type": "image/svg+xml; charset=utf-8" } },
  );
}
