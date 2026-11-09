import type { EditorDocument } from "@blog-platform/core/content";

export function slugCandidate(document: EditorDocument): string {
  const titleSlug = document.frontmatter.title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return document.frontmatter.slug || titleSlug || document.id;
}
