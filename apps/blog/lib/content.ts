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

const contentRoot = path.resolve(process.cwd(), "../../content");

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

export async function getPublishedPosts(): Promise<PublicPost[]> {
  const collection = await getContentCollection();
  return selectPublishedPosts(collection)
    .map((post) => toPublicPost(post, collection))
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export async function getPostBySlug(slug: string): Promise<PublicPost | undefined> {
  const posts = await getPublishedPosts();
  return posts.find((post) => post.slug === slug);
}

export async function getPostsByCategory(slug: string): Promise<PublicPost[]> {
  const posts = await getPublishedPosts();
  return posts.filter((post) => post.category === slug);
}

export async function getPostsByTag(slug: string): Promise<PublicPost[]> {
  const posts = await getPublishedPosts();
  return posts.filter((post) => post.tags?.includes(slug));
}

export async function getCategory(slug: string): Promise<Category | undefined> {
  const collection = await getContentCollection();
  return collection.categories.find((category) => category.slug === slug);
}

export async function getTag(slug: string): Promise<Tag | undefined> {
  const collection = await getContentCollection();
  return collection.tags.find((tag) => tag.slug === slug);
}

export async function getSiteConfig() {
  const collection = await getContentCollection();
  return collection.site;
}
