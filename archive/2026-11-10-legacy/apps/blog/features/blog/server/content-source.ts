import { loadSiteConfig } from "@/shared/config/site-config";
import { createD1R2Source, listPostsFromD1 } from "./content-source-d1r2";
import { createRemoteSource } from "./content-source-remote";
import type {
  BlogContentSource,
  CategoryHierarchy,
  CategoryListInput,
  ContentListInput,
  ContentSourceMode,
  PublicPost,
  Tag,
} from "./content-source-types";
import { labelFromSlug, normalizeContentListInput } from "./content-source-utils";

export type {
  BlogContentSource,
  Category,
  CategoryHierarchy,
  CategoryListInput,
  ContentFailure,
  ContentFailureCode,
  ContentListInput,
  ContentSourceMode,
  ContentSourceResult,
  PublicPost,
  Tag,
} from "./content-source-types";
export { blogContentCacheTags } from "./content-source-d1r2";
export { normalizeForDualRunCompare } from "./content-source-utils";

function resolveModeFromEnv(): ContentSourceMode {
  return process.env.BLOG_CONTENT_PROXY_URL?.trim() ? "remote" : "d1r2";
}

export function getContentSourceMode(): ContentSourceMode {
  return resolveModeFromEnv();
}

export async function getContentSource(
  mode: ContentSourceMode = resolveModeFromEnv(),
): Promise<BlogContentSource> {
  return mode === "remote" ? createRemoteSource() : createD1R2Source();
}

export async function getPublishedPosts(input: ContentListInput = {}): Promise<PublicPost[]> {
  const source = await getContentSource();
  return source.listPosts(normalizeContentListInput({ ...input, publishedOnly: true }));
}

export async function getPublishedPostPage(input: ContentListInput = {}) {
  const source = await getContentSource();
  return source.listPostPage(
    normalizeContentListInput({ ...input, publishedOnly: true, includeTotal: true }),
  );
}

/** Exhaust the catalog; sitemap and taxonomy discovery must not inherit a UI page limit. */
export async function getAllPublishedPosts(input: Omit<ContentListInput, "page" | "limit"> = {}) {
  const posts: PublicPost[] = [];
  for (let page = 1; ; page += 1) {
    const batch = await getPublishedPosts({ ...input, page, limit: 100, includeTotal: false });
    posts.push(...batch);
    if (batch.length < 100) return posts;
  }
}

export async function getCategoryCounts(categories: CategoryHierarchy[]) {
  return Object.fromEntries(
    await Promise.all(
      categories.map(async (category) => {
        const { total } = await getPublishedPostPage({
          categoryPath: category.slug,
          limit: 1,
          analyzeBody: false,
          includeMedia: false,
        });
        return [category.slug, total];
      }),
    ),
  );
}

/** Chat must distinguish an upstream outage from an empty public catalog. */
export async function getPublishedPostsStrict(input: ContentListInput = {}): Promise<PublicPost[]> {
  return listPostsFromD1(normalizeContentListInput({ ...input, publishedOnly: true }), true);
}

export async function searchPosts(input: {
  query: string;
  categoryPath?: string;
  page?: number;
  limit?: number;
}): Promise<PublicPost[]> {
  const source = await getContentSource();
  return source.listPosts(
    normalizeContentListInput({
      publishedOnly: true,
      page: input.page,
      limit: input.limit,
      categoryPath: input.categoryPath,
      query: input.query,
      includeTotal: false,
      analyzeBody: false,
    }),
  );
}

export async function getPostBySlug(
  slug: string,
  options?: { analyzeBody?: boolean },
): Promise<PublicPost | undefined> {
  const source = await getContentSource();
  return source.getPostBySlug(slug, options);
}

export async function getRecommendedPosts(post: PublicPost, limit = 3): Promise<PublicPost[]> {
  const posts = await getPublishedPosts({ analyzeBody: false, limit: 100 });
  const currentTags = new Set(post.tags ?? []);
  return posts
    .filter((candidate) => candidate.slug !== post.slug)
    .map((candidate) => ({
      post: candidate,
      score:
        (candidate.category && candidate.category === post.category ? 4 : 0) +
        (candidate.tags ?? []).filter((tag) => currentTags.has(tag)).length * 2,
    }))
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
  return tags.find((tag) => tag.slug === slug.trim().toLowerCase());
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
  return { posts, authors: [], categories, tags, site };
}

export async function getCategory(path: string): Promise<CategoryHierarchy | undefined> {
  const source = await getContentSource();
  return source.getCategoryByPath(path);
}

export async function getTags(): Promise<Tag[]> {
  const posts = await getAllPublishedPosts({ analyzeBody: false });
  const tagMap = new Map<string, Tag>();
  for (const post of posts) {
    for (const tag of post.tagEntries ?? []) tagMap.set(tag.slug, tag);
    for (const slug of post.tags ?? []) {
      if (!tagMap.has(slug)) tagMap.set(slug, { slug, label: labelFromSlug(slug) });
    }
  }
  return [...tagMap.values()].sort((a, b) => a.slug.localeCompare(b.slug));
}

export async function getCategoryByPath(path: string): Promise<CategoryHierarchy | undefined> {
  const source = await getContentSource();
  return source.getCategoryByPath(path);
}

export { loadSiteConfig as getSiteConfig };
