import type { EditorDocument } from "@blog-platform/core/content";
import { slugForMedia } from "./media-path";

// Preview fallback keeps the persisted path; the editor's title candidate has a separate policy.
export function previewSlugCandidate(document: EditorDocument): string {
  const pathSlug = document.path?.replace(/^db\/posts\//, "");
  return (
    document.frontmatter.slug ||
    slugForMedia(pathSlug ?? "") ||
    slugForMedia(document.frontmatter.title) ||
    slugForMedia(document.id) ||
    document.id
  );
}
