import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import {
  analyzeMdx,
  getPublishedPosts as selectPublishedPosts,
  validateContentCollection,
  type Author,
  type Category,
  type ContentCollection,
  type PublishedPost,
  type Tag,
  type TocItem,
} from "@blog-platform/markdown";

export type PublicPost = PublishedPost & {
  authorProfile?: Author;
  categoryEntry?: Category;
  tagEntries: Tag[];
  toc: TocItem[];
  readingTimeLabel: string;
  body: string;
};

export type DualRunComparablePost = {
  slug: string;
  status: PublicPost["status"];
  title: string;
  category: string | null;
  tags: string[];
  publishedAt: string;
  updatedAt: string;
  excerpt: string;
  coverImage: string;
  bodyFingerprint: string;
  tocCount: number;
  tagCount: number;
};

export function normalizeDualRunTagList(tags: string[] | undefined) {
  return [
    ...new Set((tags ?? []).map((tag) => String(tag).trim().toLowerCase()).filter(Boolean)),
  ].sort();
}

export function toDualRunComparable(post: PublicPost): DualRunComparablePost {
  const normalizedBody = post.body ?? "";
  const normalizedCoverImage = post.coverImage ?? "";
  return {
    slug: post.slug,
    status: post.status,
    title: post.title,
    category: post.category ?? null,
    tags: normalizeDualRunTagList(post.tags),
    publishedAt: post.publishedAt,
    updatedAt: post.updatedAt ?? "",
    excerpt: post.excerpt ?? "",
    coverImage: normalizedCoverImage,
    bodyFingerprint: normalizedBody.replace(/\r\n/g, "\n").replace(/\s+$/g, ""),
    tocCount: post.toc.length,
    tagCount: post.tags?.length ?? 0,
  };
}

export function isDualRunMatch(left: PublicPost, right: PublicPost) {
  return JSON.stringify(toDualRunComparable(left)) === JSON.stringify(toDualRunComparable(right));
}

function resolveContentRoot() {
  const candidates = [
    process.env.CONTENT_ROOT,
    path.join(process.cwd(), "content"),
    path.resolve(process.cwd(), "../../content"),
    path.resolve(process.cwd(), "../content"),
  ].filter((candidate): candidate is string => Boolean(candidate));

  return (
    candidates.find((candidate) => existsSync(path.join(candidate, "posts"))) ??
    path.resolve(process.cwd(), "content")
  );
}

const contentRoot = resolveContentRoot();
const CATEGORY_PATH_RE = /^([a-z0-9-]+)(?:\/([a-z0-9-]+))?$/;

function normalizeSlug(value: string) {
  return value.trim().toLowerCase();
}

function normalizeCategoryPath(value: string): string | undefined {
  const trimmed = value.trim().replace(/^\/+|\/+$/g, "");
  if (!trimmed || !CATEGORY_PATH_RE.test(trimmed)) return;
  const parts = trimmed.split("/");
  if (parts.length > 2) return;
  return parts.map(normalizeSlug).join("/");
}

async function readContentFiles(directory: string) {
  const entries = await readdir(directory, { withFileTypes: true });
  return Promise.all(
    entries
      .filter((entry) => entry.isFile())
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(async (entry) => {
        const filePath = path.join(directory, entry.name);
        return {
          path: path.relative(contentRoot, filePath),
          source: await readFile(filePath, "utf8"),
        };
      }),
  );
}

function issueCodes(issues: Array<{ code: string }>) {
  return issues.map((item) => item.code).join(", ");
}

export async function getContentCollection(): Promise<ContentCollection> {
  const [posts, authors, categoriesJson, tagsJson, siteJson] = await Promise.all([
    readContentFiles(path.join(contentRoot, "posts")),
    readContentFiles(path.join(contentRoot, "authors")),
    readFile(path.join(contentRoot, "categories.json"), "utf8"),
    readFile(path.join(contentRoot, "tags.json"), "utf8"),
    readFile(path.join(contentRoot, "site.json"), "utf8"),
  ]);

  const result = validateContentCollection({
    posts,
    authors,
    categoriesJson,
    tagsJson,
    siteJson,
  });

  if (!result.success || !result.data) {
    throw new Error(`Invalid content collection: ${issueCodes(result.issues)}`);
  }

  return result.data;
}

function toPublicPost(post: PublishedPost, collection: ContentCollection): PublicPost {
  const analysis = analyzeMdx({ path: post.path, source: post.body });
  if (!analysis.success || !analysis.data) {
    throw new Error(`Invalid MDX in ${post.path}: ${issueCodes(analysis.issues)}`);
  }

  return {
    ...post,
    authorProfile: collection.authors.find((author) => author.id === post.author),
    categoryEntry: collection.categories.find((category) => category.slug === post.category),
    tagEntries: collection.tags.filter((tag) => post.tags?.includes(tag.slug)),
    toc: analysis.data.toc,
    readingTimeLabel: analysis.data.readingTime.label,
    body: analysis.data.body,
  };
}

function filterCategoryPostsByPath(posts: PublicPost[], categoryPath?: string): PublicPost[] {
  const normalized = categoryPath ? normalizeCategoryPath(categoryPath) : undefined;
  if (!normalized) return categoryPath ? [] : posts;
  return posts.filter((post) => post.category === normalized);
}

export async function getPublishedPosts(): Promise<PublicPost[]> {
  const collection = await getContentCollection();
  return selectPublishedPosts(collection)
    .map((post) => toPublicPost(post, collection))
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export async function getPostBySlug(slug: string): Promise<PublicPost | undefined> {
  const posts = await getPublishedPosts();
  const normalized = normalizeSlug(slug);
  return posts.find((post) => post.slug === normalized);
}

export async function getPostsByCategory(slug: string): Promise<PublicPost[]> {
  const posts = await getPublishedPosts();
  return filterCategoryPostsByPath(posts, slug).sort((a, b) =>
    b.publishedAt.localeCompare(a.publishedAt),
  );
}

export async function getPostsByTag(slug: string): Promise<PublicPost[]> {
  const posts = await getPublishedPosts();
  const normalized = normalizeSlug(slug);
  return posts
    .filter((post) => post.tags?.includes(normalized))
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export async function getCategory(slug: string): Promise<Category | undefined> {
  const collection = await getContentCollection();
  const normalized = normalizeCategoryPath(slug);
  if (!normalized) return;
  return collection.categories.find((category) => category.slug === normalized);
}

export async function getTag(slug: string): Promise<Tag | undefined> {
  const collection = await getContentCollection();
  const normalized = normalizeSlug(slug);
  return collection.tags.find((tag) => tag.slug === normalized);
}

export async function getSiteConfig() {
  const collection = await getContentCollection();
  return collection.site;
}
