import { z } from "zod";

import { parseAuthorFile, parsePostFile } from "./post.js";
import { fail, firstIssue, issue, ok } from "./result.js";
import { categorySchema, siteConfigSchema, tagSchema } from "./schemas.js";
import type {
  ContentCollection,
  ContentCollectionInput,
  PublishedPost,
  ValidationIssue,
  ValidationResult,
} from "./types.js";

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

function duplicatePublishedSlugIssues(posts: PublishedPost[]): ValidationIssue[] {
  const owners = new Map<string, string>();
  const issues: ValidationIssue[] = [];
  for (const post of posts) {
    const owner = owners.get(post.slug);
    if (owner && owner !== post.path) {
      issues.push(
        issue("post.slug.duplicate", "Slug is already used by another post", [post.path, "slug"]),
      );
    } else {
      owners.set(post.slug, post.path);
    }
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

  // Cross-file checks belong here: individual files cannot know registered authors/taxonomy.
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

/**
 * Validates the full repository content set.
 * This is where references are checked because individual files cannot know the registry.
 */
export function validateContentCollection(
  input: ContentCollectionInput,
): ValidationResult<ContentCollection> {
  const issues: ValidationIssue[] = [];
  const posts = input.posts.flatMap((postInput) => {
    const result = parsePostFile(postInput);
    if (result.success && result.data) return [result.data];
    issues.push(...result.issues);
    return [];
  });
  const authors = input.authors.flatMap((authorInput) => {
    const result = parseAuthorFile(authorInput);
    if (result.success && result.data) return [result.data];
    issues.push(...result.issues);
    return [];
  });

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
  issues.push(
    ...duplicatePublishedSlugIssues(
      posts.filter((post): post is PublishedPost => post.status === "published"),
    ),
  );

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

/** Returns the only post state allowed to feed public pages and generated outputs. */
export function getPublishedPosts(collection: ContentCollection): PublishedPost[] {
  return collection.posts.filter((post): post is PublishedPost => post.status === "published");
}
