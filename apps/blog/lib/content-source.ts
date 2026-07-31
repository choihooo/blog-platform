import type { Category, Tag } from "@blog-platform/markdown";
import { analyzeMdx } from "@blog-platform/markdown";

import type { PublicPost } from "./content";
import { toDualRunComparable as toDualRunComparableContent } from "./content";
import type { PostRecord } from "../../cms/lib/content-adapter/content-adapter.interface";
import { createContentAdapter } from "../../cms/lib/content-adapter/content-adapter";
import { loadSiteConfig } from "../../cms/lib/site-config";

export type { PublicPost } from "./content";

export type ContentSourceMode = "d1r2";

export type ContentFailureCode =
  | "validation-failure"
  | "auth-required"
  | "forbidden"
  | "not-found"
  | "conflict"
  | "upstream-failure"
  | "storage-failure"
  | "retryable-failure";

export type ContentFailure = {
  code: ContentFailureCode;
  message: string;
  retryable: boolean;
};

export type ContentSourceResult<T> =
  { success: true; data: T } | { success: false; error: ContentFailure };

export type ContentListInput = {
  publishedOnly?: boolean;
  page?: number;
  limit?: number;
  tagSlug?: string;
  categoryPath?: string;
  query?: string;
};

export type CategoryHierarchy = Category & {
  depth: 1 | 2;
  parentSlug?: string | null;
};

export type CategoryListInput = {
  depth: 1 | 2;
  parentSlug?: string;
};

export interface BlogContentSource {
  readonly mode: ContentSourceMode;
  listPosts(input?: ContentListInput): Promise<PublicPost[]>;
  getPostBySlug(slug: string): Promise<PublicPost | undefined>;
  getPostsByTag(tagSlug: string, input?: Omit<ContentListInput, "tagSlug">): Promise<PublicPost[]>;
  getPostsByCategoryPath(
    categoryPath: string,
    input?: Omit<ContentListInput, "categoryPath">,
  ): Promise<PublicPost[]>;
  listCategories(input: CategoryListInput): Promise<CategoryHierarchy[]>;
  getCategoryByPath(path: string): Promise<CategoryHierarchy | undefined>;
  getSiteConfig(): Promise<{
    siteName: string;
    siteUrl: string;
    defaultAuthor: string;
    adminGithubLogin: string;
    adminGithubUserId: string;
    github: { owner: string; repo: string; branch: string };
    analytics: { provider: string; ga4PropertyId?: string; searchConsoleProperty?: string };
    features: { aiAssistant: boolean; internalLinkSuggestions: boolean };
  }>;
}

const CATEGORY_PATH_RE = /^([a-z0-9-]+)(?:\/([a-z0-9-]+))?$/;

type PostRecordWithTags = PostRecord & {
  tags?: string[];
};

function normalizeTagInput(tags: string[] | undefined) {
  return [...new Set((tags ?? []).map((tag) => tag.trim().toLowerCase()).filter(Boolean))].sort();
}

function labelFromSlug(slug: string) {
  return slug
    .split("/")
    .at(-1)!
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function toPublicSourcePost(
  post: PostRecordWithTags,
  options?: { tagSlugs?: string[] },
): PublicPost {
  const normalizedSlug = post.slug.trim().toLowerCase();
  const categoryPath = post.categoryPath ?? null;
  const requestedTags = normalizeTagInput(post.tags ?? options?.tagSlugs);
  const isPublished = post.isPublished === 1;
  const fallbackBody = post.content ?? "";
  const analysis = analyzeMdx({ path: `db/posts/${normalizedSlug}.md`, source: fallbackBody });
  const toc = analysis.success && analysis.data ? analysis.data.toc : [];
  const readingTimeLabel =
    analysis.success && analysis.data
      ? analysis.data.readingTime.label
      : `${Math.max(1, Math.ceil(fallbackBody.length / 1000))} min read`;
  const finalBody =
    analysis.success && analysis.data
      ? analysis.data.body
      : fallbackBody
        ? fallbackBody
        : `# ${post.title}`;
  const heroMedia =
    post.mediaRefs?.find((media) => media.kind === "hero") ??
    post.mediaRefs?.find((media) => media.kind === "og");
  const coverImage = heroMedia?.r2Url ?? heroMedia?.r2Key ?? post.heroImageKey ?? undefined;

  return {
    path: `db/posts/${normalizedSlug}`,
    status: "published",
    title: post.title,
    slug: normalizedSlug,
    author: "db",
    publishedAt: post.publishedAt ?? "",
    updatedAt: post.updatedAt,
    excerpt: post.summary,
    coverImage,
    body: finalBody,
    toc,
    tags: requestedTags,
    tagEntries: requestedTags.map((tag) => ({ slug: tag, label: labelFromSlug(tag) })),
    category: categoryPath ?? undefined,
    categoryEntry: categoryPath
      ? {
          slug: categoryPath,
          label: labelFromSlug(categoryPath),
          description: undefined,
        }
      : undefined,
    authorProfile: undefined,
    readingTimeLabel,
  };
}

function normalizePage(input?: number) {
  const page = input ? Number(input) : 1;
  if (!Number.isFinite(page) || page < 1) return 1;
  return Math.floor(page);
}

function normalizeLimit(input?: number) {
  const limit = input ? Number(input) : 20;
  if (!Number.isFinite(limit) || limit < 1) return 20;
  return Math.min(100, Math.floor(limit));
}

function normalizeCategoryPath(path: string): string | undefined {
  const normalized = path.trim().replace(/^\/+|\/+$/g, "");
  if (!CATEGORY_PATH_RE.test(normalized)) return;
  const parts = normalized.split("/");
  if (parts.length < 1 || parts.length > 2) return;
  if (parts.some((part) => !part)) return;
  return parts.join("/");
}

function normalizeSlug(value: string) {
  return value.trim().toLowerCase();
}

function sortByPathSlug(a: CategoryHierarchy, b: CategoryHierarchy) {
  return a.slug.localeCompare(b.slug);
}

function resolveModeFromEnv(): ContentSourceMode {
  return "d1r2";
}

function createD1R2Source(): BlogContentSource {
  const adapter = createContentAdapter("d1r2");

  async function listCategoriesFromD1(input: CategoryListInput) {
    const result = await adapter.listCategories({
      depth: input.depth,
      parentSlug: input.parentSlug,
    });
    if (!result.ok) return [];
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

  async function listPostsFromD1(input: ContentListInput = {}): Promise<PublicPost[]> {
    const result = await adapter.listPosts({
      publishedOnly: input.publishedOnly ?? true,
      page: normalizePage(input.page),
      limit: normalizeLimit(input.limit),
      tagSlug: input.tagSlug,
      categoryPath: input.categoryPath,
      query: input.query,
    });
    if (!result.ok) return [];

    return Promise.all(result.data.items.map((post) => toPublicSourcePost(post)));
  }

  async function getPostsByTagFromD1(input: {
    tagSlug: string;
    page?: number;
    limit?: number;
    publishedOnly?: boolean;
  }): Promise<PublicPost[]> {
    const normalizedTag = normalizeSlug(input.tagSlug);
    const result = await adapter.getPostsByTag({
      tagSlug: normalizedTag,
      publishedOnly: input.publishedOnly ?? true,
      page: normalizePage(input.page),
      limit: normalizeLimit(input.limit),
    });
    if (!result.ok) return [];

    return Promise.all(result.data.items.map((post) => toPublicSourcePost(post)));
  }

  async function getPostsByCategoryPathFromD1(input: {
    categoryPath: string;
    page?: number;
    limit?: number;
    publishedOnly?: boolean;
  }): Promise<PublicPost[]> {
    const categoryPath = normalizeCategoryPath(input.categoryPath);
    if (!categoryPath) return [];
    const result = await adapter.getPostsByCategoryPath({
      categoryPath,
      publishedOnly: input.publishedOnly ?? true,
      page: normalizePage(input.page),
      limit: normalizeLimit(input.limit),
    });
    if (!result.ok) return [];

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

  async function getPostBySlugFromD1(slug: string): Promise<PublicPost | undefined> {
    const normalized = normalizeSlug(slug);
    if (!normalized) return;
    const result = await adapter.getPostBySlug(normalized);
    if (!result.ok || !result.data) return;
    return toPublicSourcePost(result.data);
  }

  return {
    mode: "d1r2",
    listPosts: listPostsFromD1,
    getPostBySlug: getPostBySlugFromD1,
    getPostsByTag: (slug: string, input: Omit<ContentListInput, "tagSlug"> = {}) =>
      getPostsByTagFromD1({
        tagSlug: slug,
        publishedOnly: input.publishedOnly ?? true,
        page: input.page,
        limit: input.limit,
      }),
    getPostsByCategoryPath: (
      categoryPath: string,
      input: Omit<ContentListInput, "categoryPath"> = {},
    ) =>
      getPostsByCategoryPathFromD1({
        categoryPath,
        publishedOnly: input.publishedOnly ?? true,
        page: input.page,
        limit: input.limit,
      }),
    listCategories: listCategoriesFromD1,
    getCategoryByPath: getCategoryByPathFromD1,
    getSiteConfig: loadSiteConfig,
  };
}

export function getContentSourceMode(): ContentSourceMode {
  return resolveModeFromEnv();
}

export async function getContentSource(
  _mode: ContentSourceMode = getContentSourceMode(),
): Promise<BlogContentSource> {
  return createD1R2Source();
}

export async function getPublishedPosts(input: ContentListInput = {}): Promise<PublicPost[]> {
  const source = await getContentSource();
  return source.listPosts({ ...input, publishedOnly: true, page: input.page, limit: input.limit });
}

export async function searchPosts(input: {
  query: string;
  categoryPath?: string;
  page?: number;
  limit?: number;
}): Promise<PublicPost[]> {
  const source = await getContentSource();
  return source.listPosts({
    publishedOnly: true,
    page: input.page,
    limit: input.limit,
    categoryPath: input.categoryPath,
    query: input.query,
  });
}

export async function getPostBySlug(slug: string): Promise<PublicPost | undefined> {
  const source = await getContentSource();
  return source.getPostBySlug(slug);
}

export async function getRecommendedPosts(post: PublicPost, limit = 3): Promise<PublicPost[]> {
  const posts = await getPublishedPosts({ limit: 100 });
  const currentTags = new Set(post.tags ?? []);

  return posts
    .filter((candidate) => candidate.slug !== post.slug)
    .map((candidate) => {
      const sharedTagCount = (candidate.tags ?? []).filter((tag) => currentTags.has(tag)).length;
      const sameCategory = candidate.category && candidate.category === post.category ? 4 : 0;

      return {
        post: candidate,
        score: sameCategory + sharedTagCount * 2,
      };
    })
    .sort((left, right) => {
      if (right.score !== left.score) return right.score - left.score;
      return right.post.publishedAt.localeCompare(left.post.publishedAt);
    })
    .slice(0, limit)
    .map((item) => item.post);
}

export async function getPostsByCategory(categoryPath: string): Promise<PublicPost[]> {
  const source = await getContentSource();
  return source.getPostsByCategoryPath(categoryPath);
}

export async function getPostsByCategoryPath(
  categoryPath: string,
  input: Omit<ContentListInput, "categoryPath"> = {},
): Promise<PublicPost[]> {
  const source = await getContentSource();
  return source.getPostsByCategoryPath(categoryPath, input);
}

export async function getPostsByTag(
  slug: string,
  input: Omit<ContentListInput, "tagSlug"> = {},
): Promise<PublicPost[]> {
  const source = await getContentSource();
  return source.getPostsByTag(slug, input);
}

export async function getTag(slug: string) {
  const tags = await getTags();
  return tags.find((tag) => tag.slug === normalizeSlug(slug));
}

export async function listCategories(input: CategoryListInput): Promise<CategoryHierarchy[]> {
  const source = await getContentSource();
  return source.listCategories(input);
}

export async function getContentCollection() {
  const [posts, categories, tags, site] = await Promise.all([
    getPublishedPosts({ limit: 100 }),
    Promise.all([listCategories({ depth: 1 }), listCategories({ depth: 2 })]).then((groups) =>
      groups.flat(),
    ),
    getTags(),
    loadSiteConfig(),
  ]);
  return {
    posts,
    authors: [],
    categories,
    tags,
    site,
  };
}

export async function getCategory(path: string): Promise<CategoryHierarchy | undefined> {
  const source = await getContentSource();
  return source.getCategoryByPath(path);
}

export async function getTags(): Promise<Tag[]> {
  const posts = await getPublishedPosts({ limit: 100 });
  const tagMap = new Map<string, Tag>();
  for (const post of posts) {
    for (const tag of post.tagEntries ?? []) {
      tagMap.set(tag.slug, tag);
    }
    for (const slug of post.tags ?? []) {
      if (!tagMap.has(slug)) {
        tagMap.set(slug, { slug, label: labelFromSlug(slug) });
      }
    }
  }
  return [...tagMap.values()].sort((a, b) => a.slug.localeCompare(b.slug));
}

export async function getCategoryByPath(path: string): Promise<CategoryHierarchy | undefined> {
  const source = await getContentSource();
  return source.getCategoryByPath(path);
}

export function normalizeForDualRunCompare(post: PublicPost) {
  return toDualRunComparableContent(post);
}

export { loadSiteConfig as getSiteConfig } from "../../cms/lib/site-config";
