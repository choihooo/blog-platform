import path from "node:path";
import type { ListFilesRoot, RepositoryContentKind } from "./types.js";

const configKinds = new Map<string, RepositoryContentKind>([
  ["content/site.json", "site-config"],
  ["content/categories.json", "category-config"],
  ["content/tags.json", "tag-config"],
]);

export function normalizeRepositoryPath(input: string): string | null {
  const normalized = input.replaceAll("\\", "/").replace(/^\/+/, "");
  const parts = normalized.split("/").filter(Boolean);
  if (
    path.isAbsolute(input) ||
    parts.length === 0 ||
    parts.includes("..") ||
    parts[0]?.startsWith(".")
  ) {
    return null;
  }
  return parts.join("/");
}

export function classifyRepositoryPath(input: string): RepositoryContentKind | null {
  const repoPath = normalizeRepositoryPath(input);
  if (!repoPath) return null;
  const configKind = configKinds.get(repoPath);
  if (configKind) return configKind;
  if (repoPath.startsWith("content/posts/") && repoPath.endsWith(".mdx")) return "post";
  if (repoPath.startsWith("content/authors/") && repoPath.endsWith(".md")) return "author";
  if (repoPath.startsWith("public/media/")) return "media";
  return null;
}

export function assertAllowedPath(
  input: string,
): { path: string; kind: RepositoryContentKind } | null {
  const repoPath = normalizeRepositoryPath(input);
  if (!repoPath) return null;
  const kind = classifyRepositoryPath(repoPath);
  return kind ? { path: repoPath, kind } : null;
}

export function listRootToPath(root: ListFilesRoot): string[] {
  switch (root) {
    case "posts":
      return ["content/posts"];
    case "authors":
      return ["content/authors"];
    case "config":
      return ["content/site.json", "content/categories.json", "content/tags.json"];
    case "media":
      return ["public/media"];
  }
}
