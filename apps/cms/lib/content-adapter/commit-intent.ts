import path from "node:path";
import type { ContentChangeIntent } from "./types.js";

function slugFromPath(repoPath: string): string {
  return path.posix.basename(repoPath).replace(/\.(mdx|md|json|webp|png|jpe?g)$/i, "");
}

export function commitSummary(intent: ContentChangeIntent, repoPath: string): string {
  const slug = slugFromPath(repoPath);
  switch (intent) {
    case "create-draft":
      return `post(${slug}): create draft`;
    case "save-draft":
      return `post(${slug}): save draft`;
    case "prepare-publish":
      return `post(${slug}): publish`;
    case "prepare-unpublish":
      return `post(${slug}): unpublish`;
    case "prepare-archive":
      return `post(${slug}): archive`;
    case "save-media":
      return `media(${path.posix.dirname(repoPath).split("/").at(-1) ?? "media"}): upload ${path.posix.basename(repoPath)}`;
    case "update-site-config":
      return "settings: update site config";
    case "delete-file":
      return `file(${slug}): delete`;
  }
}
