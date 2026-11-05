import { unstable_cache } from "next/cache";
import { createContentAdapter } from "../../../../cms/lib/content-adapter/content-adapter";
import { loadSiteConfig } from "../../../../cms/lib/site-config";
import type {
  BlogContentSource,
  CategoryHierarchy,
  CategoryListInput,
  ContentListInput,
} from "./content-source-types";
import {
  normalizeCategoryPath,
  normalizeLimit,
  normalizePage,
  normalizeSlug,
  sortByPathSlug,
  toPublicSourcePost,
} from "./content-source-utils";

export const blogContentCacheTags = {
  posts: "blog-content-posts",
  categories: "blog-content-categories",
} as const;

const CONTENT_CACHE_REVALIDATE_SECONDS = 300;

function cacheContentSourceRead<Args extends unknown[], T>(
  name: string,
  tags: readonly string[],
  fn: (...args: Args) => Promise<T>,
) {
  // Cached values include rendered reading-time labels from the public mapper.
  return unstable_cache(fn, ["blog-content-rich-v1", name], {
    revalidate: CONTENT_CACHE_REVALIDATE_SECONDS,
    tags: [...tags],
  });
}

export async function listCategoriesFromD1(input: CategoryListInput) {
  const adapter = createContentAdapter("d1r2");
  const result = await adapter.listCategories({ depth: input.depth, parentSlug: input.parentSlug });
  if (!result.ok) throw new Error("content_unavailable");
  const depth = input.depth === 1 ? 1 : 2;
  return result.data.items
    .filter((category) => category.depth === depth)
    .filter((category) =>
      input.parentSlug ? category.parentSlug === normalizeCategoryPath(input.parentSlug) : true,
    )
    .map((category) => ({
      slug: category.slug,
      label: category.name,
      description: undefined,
      depth: category.depth,
      parentSlug: category.parentSlug ?? undefined,
    }))
    .sort(sortByPathSlug);
}

export async function listPostsFromD1(input: ContentListInput = {}, strict = false) {
  const result = await listPostPageFromD1(input, strict);
  return result.items;
}

async function listPostPageFromD1(input: ContentListInput = {}, strict = false) {
  const adapter = createContentAdapter("d1r2");
  const result = await adapter.listPosts({
    publishedOnly: input.publishedOnly ?? true,
    page: normalizePage(input.page),
    limit: normalizeLimit(input.limit),
    tagSlug: input.tagSlug,
    categoryPath: input.categoryPath,
    query: input.query,
    includeTotal: input.includeTotal,
    includeTags: input.includeTags,
    includeMedia: input.includeMedia,
  });
  if (!result.ok) {
    if (strict) throw new Error("retrieval_unavailable");
    throw new Error("content_unavailable");
  }
  const items = await Promise.all(
    result.data.items.map((post) => toPublicSourcePost(post, { analyzeBody: input.analyzeBody })),
  );
  return { items, total: result.data.total };
}

async function getPostsByTagFromD1(input: {
  tagSlug: string;
  page?: number;
  limit?: number;
  publishedOnly?: boolean;
}) {
  const adapter = createContentAdapter("d1r2");
  const result = await adapter.getPostsByTag({
    tagSlug: normalizeSlug(input.tagSlug),
    publishedOnly: input.publishedOnly ?? true,
    page: normalizePage(input.page),
    limit: normalizeLimit(input.limit),
  });
  if (!result.ok) throw new Error("content_unavailable");
  return Promise.all(result.data.items.map((post) => toPublicSourcePost(post)));
}

async function getPostsByCategoryPathFromD1(input: {
  categoryPath: string;
  page?: number;
  limit?: number;
  publishedOnly?: boolean;
}) {
  const categoryPath = normalizeCategoryPath(input.categoryPath);
  if (!categoryPath) return [];
  const adapter = createContentAdapter("d1r2");
  const result = await adapter.getPostsByCategoryPath({
    categoryPath,
    publishedOnly: input.publishedOnly ?? true,
    page: normalizePage(input.page),
    limit: normalizeLimit(input.limit),
  });
  if (!result.ok) throw new Error("content_unavailable");
  return Promise.all(result.data.items.map((post) => toPublicSourcePost(post)));
}

async function getCategoryByPathFromD1(path: string): Promise<CategoryHierarchy | undefined> {
  const categoryPath = normalizeCategoryPath(path);
  if (!categoryPath) return;
  const categoryItems = await listCategoriesFromD1({
    depth: categoryPath.includes("/") ? 2 : 1,
    parentSlug: categoryPath.includes("/") ? categoryPath.split("/")[0] : undefined,
  });
  return categoryItems.find((category) => category.slug === categoryPath);
}

async function getPostBySlugFromD1(slug: string, options?: { analyzeBody?: boolean }) {
  const normalized = normalizeSlug(slug);
  if (!normalized) return;
  const adapter = createContentAdapter("d1r2");
  const result = await adapter.getPostBySlug(normalized);
  if (!result.ok) throw new Error("content_unavailable");
  if (!result.data) return;
  return toPublicSourcePost(result.data, { analyzeBody: options?.analyzeBody });
}

const cachedListPosts = cacheContentSourceRead(
  "list-posts",
  [blogContentCacheTags.posts],
  listPostsFromD1,
);
const cachedListPostPage = cacheContentSourceRead(
  "post-page",
  [blogContentCacheTags.posts],
  (input: ContentListInput = {}) => listPostPageFromD1({ ...input, includeTotal: true }),
);
const cachedGetPostBySlug = cacheContentSourceRead(
  "post-by-slug",
  [blogContentCacheTags.posts],
  getPostBySlugFromD1,
);
const cachedGetPostsByTag = cacheContentSourceRead(
  "posts-by-tag",
  [blogContentCacheTags.posts],
  getPostsByTagFromD1,
);
const cachedGetPostsByCategoryPath = cacheContentSourceRead(
  "posts-by-category",
  [blogContentCacheTags.posts],
  getPostsByCategoryPathFromD1,
);
const cachedListCategories = cacheContentSourceRead(
  "list-categories",
  [blogContentCacheTags.categories],
  listCategoriesFromD1,
);
const cachedGetCategoryByPath = cacheContentSourceRead(
  "category-by-path",
  [blogContentCacheTags.categories],
  getCategoryByPathFromD1,
);

export function createD1R2Source(): BlogContentSource {
  return {
    mode: "d1r2",
    listPostPage: cachedListPostPage,
    listPosts: cachedListPosts,
    getPostBySlug: cachedGetPostBySlug,
    getPostsByTag: (slug, input = {}) =>
      cachedGetPostsByTag({
        tagSlug: slug,
        publishedOnly: input.publishedOnly ?? true,
        page: input.page,
        limit: input.limit,
      }),
    getPostsByCategoryPath: (categoryPath, input = {}) =>
      cachedGetPostsByCategoryPath({
        categoryPath,
        publishedOnly: input.publishedOnly ?? true,
        page: input.page,
        limit: input.limit,
      }),
    listCategories: cachedListCategories,
    getCategoryByPath: cachedGetCategoryByPath,
    getSiteConfig: loadSiteConfig,
  };
}
