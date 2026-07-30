import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  getPublishedPosts as getPublishedPostsFromMarkdown,
  parsePostFile,
  validateContentCollection,
} from "@blog-platform/markdown";

import type {
  CategoryListInput,
  CategoryRecord,
  ContractResult,
  ContentAdapter,
  ContentFailureCode,
  ContentListInput,
  MediaReference,
  PostRecord,
} from "./content-adapter.interface";

type D1Prepared = {
  all<T>(...args: unknown[]): Promise<{ results: T[] }>;
  first<T>(...args: unknown[]): Promise<T | undefined | null>;
  run(...args: unknown[]): Promise<unknown>;
  bind?: (...args: unknown[]) => D1Prepared;
};

type D1Database = {
  prepare(sql: string): D1Prepared;
};

type DbPostRow = {
  id: string;
  slug: string;
  title: string;
  content: string;
  summary: string;
  category_id: string | null;
  hero_image_key: string | null;
  published_at: string | null;
  updated_at: string;
  is_published: number;
  view_count: number;
  category_slug: string | null;
};

type DbPostTagRow = {
  post_id: string;
  slug: string;
};

type DbMediaRefRow = {
  id: string;
  post_id: string;
  r2_key: string;
  kind: string;
  width: number | null;
  height: number | null;
};

type DbCategoryRow = {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  parent_slug: string | null;
  depth: number;
  created_at: string;
};

type LegacyPostFallback = PostRecord & {
  category: string | null;
  tags: string[];
  mediaRefs: MediaReference[];
};

type CountRow = {
  total: number | string;
};

const adapterDirname = path.dirname(fileURLToPath(import.meta.url));

function failure(code: ContentFailureCode, message: string): ContractResult<never> {
  return {
    ok: false,
    error: {
      code,
      message,
      retryable:
        code === "retryable-failure" || code === "storage-failure" || code === "upstream-failure",
    },
  };
}

function isObjectValue(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isD1Database(value: unknown): value is D1Database {
  return isObjectValue(value) && typeof value.prepare === "function";
}

function executeAll<T>(statement: D1Prepared, params: unknown[]) {
  return statement.bind ? statement.bind(...params).all<T>() : statement.all<T>(...params);
}

function executeFirst<T>(statement: D1Prepared, params: unknown[]) {
  return statement.bind ? statement.bind(...params).first<T>() : statement.first<T>(...params);
}

function executeRun(statement: D1Prepared, params: unknown[]) {
  return statement.bind ? statement.bind(...params).run() : statement.run(...params);
}

function nowSlug(value: string) {
  return value.trim().toLowerCase();
}

function normalizeSlug(value: string) {
  return value.trim().toLowerCase();
}

function normalizePage(input: unknown): number {
  const page = typeof input === "number" && Number.isFinite(input) ? Math.floor(input) : 1;
  return page > 0 ? page : 1;
}

function normalizeLimit(input: unknown): number {
  const limit = typeof input === "number" && Number.isFinite(input) ? Math.floor(input) : 20;
  if (limit <= 0) return 20;
  return Math.min(100, limit);
}

function isPublishedValue(value: unknown): value is 0 | 1 {
  return value === 0 || value === 1;
}

function validatePostInput(input: PostRecord) {
  if (!input.slug || !/^[a-z0-9-]+$/.test(input.slug)) {
    return failure("validation-failure", "slug must contain only a-z0-9-");
  }
  if (!isPublishedValue(input.isPublished)) {
    return failure("validation-failure", "isPublished must be 0 or 1");
  }
  if (input.isPublished === 1 && !input.publishedAt) {
    return failure("validation-failure", "publishedAt is required when isPublished=1");
  }
  if (!input.title?.trim()) {
    return failure("validation-failure", "title is required");
  }
  if (!input.content?.trim()) {
    return failure("validation-failure", "content is required");
  }
  return null;
}

function rowToPost(row: DbPostRow): PostRecord {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    content: row.content,
    summary: row.summary,
    categoryId: row.category_id,
    categoryPath: row.category_slug ?? undefined,
    heroImageKey: row.hero_image_key,
    publishedAt: row.published_at,
    updatedAt: row.updated_at,
    isPublished: isPublishedValue(row.is_published) ? row.is_published : 0,
    viewCount: row.view_count,
  };
}

function mapCategoryRecord(row: DbCategoryRow): CategoryRecord {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    parentId: row.parent_id,
    parentSlug: row.parent_slug,
    depth: row.depth === 2 ? 2 : 1,
    createdAt: row.created_at,
  };
}

function normalizeTagValues(values: string[]) {
  return [...new Set(values.map((tag) => tag.trim().toLowerCase()).filter(Boolean))].sort();
}

async function loadPostTags(binding: D1Database, postIds: string[]) {
  if (postIds.length === 0) return new Map<string, string[]>();

  const placeholders = postIds.map(() => "?").join(", ");
  const rows = await executeAll<DbPostTagRow>(
    binding.prepare(
      `SELECT pt.post_id, t.slug
       FROM post_tags pt
       JOIN tags t ON t.id = pt.tag_id
       WHERE pt.post_id IN (${placeholders})`,
    ),
    postIds,
  );

  const grouped = new Map<string, string[]>();
  for (const row of rows.results) {
    const list = grouped.get(row.post_id) ?? [];
    list.push(row.slug);
    grouped.set(row.post_id, list);
  }

  return new Map(
    [...grouped.entries()].map(([postId, tags]) => [postId, normalizeTagValues(tags)]),
  );
}

function parseMediaKind(value: string): MediaReference["kind"] {
  if (
    value === "hero" ||
    value === "body" ||
    value === "og" ||
    value === "pdf" ||
    value === "attachment"
  ) {
    return value;
  }
  return "body";
}

function r2PublicUrl(r2Key: string) {
  const base = process.env.R2_PUBLIC_URL?.replace(/\/+$/, "");
  return base ? `${base}/${r2Key.replace(/^\/+/, "")}` : r2Key;
}

async function loadMediaRefs(binding: D1Database, postIds: string[]) {
  if (postIds.length === 0) return new Map<string, MediaReference[]>();

  const placeholders = postIds.map(() => "?").join(", ");
  const rows = await executeAll<DbMediaRefRow>(
    binding.prepare(
      `SELECT id, post_id, r2_key, kind, width, height
       FROM media_refs
       WHERE post_id IN (${placeholders})
       ORDER BY kind ASC, id ASC`,
    ),
    postIds,
  );

  const grouped = new Map<string, MediaReference[]>();
  for (const row of rows.results) {
    const list = grouped.get(row.post_id) ?? [];
    list.push({
      id: row.id,
      postId: row.post_id,
      r2Key: row.r2_key,
      r2Url: r2PublicUrl(row.r2_key),
      kind: parseMediaKind(row.kind),
      width: row.width,
      height: row.height,
    });
    grouped.set(row.post_id, list);
  }

  return grouped;
}

async function discoverContentRoot(): Promise<string> {
  const candidates = [
    process.cwd(),
    path.join(process.cwd(), "apps/cms"),
    path.join(process.cwd(), "apps/blog"),
    path.join(adapterDirname, "../../../../"),
  ];

  for (const base of candidates) {
    const folder = path.join(base, "content");
    try {
      await readdir(folder);
      return folder;
    } catch {
      // continue
    }
  }
  return path.resolve(process.cwd(), "../../content");
}

async function readFileText(filePath: string) {
  return readFile(filePath, "utf8");
}

function parseJson<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

async function fallbackPostsFromMarkdown(): Promise<Array<LegacyPostFallback>> {
  const contentRoot = await discoverContentRoot();
  const postsDir = path.join(contentRoot, "posts");
  const authorsPath = path.join(contentRoot, "authors");
  const categoriesPath = path.join(contentRoot, "categories.json");
  const tagsPath = path.join(contentRoot, "tags.json");
  const sitePath = path.join(contentRoot, "site.json");

  const [rawPosts, authors, categoriesJson, tagsJson, siteJson] = await Promise.all([
    readdir(postsDir, { withFileTypes: true }).catch(() => []),
    readdir(authorsPath, { withFileTypes: true }).catch(() => []),
    readFileText(categoriesPath).catch(() => "[]"),
    readFileText(tagsPath).catch(() => "[]"),
    readFileText(sitePath).catch(() => "{}"),
  ]);

  const files = await Promise.all(
    rawPosts
      .filter((entry) => entry.isFile() && entry.name.endsWith(".mdx"))
      .map((entry) =>
        readFileText(path.join(postsDir, entry.name)).then((content) => ({
          file: entry.name,
          source: content,
        })),
      ),
  );

  const collectionResult = validateContentCollection({
    posts: files.map((entry) => ({ path: `content/posts/${entry.file}`, source: entry.source })),
    authors: authors
      .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
      .map((entry) => ({ path: `content/authors/${entry.name}`, source: "{}" })),
    categoriesJson,
    tagsJson,
    siteJson,
  });

  if (!collectionResult.success || !collectionResult.data) {
    return [];
  }

  const postList = getPublishedPostsFromMarkdown(collectionResult.data);

  const posts: Array<LegacyPostFallback> = [];
  for (const post of postList) {
    const sourcePath = path.join(contentRoot, post.path);
    const source = await readFileText(sourcePath).catch(() => "");
    const parsed = parsePostFile({ path: post.path, source });
    posts.push({
      id: createHash("md5").update(post.path).digest("hex"),
      slug: post.slug,
      title: post.title,
      content: parsed.success && parsed.data ? parsed.data.body : post.body,
      summary: post.excerpt ?? "",
      categoryId: null,
      heroImageKey: post.coverImage ?? null,
      publishedAt: post.publishedAt,
      updatedAt: post.updatedAt ?? new Date().toISOString(),
      isPublished: 1,
      viewCount: 0,
      categoryPath: post.category ?? null,
      category: post.category ?? null,
      tags: post.tags ?? [],
      mediaRefs: [],
    });
  }

  return posts;
}

function getD1Binding(): D1Database | undefined {
  const globalBinding = (globalThis as { D1_DATABASE?: D1Database | string | null }).D1_DATABASE;
  if (isD1Database(globalBinding)) return globalBinding;

  const envBinding = process.env.D1_DATABASE;
  if (!envBinding) return;
  const parsed = parseJson<unknown>(envBinding, "");
  return isD1Database(parsed) ? parsed : undefined;
}

function normalizeCategorySlug(input?: string): string | undefined {
  if (!input) return;
  const normalized = normalizeSlug(input);
  if (!/^[a-z0-9-]+(?:\/[a-z0-9-]+)?$/.test(normalized)) return;
  return normalized;
}

function normalizeListInput(input: ContentListInput) {
  return {
    publishedOnly: Boolean(input.publishedOnly),
    page: normalizePage(input.page),
    limit: normalizeLimit(input.limit),
    tagSlug: input.tagSlug ? normalizeSlug(input.tagSlug) : undefined,
    categoryPath: input.categoryPath ? normalizeCategorySlug(input.categoryPath) : undefined,
  };
}

async function loadFallbackRecords() {
  const posts = await fallbackPostsFromMarkdown();
  const categoriesRaw = parseJson<unknown[]>(
    await readFileText(path.join(await discoverContentRoot(), "categories.json")).catch(() => "[]"),
    [],
  );
  const categories = Array.isArray(categoriesRaw)
    ? (categoriesRaw as Array<{
        id: string;
        slug: string;
        name: string;
        parent_id?: string | null;
        parent_slug?: string | null;
        depth: 1 | 2;
      }>)
    : [];

  return {
    posts,
    categories: categories.map((category) => ({
      id: category.id || createHash("md5").update(category.slug).digest("hex"),
      name: category.name,
      slug: category.slug,
      parentId: category.parent_id ?? null,
      parentSlug: category.parent_slug ?? null,
      depth: category.depth,
      createdAt: new Date().toISOString(),
    })),
  };
}

async function queryPostTotal(
  binding: D1Database,
  options: {
    publishedOnly: boolean;
    tagSlug?: string;
    categoryPath?: string;
  },
) {
  const where: string[] = ["1=1"];
  const params: unknown[] = [];

  if (options.publishedOnly) {
    where.push("p.is_published = 1");
    where.push("p.published_at IS NOT NULL");
  }
  if (options.tagSlug) {
    where.push(
      "p.id IN (SELECT pt.post_id FROM post_tags pt JOIN tags t ON t.id = pt.tag_id WHERE t.slug = ?)",
    );
    params.push(options.tagSlug);
  }
  if (options.categoryPath) {
    where.push("c.slug = ?");
    params.push(options.categoryPath);
  }

  const countSql = `SELECT COUNT(1) AS total FROM posts p LEFT JOIN categories c ON c.id = p.category_id WHERE ${where.join(" AND ")}`;
  const row = await executeFirst<CountRow>(binding.prepare(countSql), params);
  const total = row ? Number(row.total) : 0;
  return Number.isFinite(total) ? total : 0;
}

async function runD1Posts(binding: D1Database, input: ReturnType<typeof normalizeListInput>) {
  const where: string[] = ["1=1"];
  const params: unknown[] = [];

  if (input.publishedOnly) {
    where.push("p.is_published = 1");
    where.push("p.published_at IS NOT NULL");
  }
  if (input.tagSlug) {
    where.push(
      "p.id IN (SELECT pt.post_id FROM post_tags pt JOIN tags t ON t.id = pt.tag_id WHERE t.slug = ?)",
    );
    params.push(input.tagSlug);
  }

  if (input.categoryPath) {
    where.push("c.slug = ?");
    params.push(input.categoryPath);
  }

  const limit = input.page && input.limit ? input.limit : undefined;
  const offset =
    input.page && input.limit ? (normalizePage(input.page) - 1) * normalizeLimit(input.limit) : 0;

  const dataSql = [
    "SELECT p.*, c.slug AS category_slug",
    "FROM posts p",
    "LEFT JOIN categories c ON c.id = p.category_id",
    `WHERE ${where.join(" AND ")}`,
    "ORDER BY p.published_at DESC, p.updated_at DESC",
    ...(limit ? ["LIMIT ? OFFSET ?"] : []),
  ].join(" ");

  const rows = await executeAll<DbPostRow>(
    binding.prepare(dataSql),
    limit ? [...params, limit, offset] : params,
  );
  const total = await queryPostTotal(binding, input);
  const tagMap = await loadPostTags(
    binding,
    rows.results.map((row) => row.id),
  );
  const mediaMap = await loadMediaRefs(
    binding,
    rows.results.map((row) => row.id),
  );

  return {
    posts: rows.results.map((row) => ({
      ...rowToPost(row),
      tags: tagMap.get(row.id) ?? [],
      mediaRefs: mediaMap.get(row.id) ?? [],
    })),
    total,
  };
}

async function runD1PostBySlug(binding: D1Database, slug: string, includeUnpublished?: boolean) {
  const where: string[] = ["p.slug = ?"];
  const params: unknown[] = [slug];
  if (!includeUnpublished) {
    where.push("p.is_published = 1");
    where.push("p.published_at IS NOT NULL");
  }

  const sql = [
    "SELECT p.*, c.slug AS category_slug",
    "FROM posts p",
    "LEFT JOIN categories c ON c.id = p.category_id",
    `WHERE ${where.join(" AND ")}`,
    "LIMIT 1",
  ].join(" ");

  const row = await executeFirst<DbPostRow>(binding.prepare(sql), params);
  if (!row) return;
  const tagsByPostId = await loadPostTags(binding, [row.id]);
  const mediaByPostId = await loadMediaRefs(binding, [row.id]);

  return {
    ...rowToPost(row),
    tags: tagsByPostId.get(row.id) ?? [],
    mediaRefs: mediaByPostId.get(row.id) ?? [],
  };
}

async function runD1PostById(binding: D1Database, id: string) {
  const row = await executeFirst<{ id: string }>(
    binding.prepare("SELECT id FROM posts WHERE id = ? LIMIT 1"),
    [id],
  );
  return row?.id;
}

function normalizePostRecord(input: PostRecord): PostRecord {
  return {
    ...input,
    slug: normalizeSlug(input.slug),
    title: input.title.trim(),
    summary: input.summary.trim(),
    content: input.content.trim(),
    categoryId: input.categoryId ?? null,
    categoryPath: input.categoryPath ?? null,
    heroImageKey: input.heroImageKey ?? null,
    publishedAt: input.isPublished === 1 ? (input.publishedAt ?? null) : null,
    updatedAt: new Date().toISOString(),
    isPublished: input.isPublished,
    viewCount:
      Number.isFinite(input.viewCount) && input.viewCount >= 0 ? Math.floor(input.viewCount) : 0,
  };
}

function normalizeMediaRef(input: MediaReference): MediaReference {
  return {
    ...input,
    kind: input.kind,
    width: input.width ?? null,
    height: input.height ?? null,
  };
}

export function createD1R2ContentAdapter(): ContentAdapter {
  const binding = getD1Binding();

  async function listPostsInternal(
    input: ContentListInput,
  ): Promise<{ posts: PostRecord[]; total: number }> {
    if (!binding) {
      const fallback = await loadFallbackRecords();
      const normalized = normalizeListInput(input);
      const posts = fallback.posts
        .filter((post) => !normalized.publishedOnly || post.isPublished === 1)
        .filter((post) =>
          normalized.tagSlug
            ? post.tags.map((tag) => nowSlug(tag)).includes(normalized.tagSlug)
            : true,
        )
        .filter((post) =>
          normalized.categoryPath
            ? post.categoryPath
              ? nowSlug(post.categoryPath) === normalized.categoryPath
              : false
            : true,
        )
        .sort((a, b) => {
          const aDate = a.publishedAt ?? a.updatedAt;
          const bDate = b.publishedAt ?? b.updatedAt;
          return bDate.localeCompare(aDate);
        });

      const start = (normalized.page - 1) * normalized.limit;
      const total = posts.length;
      const paginated = posts.slice(start, start + normalized.limit);
      return { posts: paginated, total };
    }

    const normalized = normalizeListInput(input);
    if (normalized.limit === 0) {
      return { posts: [], total: 0 };
    }
    return runD1Posts(binding, normalized);
  }

  async function listCategoriesInternal(
    input: CategoryListInput,
  ): Promise<{ items: CategoryRecord[] }> {
    if (!isObjectValue(input)) {
      return { items: [] };
    }

    const depth = input.depth === 1 || input.depth === 2 ? input.depth : 1;
    const parentSlug = input.parentSlug ? normalizeCategorySlug(input.parentSlug) : undefined;

    if (!binding) {
      const fallback = await loadFallbackRecords();
      const items = fallback.categories
        .filter((category) => category.depth === depth)
        .filter((category) => (parentSlug ? category.parentSlug === parentSlug : true))
        .map((category) => ({
          id: category.id,
          name: category.name,
          slug: category.slug,
          parentId: category.parentId,
          parentSlug: category.parentSlug,
          depth,
          createdAt: category.createdAt,
        }))
        .sort((a, b) => a.slug.localeCompare(b.slug));

      return { items };
    }

    const categorySql = [
      "SELECT id, name, slug, parent_id, parent_slug, depth, created_at",
      "FROM categories",
      "WHERE depth = ?",
      parentSlug ? "AND parent_slug = ?" : "",
      "ORDER BY slug ASC",
    ].join(" ");
    const rows = await executeAll<DbCategoryRow>(
      binding.prepare(categorySql),
      parentSlug ? [depth, parentSlug] : [depth],
    );

    return {
      items: rows.results.map(mapCategoryRecord),
    };
  }

  return {
    async listPosts(
      input: ContentListInput,
    ): Promise<ContractResult<{ items: PostRecord[]; total: number }>> {
      const normalized = normalizeListInput(input);
      const result = await listPostsInternal(normalized);
      return { ok: true, data: { items: result.posts, total: result.total } };
    },

    async getPostBySlug(
      slug: string,
      options?: { includeUnpublished?: boolean },
    ): Promise<ContractResult<PostRecord | null>> {
      const normalized = normalizeSlug(slug);
      if (!normalized) return failure("validation-failure", "slug is required");

      if (!binding) {
        const fallback = await loadFallbackRecords();
        const found = fallback.posts.find((post) => nowSlug(post.slug) === normalized);
        const visible = options?.includeUnpublished
          ? found
          : found && found.isPublished === 1
            ? found
            : null;
        return { ok: true, data: visible ?? null };
      }

      const post = await runD1PostBySlug(binding, normalized, options?.includeUnpublished);
      return { ok: true, data: post ?? null };
    },

    async getPostsByTag(input: {
      tagSlug: string;
      publishedOnly: boolean;
      page?: number;
      limit?: number;
    }): Promise<ContractResult<{ items: PostRecord[]; total: number }>> {
      const tagSlug = normalizeSlug(input.tagSlug);
      if (!tagSlug) return failure("validation-failure", "tag slug is required");

      const result = await listPostsInternal({
        publishedOnly: Boolean(input.publishedOnly),
        page: normalizePage(input.page),
        limit: normalizeLimit(input.limit),
        tagSlug,
      });
      return { ok: true, data: { items: result.posts, total: result.total } };
    },

    async getPostsByCategoryPath(input: {
      categoryPath: string;
      publishedOnly: boolean;
      page?: number;
      limit?: number;
    }): Promise<ContractResult<{ items: PostRecord[]; total: number }>> {
      const categoryPath = normalizeCategorySlug(input.categoryPath);
      if (!categoryPath) {
        return failure("validation-failure", "categoryPath must be depth 1 or 2");
      }

      const result = await listPostsInternal({
        publishedOnly: Boolean(input.publishedOnly),
        page: normalizePage(input.page),
        limit: normalizeLimit(input.limit),
        categoryPath,
      });
      return { ok: true, data: { items: result.posts, total: result.total } };
    },

    async listCategories(
      input: CategoryListInput,
    ): Promise<ContractResult<{ items: CategoryRecord[] }>> {
      const items = await listCategoriesInternal(input);
      return { ok: true, data: items };
    },

    async createPost(input: {
      post: PostRecord;
      authorIdentity: string;
    }): Promise<ContractResult<PostRecord>> {
      const prepared = normalizePostRecord(input.post);
      const invalid = validatePostInput(prepared);
      if (invalid) return invalid;
      if (!binding) return failure("upstream-failure", "D1 binding is not configured");

      const existing = await runD1PostBySlug(binding, prepared.slug, true);
      if (existing && existing.id !== prepared.id) {
        return failure("conflict", "post slug already exists");
      }

      const now = new Date().toISOString();
      const publishedAt = prepared.isPublished === 1 ? (prepared.publishedAt ?? null) : null;

      const insert = binding.prepare(
        `INSERT INTO posts (id, slug, title, content, summary, category_id, hero_image_key, published_at, updated_at, is_published, view_count)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           slug = excluded.slug,
           title = excluded.title,
           content = excluded.content,
           summary = excluded.summary,
           category_id = excluded.category_id,
           hero_image_key = excluded.hero_image_key,
           published_at = excluded.published_at,
           updated_at = excluded.updated_at,
           is_published = excluded.is_published,
           view_count = excluded.view_count`,
      );
      await executeRun(insert, [
        prepared.id,
        prepared.slug,
        prepared.title,
        prepared.content,
        prepared.summary,
        prepared.categoryId ?? null,
        prepared.heroImageKey ?? null,
        publishedAt,
        now,
        prepared.isPublished,
        prepared.viewCount,
      ]);

      return {
        ok: true,
        data: {
          ...prepared,
          updatedAt: now,
        },
      };
    },

    async updatePost(input: {
      slug: string;
      post: Partial<PostRecord>;
      authorIdentity: string;
    }): Promise<ContractResult<PostRecord>> {
      const normalizedSlug = normalizeSlug(input.slug);
      if (!normalizedSlug) return failure("validation-failure", "slug is required");
      if (!binding) return failure("upstream-failure", "D1 binding is not configured");

      const current = await runD1PostBySlug(binding, normalizedSlug, true);
      if (!current) return failure("not-found", "post not found");

      const merged: PostRecord = {
        ...current,
        ...input.post,
        id: current.id,
        slug: input.post.slug ? normalizeSlug(input.post.slug) : current.slug,
      };

      const invalid = validatePostInput(merged);
      if (invalid) return invalid;

      if (merged.slug !== current.slug) {
        const conflict = await runD1PostBySlug(binding, merged.slug, true);
        if (conflict && conflict.id !== current.id) {
          return failure("conflict", "post slug already exists");
        }
      }

      const now = new Date().toISOString();
      const publishedAt = merged.isPublished === 1 ? (merged.publishedAt ?? null) : null;
      const prepared = {
        ...merged,
        slug: normalizeSlug(merged.slug),
        categoryId: merged.categoryId ?? null,
        heroImageKey: merged.heroImageKey ?? null,
        updatedAt: now,
        publishedAt,
        title: merged.title.trim(),
        content: merged.content.trim(),
        summary: merged.summary.trim(),
        viewCount:
          Number.isFinite(merged.viewCount) && merged.viewCount >= 0
            ? Math.floor(merged.viewCount)
            : 0,
      };

      const statement = binding.prepare(
        `UPDATE posts
           SET slug = ?,
               title = ?,
               content = ?,
               summary = ?,
               category_id = ?,
               hero_image_key = ?,
               published_at = ?,
               updated_at = ?,
               is_published = ?,
               view_count = ?
         WHERE id = ?`,
      );
      await executeRun(statement, [
        prepared.slug,
        prepared.title,
        prepared.content,
        prepared.summary,
        prepared.categoryId,
        prepared.heroImageKey,
        prepared.publishedAt,
        prepared.updatedAt,
        prepared.isPublished,
        prepared.viewCount,
        prepared.id,
      ]);

      return { ok: true, data: prepared };
    },

    async deletePost(input: {
      slug: string;
      authorIdentity: string;
    }): Promise<ContractResult<{ slug: string }>> {
      const normalized = normalizeSlug(input.slug);
      if (!normalized) return failure("validation-failure", "slug is required");
      if (!binding) return failure("upstream-failure", "D1 binding is not configured");

      const current = await runD1PostBySlug(binding, normalized, true);
      if (!current) return failure("not-found", "post not found");

      const prepared = binding.prepare("DELETE FROM posts WHERE id = ?");
      await executeRun(prepared, [current.id]);
      return { ok: true, data: { slug: normalized } };
    },

    async upsertMediaRef(input: {
      mediaRef: MediaReference;
      authorIdentity: string;
    }): Promise<ContractResult<MediaReference>> {
      const rawMediaRef = normalizeMediaRef(input.mediaRef);
      if (!rawMediaRef.id || !rawMediaRef.postId || !rawMediaRef.r2Key) {
        return failure("validation-failure", "postId and r2Key are required");
      }
      if (!binding) return failure("storage-failure", "D1 binding is not configured");

      const postExists = await runD1PostById(binding, rawMediaRef.postId);
      if (!postExists) {
        return failure("not-found", "postId does not exist");
      }

      const now = new Date().toISOString();
      const prepared = binding.prepare(
        `INSERT INTO media_refs (id, post_id, r2_key, kind, width, height, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           post_id = excluded.post_id,
           r2_key = excluded.r2_key,
           kind = excluded.kind,
           width = excluded.width,
           height = excluded.height,
           created_at = excluded.created_at`,
      );
      await executeRun(prepared, [
        rawMediaRef.id,
        rawMediaRef.postId,
        rawMediaRef.r2Key,
        parseMediaKind(rawMediaRef.kind),
        rawMediaRef.width ?? null,
        rawMediaRef.height ?? null,
        now,
      ]);

      return {
        ok: true,
        data: {
          ...rawMediaRef,
          kind: parseMediaKind(rawMediaRef.kind),
        },
      };
    },

    async deleteMediaRef(input: {
      mediaRefId: string;
      authorIdentity: string;
    }): Promise<ContractResult<{ id: string }>> {
      if (!input.mediaRefId) return failure("validation-failure", "mediaRefId is required");
      if (!binding) return failure("upstream-failure", "D1 binding is not configured");

      const prepared = binding.prepare("DELETE FROM media_refs WHERE id = ?");
      await executeRun(prepared, [input.mediaRefId]);
      return { ok: true, data: { id: input.mediaRefId } };
    },
  };
}
