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

/** 작성자 프로필 파일 하나를 parsing하고 Markdown 본문을 frontmatter와 분리한다. */
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
 * MDX post 파일 하나를 parsing하고 단일 파일 규칙만 적용한다.
 * 작성자 존재 여부나 slug 중복 같은 cross-file 검증은 collection validation에서 처리한다.
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

  // draft와 archived는 불완전할 수 있으므로 public 입력인 published에만 엄격한 규칙을 적용한다.
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
