import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";

export type CategorySourceRow = {
  id: string;
  name: string;
  slug: string;
  parent_id?: string | null;
  parent_slug?: string | null;
};

export type TagSourceRow = {
  id: string;
  name: string;
  slug: string;
};

export type PostSourceRow = {
  id: string;
  title: string;
  slug: string;
  content: string;
  summary?: string | null;
  category?: string | null;
  category_id?: string | null;
  category_path?: string | null;
  published_at?: string | null;
  is_published?: boolean | number | string;
  tags?: string[] | null;
  hero_image_key?: string | null;
};

export type MediaSourceRow = {
  id: string;
  post_id: string;
  source_url: string;
  target_r2_key?: string | null;
  kind?: string | null;
  width?: number | null;
  height?: number | null;
  status?: "pending" | "uploaded" | "mapped" | "failed" | "skipped";
  notes?: string | null;
};

export type SupabaseExport = {
  categories?: CategorySourceRow[];
  tags?: TagSourceRow[];
  posts?: PostSourceRow[];
  post_tags?: { post_id: string; tag_id: string }[];
  media_refs?: MediaSourceRow[];
};

export type CategoryNormalized = {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  parentSlug: string | null;
  depth: 1 | 2;
  createdAt: string;
};

export type ExtractSummary = {
  runbookId: string;
  categoryCount: number;
  tagCount: number;
  postCount: number;
  categoryNormalizationWarnings: string[];
};

export type ExtractResult = {
  categories: CategoryNormalized[];
  tags: TagSourceRow[];
  posts: PostSourceRow[];
  postTagPairs: { postId: string; tagId: string }[];
  media: MediaSourceRow[];
  summary: ExtractSummary;
};

const CATEGORY_PATH_RE = /^([a-z0-9-]+)(?:\/([a-z0-9-]+))?$/;
const SUPABASE_PUBLIC_RE = /https?:\/\/[^\s'"()]+\/storage\/v1\/object\/public\/[^\s'"()]+/gi;
const MARKDOWN_IMAGE_RE = /!\[[^\]]*\]\((https?:\/\/[^)\s]+)\)/gi;
const HTML_IMG_SRC_RE = /<img\b[^>]*\bsrc=(['"])([^'"]+)\1/gi;

function normalizeCategorySlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/^\/+|\/+$/g, "");
}

function splitCategoryPath(slug: string): string[] {
  return normalizeCategorySlug(slug)
    .split("/")
    .map((segment) => segment.trim())
    .filter(Boolean);
}

function normalizeFlag(value: PostSourceRow["is_published"] | undefined): 0 | 1 {
  if (typeof value === "number") return value > 0 ? 1 : 0;
  if (typeof value === "string") {
    const lowered = value.trim().toLowerCase();
    return lowered === "true" || lowered === "1" || lowered === "published" ? 1 : 0;
  }
  return value ? 1 : 0;
}

function normalizeCategoryDepth(
  slug: string,
  parentId?: string | null,
  parentSlug?: string | null,
) {
  const normalized = normalizeCategorySlug(slug);
  const normalizedParts = splitCategoryPath(normalized);
  if (normalizedParts.length > 2) {
    throw new Error(`category depth exceeds 2: ${slug}`);
  }
  if (normalizedParts.length === 1) {
    return {
      depth: 1 as const,
      slug: normalized,
      parentId: null,
      parentSlug: null,
    };
  }

  return {
    depth: 2 as const,
    slug: normalized,
    parentId: parentId ?? null,
    parentSlug: parentSlug ? normalizeCategorySlug(parentSlug) : (normalizedParts[0] ?? null),
  };
}

function normalizePostForSupabase(input: PostSourceRow): PostSourceRow {
  const rawPublished = normalizeFlag(input.is_published);
  return {
    ...input,
    id: input.id || randomUUID(),
    slug: (input.slug || "").trim().toLowerCase(),
    title: input.title?.trim() || "(untitled)",
    content: input.content ?? "",
    summary: (input.summary ?? "").trim(),
    category_path:
      input.category_path ??
      (() => {
        if (input.category && CATEGORY_PATH_RE.test(input.category))
          return input.category.toLowerCase().trim();
        return null;
      })(),
    hero_image_key: input.hero_image_key ?? null,
    tags: Array.isArray(input.tags) ? input.tags : [],
    is_published: rawPublished,
    published_at: rawPublished === 1 ? input.published_at : null,
  };
}

function inferMediaKindFromSource(postSlug: string, sourceUrl: string): string {
  const lower = sourceUrl.toLowerCase();
  if (lower.includes("/og") || lower.includes("/social")) return "og";
  if (postSlug.includes("og") && /\/og\//i.test(sourceUrl)) return "og";
  if (lower.includes("hero") || lower.includes("thumbnail") || lower.includes("cover"))
    return "hero";
  if (lower.endsWith(".pdf") || lower.includes("/pdf/")) return "pdf";
  return "body";
}

function collectMediaSources(sourceText: string): string[] {
  const media = new Set<string>();

  for (const match of sourceText.matchAll(SUPABASE_PUBLIC_RE)) {
    if (match[0]) media.add(match[0]);
  }

  for (const match of sourceText.matchAll(MARKDOWN_IMAGE_RE)) {
    if (match[1]) media.add(match[1]);
  }

  for (const match of sourceText.matchAll(HTML_IMG_SRC_RE)) {
    if (match[2]) media.add(match[2]);
  }

  return [...media];
}

function collectMediaRefsFromPosts(posts: PostSourceRow[]): MediaSourceRow[] {
  const media = [] as MediaSourceRow[];

  for (const post of posts) {
    for (const sourceUrl of collectMediaSources(post.content ?? "")) {
      media.push({
        id: `${post.id}-${randomUUID()}`,
        post_id: post.id,
        source_url: sourceUrl,
        kind: inferMediaKindFromSource(post.slug, sourceUrl),
        status: "pending",
        notes: "discovered-from-post-content",
      });
    }
  }

  return media;
}

export function normalizeCategoryRows(rows: CategorySourceRow[]): CategoryNormalized[] {
  const warnings: string[] = [];
  const rowsById = new Map<string, CategoryNormalized>();
  const rowsBySlug = new Map<string, CategoryNormalized>();

  for (const raw of rows) {
    if (!raw.id) continue;
    try {
      const base = normalizeCategoryDepth(raw.slug, raw.parent_id ?? null, raw.parent_slug ?? null);
      if (!CATEGORY_PATH_RE.test(base.slug)) {
        warnings.push(`invalid category slug format category=${raw.slug}`);
        continue;
      }

      const normalized = {
        id: raw.id,
        name: raw.name ?? raw.slug,
        slug: base.slug,
        parentId: base.parentId,
        parentSlug: base.parentSlug,
        depth: base.depth,
        createdAt: new Date().toISOString(),
      };

      rowsById.set(normalized.id, normalized);
      rowsBySlug.set(normalized.slug, normalized);
    } catch {
      warnings.push(`depth 규칙 위반 category=${raw.slug}`);
    }
  }

  for (const row of rowsById.values()) {
    if (row.depth === 1) {
      row.parentId = null;
      row.parentSlug = null;
      continue;
    }

    if (row.parentId) {
      const parent = rowsById.get(row.parentId);
      if (!parent) {
        warnings.push(`missing parent category for depth2 category=${row.slug}`);
        row.parentId = null;
      } else if (parent.depth !== 1) {
        warnings.push(`invalid parent depth for depth2 category=${row.slug}`);
        row.parentId = null;
      } else {
        row.parentSlug = parent.slug;
      }
      continue;
    }

    if (!row.parentSlug) {
      warnings.push(`missing parent slug for depth2 category=${row.slug}`);
      row.parentId = null;
      continue;
    }

    const parentBySlug = rowsBySlug.get(row.parentSlug);
    if (!parentBySlug || parentBySlug.depth !== 1) {
      warnings.push(`missing or invalid parent for category=${row.slug}`);
      row.parentId = null;
      continue;
    }

    row.parentId = parentBySlug.id;
  }

  return [...rowsById.values()];
}

export function loadSupabaseExport(raw: string): SupabaseExport {
  const parsed = JSON.parse(raw) as SupabaseExport;
  return {
    categories: parsed.categories ?? [],
    tags: parsed.tags ?? [],
    posts: parsed.posts ?? [],
    post_tags: parsed.post_tags ?? [],
    media_refs: parsed.media_refs ?? [],
  };
}

export function extractFromSupabase(
  input: SupabaseExport,
  runbookId = "runbook-local",
): ExtractResult {
  const rows = loadSupabaseExport(JSON.stringify(input));
  const categoryWarnings: string[] = [];
  let categories: CategoryNormalized[];
  try {
    categories = normalizeCategoryRows(rows.categories ?? []);
  } catch (error) {
    categoryWarnings.push(error instanceof Error ? error.message : "category normalization failed");
    categories = [];
  }

  const posts = (rows.posts ?? []).map(normalizePostForSupabase);
  const mediaRows = rows.media_refs ?? [];
  const discoveredMedia = collectMediaRefsFromPosts(posts);
  const mediaByPostSource = new Map<string, MediaSourceRow>();

  for (const media of [...mediaRows, ...discoveredMedia]) {
    const key = `${media.post_id}:${media.source_url}`;
    if (!mediaByPostSource.has(key)) {
      mediaByPostSource.set(key, media);
    }
  }

  const postTagPairs = (rows.post_tags ?? [])
    .filter((pair) => !!pair.post_id && !!pair.tag_id)
    .map((pair) => ({
      postId: pair.post_id,
      tagId: pair.tag_id,
    }));

  const media = [...mediaByPostSource.values()].map((media) => ({
    ...media,
    status: media.status ?? "pending",
    kind: media.kind ?? "body",
    notes: media.notes ?? undefined,
    target_r2_key: media.target_r2_key ?? undefined,
    width: media.width ?? null,
    height: media.height ?? null,
  }));

  return {
    categories,
    tags: rows.tags ?? [],
    posts,
    postTagPairs,
    media,
    summary: {
      runbookId,
      categoryCount: categories.length,
      tagCount: rows.tags?.length ?? 0,
      postCount: posts.length,
      categoryNormalizationWarnings: categoryWarnings,
    },
  };
}

export function extractFromFile(path: string, runbookId = "runbook-local"): ExtractResult {
  const raw = readFileSync(path, "utf8");
  return extractFromSupabase(loadSupabaseExport(raw), runbookId);
}
