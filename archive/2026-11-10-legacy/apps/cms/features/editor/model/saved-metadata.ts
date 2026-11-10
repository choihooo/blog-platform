import type { EditorDocument } from "@blog-platform/core/content";
import { slugCandidate } from "./document-slug";
export function savedMetadata(document: EditorDocument) {
  const slug = slugCandidate(document);
  const updatedAt = document.frontmatter.updatedAt ?? document.lastSavedAt;
  if (!updatedAt) return `/${slug}`;
  return `/${slug} · ${new Date(updatedAt).toLocaleString()}`;
}
