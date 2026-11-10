import type { ContentAdapter, PostRecord } from "@blog-platform/core/content";
import { createContentAdapter } from "@blog-platform/core/storage";
import type { ListPostSummariesOptions, PostSummary } from "../model/post-summary";
function pathForSlug(slug: string) {
  return `db/posts/${slug}`;
}
function normalizeSearchQuery(query?: string) {
  return query?.trim().replace(/\s+/g, " ").toLowerCase();
}

function timestamp(value?: string | null) {
  if (!value) return 0;
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : 0;
}

function sortPostSummaries(posts: PostSummary[], sort: ListPostSummariesOptions["sort"]) {
  const primaryField = sort === "updated" ? "updatedAt" : "publishedAt";
  const secondaryField = sort === "updated" ? "publishedAt" : "updatedAt";
  return [...posts].sort((left, right) => {
    const primary = timestamp(right[primaryField]) - timestamp(left[primaryField]);
    if (primary !== 0) return primary;
    const secondary = timestamp(right[secondaryField]) - timestamp(left[secondaryField]);
    if (secondary !== 0) return secondary;
    return left.slug.localeCompare(right.slug);
  });
}

function statusFromPost(post: PostRecord) {
  if (post.isPublished === 1) return "published";
  return post.publishedAt ? "archived" : "draft";
}

function postToSummary(post: PostRecord): PostSummary {
  return {
    path: pathForSlug(post.slug),
    slug: post.slug,
    title: post.title,
    status: statusFromPost(post),
    sha: `${post.updatedAt}:${post.slug}`,
    publishedAt: post.publishedAt ?? null,
    updatedAt: post.updatedAt,
  };
}

export async function listPostSummaries(
  adapter?: ContentAdapter,
  options: ListPostSummariesOptions = {},
) {
  const contentAdapter = adapter ?? createContentAdapter();
  const query = normalizeSearchQuery(options.query);
  const sort = options.sort === "updated" ? "updated" : "published";
  const listed = await contentAdapter.listPosts({
    publishedOnly: false,
    page: 1,
    limit: 100,
    query,
    includeMedia: false,
    includeTags: false,
  });
  if (!listed.ok) return [];
  return sortPostSummaries(listed.data.items.map(postToSummary), sort);
}
