import matter from "gray-matter";

import { authorFrontmatterSchema, postFrontmatterSchema } from "./schemas.js";
import { fail, firstIssue, issue, ok } from "./result.js";
import type {
  ArchivedPost,
  Author,
  DraftPost,
  FileInput,
  Post,
  PostStatus,
  ValidationIssue,
  ValidationResult,
} from "./types.js";

function isPostStatus(value: unknown): value is PostStatus {
  return value === "draft" || value === "published" || value === "archived";
}

function isValidDate(value: string): boolean {
  return !Number.isNaN(Date.parse(value));
}

/** Parses one author profile file and keeps the Markdown body separate from frontmatter. */
export function parseAuthorFile(input: FileInput): ValidationResult<Author> {
  const parsed = matter(input.source);
  const result = authorFrontmatterSchema.safeParse(parsed.data);
  if (!result.success) {
    const first = result.error.issues[0];
    const code = first?.path.join(".") === "id" ? "author.id.required" : "author.invalid";
    return fail(firstIssue(code, first?.message ?? "Invalid author", [input.path]));
  }
  return ok({ path: input.path, body: parsed.content.trim(), ...result.data });
}

/**
 * Parses one MDX post file and applies only single-file rules.
 * Cross-file checks such as author existence and duplicate slugs happen in collection validation.
 */
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

  // Draft and archived files may be incomplete; only published posts are public-input strict.
  if (data.status !== "published") {
    return ok({ ...base, status: data.status } as DraftPost | ArchivedPost);
  }

  const issues = publishedPostIssues(input.path, body, data);
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

function publishedPostIssues(
  path: string,
  body: string,
  data: {
    title?: string;
    slug?: string;
    author?: string;
    publishedAt?: string;
  },
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (!data.title) {
    issues.push(issue("post.title.required", "Published post requires title", [path, "title"]));
  }
  if (!data.slug) {
    issues.push(issue("post.slug.required", "Published post requires slug", [path, "slug"]));
  }
  if (!data.author) {
    issues.push(issue("post.author.required", "Published post requires author", [path, "author"]));
  }
  if (!data.publishedAt) {
    issues.push(
      issue("post.publishedAt.required", "Published post requires publishedAt", [
        path,
        "publishedAt",
      ]),
    );
  } else if (!isValidDate(data.publishedAt)) {
    issues.push(
      issue("post.publishedAt.invalid", "publishedAt must be a valid date", [path, "publishedAt"]),
    );
  }
  if (!body) {
    issues.push(
      issue("post.body.required", "Published post requires a non-empty body", [path, "body"]),
    );
  }
  return issues;
}
