import GithubSlugger from "github-slugger";

import { fail, firstIssue, ok } from "./result.js";
import type { ValidationResult } from "./types.js";

/** Creates the deterministic slug candidate used before save/publish. */
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

/** Checks a candidate against known posts; currentPath lets an existing post keep its own slug. */
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
