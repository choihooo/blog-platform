import type { EditorDocument, EditorFrontmatter } from "@blog-platform/core/content";

// Adopt persistence metadata without replacing fields edited after the submitted snapshot.
export function reconcileSavedDocument(
  submitted: EditorDocument,
  saved: EditorDocument,
  current: EditorDocument,
  hasNewEdits: boolean,
): EditorDocument {
  if (!hasNewEdits) return { ...saved, dirty: false };
  const frontmatter = { ...current.frontmatter };
  const keys = new Set([...Object.keys(submitted.frontmatter), ...Object.keys(saved.frontmatter)]);
  for (const key of keys as Set<keyof EditorFrontmatter>) {
    if (JSON.stringify(current.frontmatter[key]) === JSON.stringify(submitted.frontmatter[key])) {
      Object.assign(frontmatter, { [key]: saved.frontmatter[key] });
    }
  }
  return {
    ...current,
    path: saved.path,
    sourceSha: saved.sourceSha,
    lastSavedAt: saved.lastSavedAt,
    frontmatter,
    dirty: true,
  };
}
