import type { Category, Tag } from "@blog-platform/markdown";
import { analyzeMdx } from "@blog-platform/markdown";

import type { PublicPost } from "./content";
import { toDualRunComparable as toDualRunComparableContent } from "./content";
import {
  getContentCollection as getLegacyContentCollection,
  getPostBySlug as getLegacyPostBySlug,
  getPostsByCategory as getLegacyPostsByCategory,
  getPostsByTag as getLegacyPostsByTag,
  getPublishedPosts as getLegacyPublishedPosts,
  getSiteConfig,
} from "./content";
import type { PostRecord } from "../../cms/lib/content-adapter/content-adapter.interface";
import { createContentAdapter } from "../../cms/lib/content-adapter/content-adapter";

export type { PublicPost } from "./content";

export type ContentSourceMode = "legacy" | "d1r2";

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

type ContentMetadata = Awaited<ReturnType<typeof getLegacyContentCollection>>;

type PostRecordWithTags = PostRecord & {
  tags?: string[];
};

let contentMetadataPromise: Promise<ContentMetadata> | undefined;
async function getContentMetadata() {
  if (!contentMetadataPromise) {
    contentMetadataPromise = getLegacyContentCollection();
  }
  return contentMetadataPromise;
}

function normalizeTagInput(tags: string[] | undefined) {
  return [...new Set((tags ?? []).map((tag) => tag.trim().toLowerCase()).filter(Boolean))].sort();
}

function toPublicSourcePost(
  post: PostRecordWithTags,
  metadata: ContentMetadata,
  options?: { tagSlugs?: string[] },
): PublicPost {
  const normalizedSlug = post.slug.trim().toLowerCase();
  const categoryPath = post.categoryPath ?? null;
  const requestedTags = normalizeTagInput(post.tags ?? options?.tagSlugs);
  const isPublished = post.isPublished === 1;
  const siteDefaultAuthor = metadata.site.defaultAuthor;
  const fallbackBody = post.content ?? "";
  const analysis = analyzeMdx({ path: `posts/${normalizedSlug}.mdx`, source: fallbackBody });
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

  const categoryEntry = metadata.categories.find((item) => item.slug === categoryPath);

  return {
    path: `posts/${normalizedSlug}.mdx`,
    status: "published",
    title: post.title,
    slug: normalizedSlug,
    author: siteDefaultAuthor,
    publishedAt: post.publishedAt ?? "",
    updatedAt: post.updatedAt,
    excerpt: post.summary,
    coverImage,
    body: finalBody,
    toc,
    tags: requestedTags,
    tagEntries: requestedTags
      .map((tag) => metadata.tags.find((entry) => entry.slug === tag))
      .filter((tag) => tag !== undefined)
      .map((tag) => ({ ...tag })),
    category: categoryPath ?? undefined,
    categoryEntry: categoryEntry
      ? {
          slug: categoryEntry.slug,
          label: categoryEntry.label,
          description: categoryEntry.description,
        }
      : undefined,
    authorProfile: metadata.authors.find((entry) => entry.id === siteDefaultAuthor),
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

function toCategoryHierarchy(category: Category): CategoryHierarchy {
  const parts = category.slug.split("/").filter(Boolean);
  const depth = parts.length > 1 ? 2 : 1;
  return {
    ...category,
    depth: depth as 1 | 2,
    parentSlug: depth === 2 ? (parts[0] ?? null) : undefined,
  };
}

function paginate<T>(items: T[], page = 1, limit = 20): T[] {
  const start = (normalizePage(page) - 1) * normalizeLimit(limit);
  return items.slice(start, start + normalizeLimit(limit));
}

function sortByPublishedDesc(posts: PublicPost[]) {
  return [...posts].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

function sortByPathSlug(a: CategoryHierarchy, b: CategoryHierarchy) {
  return a.slug.localeCompare(b.slug);
}

async function listPostsLegacy(input: ContentListInput = {}): Promise<PublicPost[]> {
  const posts = await getLegacyPublishedPosts();
  const categoryPath = input.categoryPath ? normalizeCategoryPath(input.categoryPath) : undefined;
  const tagSlug = input.tagSlug ? input.tagSlug.trim().toLowerCase() : undefined;

  const filtered = posts.filter((post) => {
    if (input.publishedOnly === false) return true;
    if (input.publishedOnly === true && post.status !== "published") return false;
    if (tagSlug && !(post.tags ?? []).includes(tagSlug)) return false;
    if (categoryPath && post.category !== categoryPath) return false;
    return true;
  });

  const sorted = sortByPublishedDesc(filtered);
  if (input.page || input.limit) {
    return paginate(sorted, input.page, input.limit);
  }
  return sorted;
}

async function getPostsByTagLegacy(
  slug: string,
  input: Omit<ContentListInput, "tagSlug"> = {},
): Promise<PublicPost[]> {
  const posts = await getLegacyPostsByTag(slug);
  const normalized = sortByPublishedDesc(posts).filter((post) =>
    post.tags?.some((tag) => tag.toLowerCase() === slug.toLowerCase()),
  );
  if (input.page || input.limit) {
    return paginate(normalized, input.page, input.limit);
  }
  return normalized;
}

async function getPostsByCategoryPathLegacy(
  categoryPath: string,
  input: Omit<ContentListInput, "categoryPath"> = {},
): Promise<PublicPost[]> {
  const normalized = normalizeCategoryPath(categoryPath);
  if (!normalized) return [];
  const candidates = await getLegacyPostsByCategory(normalized);
  const sorted = sortByPublishedDesc(candidates);
  if (input.page || input.limit) {
    return paginate(sorted, input.page, input.limit);
  }
  return sorted;
}

async function getCategoryByPathLegacy(path: string): Promise<CategoryHierarchy | undefined> {
  const normalized = normalizeCategoryPath(path);
  if (!normalized) return;
  const collection = await getLegacyContentCollection();
  const category = collection.categories.find((entry) => entry.slug === normalized);
  return category ? toCategoryHierarchy(category) : undefined;
}

async function listCategoriesLegacy(input: CategoryListInput): Promise<CategoryHierarchy[]> {
  const collection = await getLegacyContentCollection();
  if (input.depth === 1) {
    return collection.categories
      .map(toCategoryHierarchy)
      .filter((category) => category.depth === 1)
      .sort(sortByPathSlug);
  }
  const parentSlug = input.parentSlug?.trim().toLowerCase();
  return collection.categories
    .map(toCategoryHierarchy)
    .filter((category) => category.depth === 2)
    .filter((category) => (parentSlug ? category.parentSlug === parentSlug : true))
    .sort(sortByPathSlug);
}

function resolveModeFromEnv(): ContentSourceMode {
  const rawMode = process.env.CONTENT_SOURCE_MODE?.trim().toLowerCase();
  return rawMode === "d1r2" ? "d1r2" : "legacy";
}

function createLegacySource(): BlogContentSource {
  return {
    mode: "legacy",
    listPosts: listPostsLegacy,
    getPostBySlug: (slug: string) => getLegacyPostBySlug(slug),
    getPostsByTag: getPostsByTagLegacy,
    getPostsByCategoryPath: getPostsByCategoryPathLegacy,
    listCategories: listCategoriesLegacy,
    getCategoryByPath: getCategoryByPathLegacy,
    getSiteConfig,
  };
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
    });
    if (!result.ok) return [];

    const metadata = await getContentMetadata();
    return Promise.all(result.data.items.map((post) => toPublicSourcePost(post, metadata)));
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

    const metadata = await getContentMetadata();
    return Promise.all(result.data.items.map((post) => toPublicSourcePost(post, metadata)));
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

    const metadata = await getContentMetadata();
    return Promise.all(result.data.items.map((post) => toPublicSourcePost(post, metadata)));
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
    const metadata = await getContentMetadata();
    return toPublicSourcePost(result.data, metadata);
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
    getSiteConfig,
  };
}

export function getContentSourceMode(): ContentSourceMode {
  return resolveModeFromEnv();
}

export async function getContentSource(
  mode: ContentSourceMode = getContentSourceMode(),
): Promise<BlogContentSource> {
  return mode === "d1r2" ? createD1R2Source() : createLegacySource();
}

export async function getPublishedPosts(input: ContentListInput = {}): Promise<PublicPost[]> {
  const source = await getContentSource();
  return source.listPosts({ ...input, publishedOnly: true, page: input.page, limit: input.limit });
}

export async function getPostBySlug(slug: string): Promise<PublicPost | undefined> {
  const source = await getContentSource();
  return source.getPostBySlug(slug);
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

export async function getPostsByTag(slug: string): Promise<PublicPost[]> {
  const source = await getContentSource();
  return source.getPostsByTag(slug);
}

export async function getTag(slug: string) {
  const collection = await getLegacyContentCollection();
  return collection.tags.find((tag) => tag.slug === slug);
}

export async function listCategories(input: CategoryListInput): Promise<CategoryHierarchy[]> {
  const source = await getContentSource();
  return source.listCategories(input);
}

export async function getContentCollection() {
  return getLegacyContentCollection();
}

export async function getCategory(path: string): Promise<CategoryHierarchy | undefined> {
  const source = await getContentSource();
  return source.getCategoryByPath(path);
}

export async function getTags(): Promise<Tag[]> {
  const collection = await getContentCollection();
  return collection.tags;
}

export async function getCategoryByPath(path: string): Promise<CategoryHierarchy | undefined> {
  const source = await getContentSource();
  return source.getCategoryByPath(path);
}

export function normalizeForDualRunCompare(post: PublicPost) {
  return toDualRunComparableContent(post);
}

export { getSiteConfig } from "./content";
