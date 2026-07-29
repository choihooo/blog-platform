import GithubSlugger from "github-slugger";

import { fail, firstIssue, ok } from "./result.js";
import type { ValidationResult } from "./types.js";

/** 저장/발행 전에 사용할 결정적인 slug 후보를 생성한다. */
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

/** 후보 slug를 기존 post와 대조한다. currentPath는 기존 글이 자기 slug를 유지할 수 있게 한다. */
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
