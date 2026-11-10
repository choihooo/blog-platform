import type { CategoryRecord } from "@blog-platform/core/content";
import type { ContentAdapter } from "@blog-platform/core/content";

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

export async function queryPublicContent(url: URL, adapter: ContentAdapter) {
  const slug = optionalParam(url.searchParams.get("slug"));

  if (slug) {
    const result = await adapter.getPostBySlug(slug);
    if (!result.ok)
      return { status: 502 as const, body: { error: "upstream_failure" }, headers: undefined };
    if (!result.data || !result.data.isPublished) {
      return { status: 404 as const, body: { error: "not_found" }, headers: undefined };
    }
    return { status: 200 as const, body: { post: result.data }, headers: cacheHeaders };
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
    return { status: 502 as const, body: { error: "upstream_failure" }, headers: undefined };
  }

  return {
    status: 200 as const,
    body: {
      posts: result.data.items,
      total: result.data.total,
      categories: [
        ...parentCategories.data.items.map(publicCategory),
        ...childCategories.data.items.map(publicCategory),
      ],
    },
    headers: cacheHeaders,
  };
}
