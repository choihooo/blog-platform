import {
  createEmptyEditorDocument,
  postRecordToEditorDocument,
  type EditorDocument,
} from "@blog-platform/core/content";

import { createContentAdapter } from "@blog-platform/core/storage";
import { loadSiteConfig } from "../site-config";
import type { ContentAdapter, PostRecord } from "@blog-platform/core/content";
import { repositoryRoot } from "./root";

export type PostSummary = {
  path: string;
  slug: string;
  title: string;
  status: string;
  sha: string;
  publishedAt?: string | null;
  updatedAt?: string | null;
};

export type EditorLoadResult =
  | { ok: true; document: EditorDocument }
  | {
      ok: false;
      code: "missing-file" | "unsupported-content" | "unsafe-content" | "invalid-metadata";
      message: string;
      rawSource?: string;
    };

export type EditorSiteAnalyticsConfig = {
  siteUrl: string;
  analytics: {
    provider: string;
    ga4PropertyId?: string;
    searchConsoleProperty?: string;
  };
};

export type EditorCategoryOption = {
  slug: string;
  name: string;
  depth: 1 | 2;
  parentSlug?: string | null;
};

export type ListPostSummariesOptions = {
  query?: string;
  sort?: "published" | "updated";
};

export function slugFromPath(path: string) {
  return path.replace(/^db\/posts\//, "");
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

export function createNewEditorDocument(now = new Date()) {
  return createEmptyEditorDocument(now);
}

export async function loadEditorDocument(
  path: string,
  adapter?: ContentAdapter,
): Promise<EditorLoadResult> {
  const contentAdapter = adapter ?? createContentAdapter();
  const loaded = await contentAdapter.getPostBySlug(slugFromPath(path), {
    includeUnpublished: true,
  });
  if (!loaded.ok) return { ok: false, code: "missing-file", message: loaded.error.message };
  if (!loaded.data) return { ok: false, code: "missing-file", message: "Post not found" };
  return { ok: true, document: postRecordToEditorDocument(loaded.data) };
}

export function pathForSlug(slug: string) {
  return `db/posts/${slug}`;
}

export async function loadEditorSiteAnalyticsConfig(
  root = repositoryRoot(),
): Promise<EditorSiteAnalyticsConfig> {
  const config = await loadSiteConfig(root);

  return {
    siteUrl: config.siteUrl,
    analytics: {
      provider: config.analytics.provider,
      ga4PropertyId: config.analytics.ga4PropertyId,
      searchConsoleProperty: config.analytics.searchConsoleProperty,
    },
  };
}

export async function loadEditorCategories(): Promise<EditorCategoryOption[]> {
  const adapter = createContentAdapter();
  const [depth1, depth2] = await Promise.all([
    adapter.listCategories({ depth: 1 }),
    adapter.listCategories({ depth: 2 }),
  ]);
  const categories = [
    ...(depth1.ok ? depth1.data.items : []),
    ...(depth2.ok ? depth2.data.items : []),
  ];
  return categories
    .map((category) => ({
      slug: category.slug,
      name: category.name,
      depth: category.depth,
      parentSlug: category.parentSlug ?? undefined,
    }))
    .sort((a, b) => a.slug.localeCompare(b.slug));
}
