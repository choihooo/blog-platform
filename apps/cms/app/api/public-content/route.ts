import { createContentAdapter } from "@blog-platform/core/storage";
import type { CategoryRecord } from "@blog-platform/core/content";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const cacheHeaders = {
  "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
};

function positiveInteger(value: string | null, fallback: number, maximum: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return Math.min(maximum, Math.floor(parsed));
}

function optionalParam(value: string | null) {
  const normalized = value?.trim();
  return normalized || undefined;
}

function publicCategory(category: CategoryRecord) {
  return {
    slug: category.slug,
    label: category.name,
    depth: category.depth,
    parentSlug: category.parentSlug ?? undefined,
  };
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const adapter = createContentAdapter();
  const slug = optionalParam(url.searchParams.get("slug"));

  if (slug) {
    const result = await adapter.getPostBySlug(slug);
    if (!result.ok) return Response.json({ error: "upstream_failure" }, { status: 502 });
    if (!result.data || !result.data.isPublished) {
      return Response.json({ error: "not_found" }, { status: 404 });
    }
    return Response.json({ post: result.data }, { headers: cacheHeaders });
  }

  const result = await adapter.listPosts({
    publishedOnly: true,
    page: positiveInteger(url.searchParams.get("page"), 1, Number.MAX_SAFE_INTEGER),
    limit: positiveInteger(url.searchParams.get("limit"), 100, 100),
    tagSlug: optionalParam(url.searchParams.get("tag")),
    categoryPath: optionalParam(url.searchParams.get("category")),
    query: optionalParam(url.searchParams.get("query")),
    includeTotal: true,
    includeTags: true,
    includeMedia: true,
  });
  const [parentCategories, childCategories] = await Promise.all([
    adapter.listCategories({ depth: 1 }),
    adapter.listCategories({ depth: 2 }),
  ]);

  if (!result.ok || !parentCategories.ok || !childCategories.ok) {
    return Response.json({ error: "upstream_failure" }, { status: 502 });
  }

  return Response.json(
    {
      posts: result.data.items,
      total: result.data.total,
      categories: [
        ...parentCategories.data.items.map(publicCategory),
        ...childCategories.data.items.map(publicCategory),
      ],
    },
    { headers: cacheHeaders },
  );
}
