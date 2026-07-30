import { getPublishedPosts, getSiteConfig } from "../../lib/content";

export async function GET() {
  const [site, posts] = await Promise.all([getSiteConfig(), getPublishedPosts()]);
  const urls = [
    site.siteUrl,
    ...posts.map((post) => `${site.siteUrl}/posts/${post.slug}`),
    ...new Set(
      posts.flatMap((post) =>
        post.category ? [`${site.siteUrl}/categories/${post.category}`] : [],
      ),
    ),
    ...new Set(
      posts.flatMap((post) => post.tags?.map((tag) => `${site.siteUrl}/tags/${tag}`) ?? []),
    ),
  ];
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `<url><loc>${url}</loc></url>`).join("\n")}
</urlset>
`,
    { headers: { "content-type": "application/xml; charset=utf-8" } },
  );
}
