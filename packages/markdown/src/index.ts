import GithubSlugger from "github-slugger";
import matter from "gray-matter";
import { z } from "zod";

export type PostStatus = "draft" | "published" | "archived";

export interface ValidationIssue {
  code: string;
  message: string;
  path: string[];
}

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  issues: ValidationIssue[];
}

export interface FileInput {
  path: string;
  source: string;
}

export interface DraftPost {
  path: string;
  status: "draft";
  body: string;
  title?: string;
  slug?: string;
  author?: string;
  publishedAt?: string;
  updatedAt?: string;
  excerpt?: string;
  coverImage?: string;
  category?: string;
  tags?: string[];
}

export interface PublishedPost {
  path: string;
  status: "published";
  body: string;
  title: string;
  slug: string;
  author: string;
  publishedAt: string;
  updatedAt?: string;
  excerpt?: string;
  coverImage?: string;
  category?: string;
  tags?: string[];
}

export interface ArchivedPost {
  path: string;
  status: "archived";
  body: string;
  title?: string;
  slug?: string;
  author?: string;
  publishedAt?: string;
  updatedAt?: string;
  excerpt?: string;
  coverImage?: string;
  category?: string;
  tags?: string[];
}

export type Post = DraftPost | PublishedPost | ArchivedPost;

export interface Author {
  path: string;
  id: string;
  name: string;
  body: string;
  githubLogin: string;
  githubUserId: string;
  bio?: string;
  avatar?: string;
}

export interface Category {
  slug: string;
  label: string;
  description?: string;
}

export interface Tag {
  slug: string;
  label: string;
  description?: string;
}

export interface SiteConfig {
  siteName: string;
  siteUrl: string;
  defaultAuthor: string;
  adminGithubLogin: string;
  adminGithubUserId: string;
  github: {
    owner: string;
    repo: string;
    branch: string;
  };
  analytics: {
    provider: string;
  };
  features: {
    aiAssistant: boolean;
    internalLinkSuggestions: boolean;
  };
}

export interface ContentCollection {
  posts: Post[];
  authors: Author[];
  categories: Category[];
  tags: Tag[];
  site: SiteConfig;
}

export interface ContentCollectionInput {
  posts: FileInput[];
  authors: FileInput[];
  categoriesJson: string;
  tagsJson: string;
  siteJson: string;
}

const optionalString = z.string().trim().min(1).optional();
const stringArray = z.array(z.string().trim().min(1)).optional();

const postFrontmatterSchema = z.object({
  title: optionalString,
  status: z.unknown(),
  slug: optionalString,
  author: optionalString,
  publishedAt: optionalString,
  updatedAt: optionalString,
  excerpt: optionalString,
  coverImage: optionalString,
  category: optionalString,
  tags: stringArray,
});

const authorFrontmatterSchema = z.object({
  id: z.string().trim().min(1),
  name: z.string().trim().min(1),
  githubLogin: z.string().trim().min(1),
  githubUserId: z.string().trim().min(1),
  bio: optionalString,
  avatar: optionalString,
});

const categorySchema = z.object({
  slug: z.string().trim().min(1),
  label: z.string().trim().min(1),
  description: optionalString,
});

const tagSchema = z.object({
  slug: z.string().trim().min(1),
  label: z.string().trim().min(1),
  description: optionalString,
});

const siteConfigSchema = z.object({
  siteName: z.string().trim().min(1),
  siteUrl: z.string().trim().min(1),
  defaultAuthor: z.string().trim().min(1),
  adminGithubLogin: z.string().trim().min(1),
  adminGithubUserId: z.string().trim().min(1),
  github: z.object({
    owner: z.string().trim().min(1),
    repo: z.string().trim().min(1),
    branch: z.string().trim().min(1),
  }),
  analytics: z.object({
    provider: z.string().trim().min(1),
  }),
  features: z.object({
    aiAssistant: z.boolean(),
    internalLinkSuggestions: z.boolean(),
  }),
});

function issue(code: string, message: string, path: string[]): ValidationIssue {
  return { code, message, path };
}

function ok<T>(data: T): ValidationResult<T> {
  return { success: true, data, issues: [] };
}

function fail<T>(issues: ValidationIssue[]): ValidationResult<T> {
  return { success: false, issues };
}

function firstIssue(code: string, message: string, path: string[]): ValidationIssue[] {
  return [issue(code, message, path)];
}

function isPostStatus(value: unknown): value is PostStatus {
  return value === "draft" || value === "published" || value === "archived";
}

function isValidDate(value: string): boolean {
  return !Number.isNaN(Date.parse(value));
}

function parseJson<T>(
  source: string,
  schema: z.ZodType<T>,
  code: string,
  path: string[],
): ValidationResult<T> {
  try {
    const parsed: unknown = JSON.parse(source);
    const result = schema.safeParse(parsed);
    if (!result.success) {
      return fail(firstIssue(code, result.error.issues[0]?.message ?? "Invalid JSON shape", path));
    }
    return ok(result.data);
  } catch {
    return fail(firstIssue(code, "Invalid JSON", path));
  }
}

function parseAuthorFile(input: FileInput): ValidationResult<Author> {
  const parsed = matter(input.source);
  const result = authorFrontmatterSchema.safeParse(parsed.data);
  if (!result.success) {
    const first = result.error.issues[0];
    const code = first?.path.join(".") === "id" ? "author.id.required" : "author.invalid";
    return fail(firstIssue(code, first?.message ?? "Invalid author", [input.path]));
  }
  return ok({ path: input.path, body: parsed.content.trim(), ...result.data });
}

export function parsePostFile(input: FileInput): ValidationResult<Post> {
  const parsed = matter(input.source);
  const frontmatter = postFrontmatterSchema.safeParse(parsed.data);
  if (!frontmatter.success) {
    return fail(firstIssue("post.frontmatter.invalid", "Invalid post frontmatter", [input.path]));
  }

  const data = frontmatter.data;
  if (!isPostStatus(data.status)) {
    return fail(
      firstIssue("post.status.invalid", "Post status must be draft, published, or archived", [
        input.path,
        "status",
      ]),
    );
  }

  const body = parsed.content.trim();
  const base = {
    path: input.path,
    body,
    title: data.title,
    slug: data.slug,
    author: data.author,
    publishedAt: data.publishedAt,
    updatedAt: data.updatedAt,
    excerpt: data.excerpt,
    coverImage: data.coverImage,
    category: data.category,
    tags: data.tags,
  };

  if (data.status !== "published") {
    return ok({ ...base, status: data.status } as DraftPost | ArchivedPost);
  }

  const issues: ValidationIssue[] = [];
  if (!data.title)
    issues.push(
      issue("post.title.required", "Published post requires title", [input.path, "title"]),
    );
  if (!data.slug)
    issues.push(issue("post.slug.required", "Published post requires slug", [input.path, "slug"]));
  if (!data.author)
    issues.push(
      issue("post.author.required", "Published post requires author", [input.path, "author"]),
    );
  if (!data.publishedAt) {
    issues.push(
      issue("post.publishedAt.required", "Published post requires publishedAt", [
        input.path,
        "publishedAt",
      ]),
    );
  } else if (!isValidDate(data.publishedAt)) {
    issues.push(
      issue("post.publishedAt.invalid", "publishedAt must be a valid date", [
        input.path,
        "publishedAt",
      ]),
    );
  }
  if (!body)
    issues.push(
      issue("post.body.required", "Published post requires a non-empty body", [input.path, "body"]),
    );
  if (issues.length > 0) return fail(issues);

  return ok({
    ...base,
    status: "published",
    title: data.title as string,
    slug: data.slug as string,
    author: data.author as string,
    publishedAt: data.publishedAt as string,
  });
}

export function createSlugCandidate(title: string): ValidationResult<string> {
  const slugger = new GithubSlugger();
  const candidate = slugger.slug(title.trim());
  if (!candidate) {
    return fail(
      firstIssue("post.slug.unusable-title", "Title cannot produce a usable slug", ["title"]),
    );
  }
  return ok(candidate);
}

export function validateUniqueSlug(input: {
  candidate: string;
  existingPosts: Array<{ path: string; slug?: string }>;
  currentPath?: string;
}): ValidationResult<string> {
  const duplicate = input.existingPosts.find(
    (post) => post.path !== input.currentPath && post.slug === input.candidate,
  );
  if (duplicate) {
    return fail(
      firstIssue("post.slug.duplicate", "Slug is already used by another post", [
        duplicate.path,
        "slug",
      ]),
    );
  }
  return ok(input.candidate);
}

function duplicateSlugIssues(
  items: Array<{ slug: string }>,
  code: string,
  label: string,
): ValidationIssue[] {
  const seen = new Set<string>();
  const issues: ValidationIssue[] = [];
  for (const item of items) {
    if (seen.has(item.slug)) {
      issues.push(issue(code, `Duplicate ${label} slug`, [item.slug]));
    }
    seen.add(item.slug);
  }
  return issues;
}

function referenceIssues(collection: ContentCollection): ValidationIssue[] {
  const authorIds = new Set(collection.authors.map((author) => author.id));
  const categorySlugs = new Set(collection.categories.map((category) => category.slug));
  const tagSlugs = new Set(collection.tags.map((tag) => tag.slug));
  const issues: ValidationIssue[] = [];

  if (!authorIds.has(collection.site.defaultAuthor)) {
    issues.push(
      issue("site.defaultAuthor.unknown", "Site defaultAuthor must reference an author", [
        "site",
        "defaultAuthor",
      ]),
    );
  }

  for (const post of collection.posts) {
    if (post.author && !authorIds.has(post.author)) {
      issues.push(
        issue("post.author.unknown", "Post author must reference an author", [post.path, "author"]),
      );
    }
    if (post.category && !categorySlugs.has(post.category)) {
      issues.push(
        issue("post.category.unknown", "Post category must reference a category", [
          post.path,
          "category",
        ]),
      );
    }
    const unknownTags = post.tags?.filter((tag) => !tagSlugs.has(tag)) ?? [];
    if (unknownTags.length > 0) {
      issues.push(
        issue("post.tags.unknown", "Post tags must reference registered tags", [post.path, "tags"]),
      );
    }
  }
  return issues;
}

export function validateContentCollection(
  input: ContentCollectionInput,
): ValidationResult<ContentCollection> {
  const issues: ValidationIssue[] = [];
  const posts: Post[] = [];
  const authors: Author[] = [];

  for (const postInput of input.posts) {
    const result = parsePostFile(postInput);
    if (result.success && result.data) posts.push(result.data);
    else issues.push(...result.issues);
  }

  for (const authorInput of input.authors) {
    const result = parseAuthorFile(authorInput);
    if (result.success && result.data) authors.push(result.data);
    else issues.push(...result.issues);
  }

  const categoriesResult = parseJson(
    input.categoriesJson,
    z.array(categorySchema),
    "category.invalid",
    ["categoriesJson"],
  );
  const tagsResult = parseJson(input.tagsJson, z.array(tagSchema), "tag.invalid", ["tagsJson"]);
  const siteResult = parseJson(input.siteJson, siteConfigSchema, "site.invalid", ["siteJson"]);

  const categories = categoriesResult.data ?? [];
  const tags = tagsResult.data ?? [];
  if (!categoriesResult.success) issues.push(...categoriesResult.issues);
  if (!tagsResult.success) issues.push(...tagsResult.issues);
  if (!siteResult.success) issues.push(...siteResult.issues);

  issues.push(...duplicateSlugIssues(categories, "category.slug.duplicate", "category"));
  issues.push(...duplicateSlugIssues(tags, "tag.slug.duplicate", "tag"));

  const slugOwners = new Map<string, string>();
  for (const post of posts.filter((item): item is PublishedPost => item.status === "published")) {
    const owner = slugOwners.get(post.slug);
    if (owner && owner !== post.path) {
      issues.push(
        issue("post.slug.duplicate", "Slug is already used by another post", [post.path, "slug"]),
      );
    } else {
      slugOwners.set(post.slug, post.path);
    }
  }

  if (!siteResult.data) return fail(issues);

  const collection: ContentCollection = {
    posts,
    authors,
    categories,
    tags,
    site: siteResult.data,
  };
  issues.push(...referenceIssues(collection));

  return issues.length > 0 ? fail(issues) : ok(collection);
}

export function getPublishedPosts(collection: ContentCollection): PublishedPost[] {
  return collection.posts.filter((post): post is PublishedPost => post.status === "published");
}
