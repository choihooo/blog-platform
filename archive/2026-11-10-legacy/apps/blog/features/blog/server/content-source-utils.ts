import {
  analyzeEditorNodes,
  calculateReadingTime,
  loadPostContent,
  textFromEditorNodes,
  type EditorNode,
} from "@blog-platform/core/content";
import type { PostRecord } from "@blog-platform/core/content";
import type { CategoryHierarchy, ContentListInput, PublicPost, Tag } from "./content-source-types";

const CATEGORY_PATH_RE = /^([a-z0-9-]+)(?:\/([a-z0-9-]+))?$/;

export function normalizeTagInput(tags: string[] | undefined) {
  return [...new Set((tags ?? []).map((tag) => tag.trim().toLowerCase()).filter(Boolean))].sort();
}

export function labelFromSlug(slug: string) {
  return slug
    .split("/")
    .at(-1)!
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function safePublicImageUrl(value?: string | null): string | undefined {
  const normalized = value?.trim();
  if (!normalized) return;
  if (normalized.startsWith("/media/") || /^https?:\/\//i.test(normalized)) return normalized;
  return undefined;
}

function safePublicNodes(nodes: EditorNode[]): EditorNode[] {
  return nodes.filter((node) => node.type !== "image" || Boolean(safePublicImageUrl(node.src)));
}

export function toPublicSourcePost(
  post: PostRecord,
  options?: { tagSlugs?: string[]; analyzeBody?: boolean },
): PublicPost {
  const normalizedSlug = post.slug.trim().toLowerCase();
  const categoryPath = post.categoryPath ?? null;
  const requestedTags = normalizeTagInput(post.tags ?? options?.tagSlugs);
  const content = loadPostContent(post.content ?? "");
  const bodyNodes = safePublicNodes(content.nodes);
  const shouldAnalyzeBody = options?.analyzeBody ?? true;
  const analysis = shouldAnalyzeBody ? analyzeEditorNodes(bodyNodes) : undefined;
  const textBody = textFromEditorNodes(bodyNodes);
  const toc = analysis?.headings ?? [];
  const readingTimeLabel = analysis?.readingTime.label ?? calculateReadingTime(textBody).label;
  const heroMedia =
    post.mediaRefs?.find((media) => media.kind === "hero") ??
    post.mediaRefs?.find((media) => media.kind === "og");
  const coverImage = safePublicImageUrl(
    heroMedia?.r2Url ?? heroMedia?.r2Key ?? post.heroImageKey ?? undefined,
  );

  return {
    path: `db/posts/${normalizedSlug}`,
    status: "published",
    title: post.title,
    slug: normalizedSlug,
    author: "db",
    publishedAt: post.publishedAt ?? "",
    updatedAt: post.updatedAt,
    excerpt: post.summary,
    coverImage,
    body: textBody,
    bodyNodes,
    toc,
    tags: requestedTags,
    tagEntries: requestedTags.map((tag) => ({ slug: tag, label: labelFromSlug(tag) })),
    category: categoryPath ?? undefined,
    categoryEntry: categoryPath
      ? { slug: categoryPath, label: labelFromSlug(categoryPath), description: undefined }
      : undefined,
    authorProfile: undefined,
    readingTimeLabel,
  };
}

export function normalizePage(input?: number) {
  const page = input ? Number(input) : 1;
  if (!Number.isFinite(page) || page < 1) return 1;
  return Math.floor(page);
}

export function normalizeLimit(input?: number) {
  const limit = input ? Number(input) : 20;
  if (!Number.isFinite(limit) || limit < 1) return 20;
  return Math.min(100, Math.floor(limit));
}

export function normalizeCategoryPath(path: string): string | undefined {
  const normalized = path.trim().replace(/^\/+|\/+$/g, "");
  if (!CATEGORY_PATH_RE.test(normalized)) return;
  const parts = normalized.split("/");
  if (parts.length < 1 || parts.length > 2) return;
  if (parts.some((part) => !part)) return;
  return parts.join("/");
}

export function normalizeSlug(value: string) {
  return value.trim().toLowerCase();
}

export function sortByPathSlug(a: CategoryHierarchy, b: CategoryHierarchy) {
  return a.slug.localeCompare(b.slug);
}

export function normalizeContentListInput(input: ContentListInput): ContentListInput {
  const normalized: ContentListInput = { ...input };
  for (const key of Object.keys(normalized) as Array<keyof ContentListInput>) {
    if (normalized[key] === undefined) delete normalized[key];
  }
  return normalized;
}

export function normalizeForDualRunCompare(post: PublicPost) {
  const normalizedBody = post.body ?? "";
  const normalizedCoverImage = post.coverImage ?? "";
  return {
    slug: post.slug,
    status: post.status,
    title: post.title,
    category: post.category ?? null,
    tags: normalizeTagInput(post.tags),
    publishedAt: post.publishedAt,
    updatedAt: post.updatedAt ?? "",
    excerpt: post.excerpt ?? "",
    coverImage: normalizedCoverImage,
    bodyFingerprint: normalizedBody.replace(/\r\n/g, "\n").replace(/\s+$/g, ""),
    tocCount: post.toc.length,
    tagCount: post.tags?.length ?? 0,
  };
}

export type { Tag };
