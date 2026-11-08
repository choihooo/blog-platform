import { searchPublicPosts } from "@/features/blog/server/search-service";

const searchCacheHeaders = {
  "cache-control": "public, s-maxage=60, stale-while-revalidate=300",
};

function firstSearchParam(url: URL, key: string) {
  return url.searchParams.get(key)?.trim() ?? "";
}

function normalizePage(value: string) {
  const page = Number(value);
  return Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
}

function normalizeLimit(value: string) {
  const limit = Number(value);
  if (!Number.isFinite(limit) || limit <= 0) return 20;
  return Math.min(100, Math.floor(limit));
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = firstSearchParam(url, "q");
  const categoryPath = firstSearchParam(url, "category") || undefined;
  const page = normalizePage(firstSearchParam(url, "page"));
  const limit = normalizeLimit(firstSearchParam(url, "limit"));

  if (!query) {
    return Response.json({ items: [], total: 0, query: "" }, { headers: searchCacheHeaders });
  }

  const result = await searchPublicPosts({ query, categoryPath, page, limit });
  return Response.json(result, { headers: searchCacheHeaders });
}
