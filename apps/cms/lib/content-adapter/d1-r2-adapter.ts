import type {
  CategoryListInput,
  CategoryRecord,
  ContractResult,
  ContentAdapter,
  ContentFailureCode,
  ContentListInput,
  MediaReference,
  PostRecord,
  TagRecord,
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

type CloudflareD1QueryResponse<T> = {
  success?: boolean;
  errors?: Array<{ message?: string }>;
  result?: Array<{ results?: T[]; success?: boolean }>;
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

type DbTagRow = {
  id: string;
  name: string;
  slug: string;
};

type CountRow = {
  total: number | string;
};

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

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
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

function cloudflareD1Config() {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const databaseId = process.env.CLOUDFLARE_D1_DATABASE_ID ?? process.env.D1_DATABASE_ID;
  const apiToken =
    process.env.CLOUDFLARE_D1_API_TOKEN ??
    process.env.CLOUDFLARE_API_TOKEN ??
    process.env.D1_API_TOKEN;
  if (!accountId || !databaseId || !apiToken) return;
  return { accountId, databaseId, apiToken };
}

function createCloudflareD1RestDatabase(): D1Database | undefined {
  const config = cloudflareD1Config();
  if (!config) return;
  const { accountId, databaseId, apiToken } = config;

  function statement(sql: string, boundParams: unknown[] = []): D1Prepared {
    async function query<T>(params: unknown[]): Promise<{ results: T[] }> {
      const response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ sql, params }),
        },
      );
      const payload = (await response.json()) as CloudflareD1QueryResponse<T>;
      const result = payload.result?.[0];
      if (!response.ok || payload.success === false || result?.success === false) {
        throw new Error(
          payload.errors?.[0]?.message ?? `Cloudflare D1 query failed with ${response.status}`,
        );
      }
      return { results: result?.results ?? [] };
    }

    return {
      bind: (...params: unknown[]) => statement(sql, params),
      all: <T>(...params: unknown[]) => query<T>(params.length > 0 ? params : boundParams),
      first: async <T>(...params: unknown[]) => {
        const rows = await query<T>(params.length > 0 ? params : boundParams);
        return rows.results[0] ?? null;
      },
      run: async (...params: unknown[]) => {
        await query<unknown>(params.length > 0 ? params : boundParams);
      },
    };
  }

  return {
    prepare: statement,
  };
}

function createLocalD1ProxyDatabase(): D1Database | undefined {
  const endpoint = process.env.CLOUDFLARE_D1_PROXY_URL?.trim();
  const token = process.env.CLOUDFLARE_D1_PROXY_TOKEN?.trim();
  if (!endpoint || !token) return;
  const proxyEndpoint = endpoint;
  const proxyToken = token;

  function statement(sql: string, boundParams: unknown[] = []): D1Prepared {
    async function query<T>(
      operation: "all" | "first" | "run",
      params: unknown[],
    ): Promise<{ results: T[] }> {
      const response = await fetch(proxyEndpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${proxyToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sql, params, operation }),
      });
      const payload = (await response.json()) as { results?: T[]; error?: string };
      if (!response.ok)
        throw new Error(payload.error ?? `Local D1 query failed with ${response.status}`);
      return { results: payload.results ?? [] };
    }

    return {
      bind: (...params: unknown[]) => statement(sql, params),
      all: <T>(...params: unknown[]) => query<T>("all", params.length > 0 ? params : boundParams),
      first: async <T>(...params: unknown[]) => {
        const rows = await query<T>("first", params.length > 0 ? params : boundParams);
        return rows.results?.[0] ?? null;
      },
      run: async (...params: unknown[]) => {
        await query<unknown>("run", params.length > 0 ? params : boundParams);
      },
    };
  }

  return { prepare: statement };
}

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
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

function normalizeSearchQuery(input?: string): string | undefined {
  const normalized = input?.trim().replace(/\s+/g, " ");
  if (!normalized) return;
  return normalized.slice(0, 120);
}

function escapeLikePattern(input: string) {
  return input.replaceAll("\\", "\\\\").replaceAll("%", "\\%").replaceAll("_", "\\_");
}

function addPostSearchWhere(where: string[], params: unknown[], query?: string) {
  if (!query) return;
  const pattern = `%${escapeLikePattern(query)}%`;
  where.push(
    `(
      p.title LIKE ? ESCAPE '\\'
      OR p.summary LIKE ? ESCAPE '\\'
      OR p.content LIKE ? ESCAPE '\\'
      OR c.name LIKE ? ESCAPE '\\'
      OR c.slug LIKE ? ESCAPE '\\'
      OR p.id IN (
        SELECT pt.post_id
        FROM post_tags pt
        JOIN tags t ON t.id = pt.tag_id
        WHERE t.slug LIKE ? ESCAPE '\\' OR t.name LIKE ? ESCAPE '\\'
      )
    )`,
  );
  params.push(pattern, pattern, pattern, pattern, pattern, pattern, pattern);
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
  if (/^https?:\/\//i.test(r2Key)) return r2Key;
  const base = (
    process.env.R2_PUBLIC_URL ??
    process.env.NEXT_PUBLIC_R2_PUBLIC_URL ??
    "https://pub-2eadf17a82cb46679204775b78a2c16a.r2.dev"
  ).replace(/\/+$/, "");
  return `${base}/${r2Key.replace(/^\/+/, "")}`;
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

function parseJson<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function getD1Binding(): D1Database | undefined {
  const globalBinding = (globalThis as { D1_DATABASE?: D1Database | string | null }).D1_DATABASE;
  if (isD1Database(globalBinding)) return globalBinding;

  const envBinding = process.env.D1_DATABASE;
  if (envBinding) {
    const parsed = parseJson<unknown>(envBinding, "");
    if (isD1Database(parsed)) return parsed;
  }

  return createLocalD1ProxyDatabase() ?? createCloudflareD1RestDatabase();
}

function normalizeCategorySlug(input?: string): string | undefined {
  if (!input) return;
  const normalized = input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9/]+/g, "-")
    .replace(/\/+/g, "/")
    .replace(/^-+|-+$/g, "")
    .replace(/\/-+|-+\//g, "/");
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
    query: normalizeSearchQuery(input.query),
    includeTotal: input.includeTotal ?? true,
    includeTags: input.includeTags ?? true,
    includeMedia: input.includeMedia ?? true,
  };
}

async function queryPostTotal(
  binding: D1Database,
  options: {
    publishedOnly: boolean;
    tagSlug?: string;
    categoryPath?: string;
    query?: string;
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
  addPostSearchWhere(where, params, options.query);

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
  addPostSearchWhere(where, params, input.query);

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
  const postIds = rows.results.map((row) => row.id);
  const [total, tagMap, mediaMap] = await Promise.all([
    input.includeTotal ? queryPostTotal(binding, input) : Promise.resolve(rows.results.length),
    input.includeTags
      ? loadPostTags(binding, postIds)
      : Promise.resolve(new Map<string, string[]>()),
    input.includeMedia
      ? loadMediaRefs(binding, postIds)
      : Promise.resolve(new Map<string, MediaReference[]>()),
  ]);

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

async function runD1CategoryById(binding: D1Database, id: string) {
  const row = await executeFirst<DbCategoryRow>(
    binding.prepare(
      "SELECT id, name, slug, parent_id, parent_slug, depth, created_at FROM categories WHERE id = ? LIMIT 1",
    ),
    [id],
  );
  return row ? mapCategoryRecord(row) : null;
}

function mapTagRecord(row: DbTagRow): TagRecord {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
  };
}

function idFromSlug(prefix: string, slug: string) {
  return `${prefix}_${slug.replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "")}`;
}

async function resolveCategoryId(binding: D1Database, categoryPath?: string | null) {
  const normalized = normalizeCategorySlug(categoryPath ?? undefined);
  if (!normalized) return null;
  const row = await executeFirst<{ id: string }>(
    binding.prepare("SELECT id FROM categories WHERE slug = ? LIMIT 1"),
    [normalized],
  );
  return row?.id ?? null;
}

async function upsertTagsForPost(binding: D1Database, postId: string, values: string[] = []) {
  const slugs = normalizeTagValues(values.map(normalizeSlug));
  await executeRun(binding.prepare("DELETE FROM post_tags WHERE post_id = ?"), [postId]);
  for (const slug of slugs) {
    const name = slug
      .split("-")
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
    const tagId = idFromSlug("tag", slug);
    await executeRun(
      binding.prepare(
        `INSERT INTO tags (id, name, slug)
         VALUES (?, ?, ?)
         ON CONFLICT(slug) DO UPDATE SET name = excluded.name`,
      ),
      [tagId, name || slug, slug],
    );
    await executeRun(
      binding.prepare("INSERT OR IGNORE INTO post_tags (post_id, tag_id) VALUES (?, ?)"),
      [postId, tagId],
    );
  }
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
      throw new Error("D1 binding is unavailable");
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

    if (!binding) throw new Error("D1 binding is unavailable");

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
      try {
        const normalized = normalizeListInput(input);
        const result = await listPostsInternal(normalized);
        return { ok: true, data: { items: result.posts, total: result.total } };
      } catch (error) {
        return failure("storage-failure", errorMessage(error, "D1 posts query failed"));
      }
    },

    async getPostBySlug(
      slug: string,
      options?: { includeUnpublished?: boolean },
    ): Promise<ContractResult<PostRecord | null>> {
      const normalized = normalizeSlug(slug);
      if (!normalized) return failure("validation-failure", "slug is required");

      if (!binding) return failure("storage-failure", "D1 binding is unavailable");

      try {
        const post = await runD1PostBySlug(binding, normalized, options?.includeUnpublished);
        return { ok: true, data: post ?? null };
      } catch (error) {
        return failure("storage-failure", errorMessage(error, "D1 post query failed"));
      }
    },

    async getPostsByTag(input: {
      tagSlug: string;
      publishedOnly: boolean;
      page?: number;
      limit?: number;
    }): Promise<ContractResult<{ items: PostRecord[]; total: number }>> {
      const tagSlug = normalizeSlug(input.tagSlug);
      if (!tagSlug) return failure("validation-failure", "tag slug is required");

      try {
        const result = await listPostsInternal({
          publishedOnly: Boolean(input.publishedOnly),
          page: normalizePage(input.page),
          limit: normalizeLimit(input.limit),
          tagSlug,
        });
        return { ok: true, data: { items: result.posts, total: result.total } };
      } catch (error) {
        return failure("storage-failure", errorMessage(error, "D1 tag posts query failed"));
      }
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

      try {
        const result = await listPostsInternal({
          publishedOnly: Boolean(input.publishedOnly),
          page: normalizePage(input.page),
          limit: normalizeLimit(input.limit),
          categoryPath,
        });
        return { ok: true, data: { items: result.posts, total: result.total } };
      } catch (error) {
        return failure("storage-failure", errorMessage(error, "D1 category posts query failed"));
      }
    },

    async listCategories(
      input: CategoryListInput,
    ): Promise<ContractResult<{ items: CategoryRecord[] }>> {
      try {
        const items = await listCategoriesInternal(input);
        return { ok: true, data: items };
      } catch (error) {
        return failure("storage-failure", errorMessage(error, "D1 categories query failed"));
      }
    },

    async listTags(): Promise<ContractResult<{ items: TagRecord[] }>> {
      if (!binding) return { ok: true, data: { items: [] } };
      try {
        const rows = await executeAll<DbTagRow>(
          binding.prepare("SELECT id, name, slug FROM tags ORDER BY slug ASC"),
          [],
        );
        return { ok: true, data: { items: rows.results.map(mapTagRecord) } };
      } catch (error) {
        return failure("storage-failure", errorMessage(error, "D1 tags query failed"));
      }
    },

    async createCategory(input: {
      category: Omit<CategoryRecord, "createdAt"> & { createdAt?: string };
      authorIdentity: string;
    }): Promise<ContractResult<CategoryRecord>> {
      if (!binding) return failure("upstream-failure", "D1 binding is not configured");
      const slug = normalizeCategorySlug(input.category.slug);
      if (!slug) return failure("validation-failure", "category slug must be depth 1 or 2");
      const parts = slug.split("/");
      const depth = parts.length === 2 ? 2 : 1;
      const name = input.category.name.trim() || parts.at(-1) || slug;
      const parentSlug = depth === 2 ? parts[0] : null;
      const parent = parentSlug
        ? await executeFirst<{ id: string }>(
            binding.prepare("SELECT id FROM categories WHERE slug = ? AND depth = 1 LIMIT 1"),
            [parentSlug],
          )
        : null;
      if (parentSlug && !parent?.id) {
        return failure("validation-failure", "parent category must exist before child category");
      }
      const id = input.category.id || idFromSlug("cat", slug);
      const createdAt = input.category.createdAt ?? new Date().toISOString();
      await executeRun(
        binding.prepare(
          `INSERT INTO categories (id, name, slug, parent_id, parent_slug, depth, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)
           ON CONFLICT(slug) DO UPDATE SET
             name = excluded.name,
             parent_id = excluded.parent_id,
             parent_slug = excluded.parent_slug,
             depth = excluded.depth`,
        ),
        [id, name, slug, parent?.id ?? null, parentSlug, depth, createdAt],
      );
      return {
        ok: true,
        data: {
          id,
          name,
          slug,
          parentId: parent?.id ?? null,
          parentSlug,
          depth,
          createdAt,
        },
      };
    },

    async updateCategory(input: {
      categoryId: string;
      category: Pick<CategoryRecord, "name" | "slug"> & { parentSlug?: string | null };
      authorIdentity: string;
    }): Promise<ContractResult<CategoryRecord>> {
      if (!binding) return failure("upstream-failure", "D1 binding is not configured");
      const categoryId = input.categoryId.trim();
      if (!categoryId) return failure("validation-failure", "categoryId is required");
      const current = await runD1CategoryById(binding, categoryId);
      if (!current) return failure("not-found", "category not found");

      const requestedSlug = normalizeCategorySlug(input.category.slug);
      if (!requestedSlug) {
        return failure("validation-failure", "category slug must be depth 1 or 2");
      }
      const requestedParts = requestedSlug.split("/");
      const requestedDepth = requestedParts.length === 2 ? 2 : 1;
      if (requestedDepth !== current.depth) {
        return failure("validation-failure", "category depth cannot be changed");
      }

      const name = input.category.name.trim() || requestedParts.at(-1) || requestedSlug;
      const parentSlug = requestedDepth === 2 ? requestedParts[0] : null;
      const parent = parentSlug
        ? await executeFirst<{ id: string }>(
            binding.prepare("SELECT id FROM categories WHERE slug = ? AND depth = 1 LIMIT 1"),
            [parentSlug],
          )
        : null;
      if (parentSlug && !parent?.id) {
        return failure("validation-failure", "parent category must exist before child category");
      }

      const conflict = await executeFirst<{ id: string }>(
        binding.prepare("SELECT id FROM categories WHERE slug = ? AND id <> ? LIMIT 1"),
        [requestedSlug, categoryId],
      );
      if (conflict?.id) return failure("conflict", "category slug already exists");

      await executeRun(
        binding.prepare(
          `UPDATE categories
             SET name = ?,
                 slug = ?,
                 parent_id = ?,
                 parent_slug = ?,
                 depth = ?
           WHERE id = ?`,
        ),
        [name, requestedSlug, parent?.id ?? null, parentSlug, requestedDepth, categoryId],
      );

      if (current.depth === 1 && current.slug !== requestedSlug) {
        await executeRun(
          binding.prepare(
            `UPDATE categories
               SET parent_slug = ?,
                   parent_id = ?,
                   slug = ? || substr(slug, length(?) + 1)
             WHERE parent_slug = ? AND depth = 2`,
          ),
          [requestedSlug, categoryId, requestedSlug, current.slug, current.slug],
        );
      }

      const updated = await runD1CategoryById(binding, categoryId);
      if (!updated) return failure("not-found", "category not found after update");
      return { ok: true, data: updated };
    },

    async deleteCategory(input: {
      categoryId: string;
      authorIdentity: string;
    }): Promise<ContractResult<{ id: string; slug: string }>> {
      if (!binding) return failure("upstream-failure", "D1 binding is not configured");
      const categoryId = input.categoryId.trim();
      if (!categoryId) return failure("validation-failure", "categoryId is required");

      const current = await runD1CategoryById(binding, categoryId);
      if (!current) return failure("not-found", "category not found");

      if (current.depth === 1) {
        const childCount = await executeFirst<CountRow>(
          binding.prepare("SELECT COUNT(1) AS total FROM categories WHERE parent_id = ?"),
          [categoryId],
        );
        if (Number(childCount?.total ?? 0) > 0) {
          return failure("conflict", "delete child categories before deleting the parent category");
        }
      }

      const postCount = await executeFirst<CountRow>(
        binding.prepare("SELECT COUNT(1) AS total FROM posts WHERE category_id = ?"),
        [categoryId],
      );
      if (Number(postCount?.total ?? 0) > 0) {
        return failure("conflict", "category is used by posts");
      }

      await executeRun(binding.prepare("DELETE FROM categories WHERE id = ?"), [categoryId]);
      return { ok: true, data: { id: categoryId, slug: current.slug } };
    },

    async createTag(input: {
      tag: TagRecord;
      authorIdentity: string;
    }): Promise<ContractResult<TagRecord>> {
      if (!binding) return failure("upstream-failure", "D1 binding is not configured");
      const slug = normalizeSlug(input.tag.slug);
      if (!slug) return failure("validation-failure", "tag slug is required");
      const name = input.tag.name.trim() || slug;
      const id = input.tag.id || idFromSlug("tag", slug);
      await executeRun(
        binding.prepare(
          `INSERT INTO tags (id, name, slug)
           VALUES (?, ?, ?)
           ON CONFLICT(slug) DO UPDATE SET name = excluded.name`,
        ),
        [id, name, slug],
      );
      return { ok: true, data: { id, name, slug } };
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
      const categoryId =
        prepared.categoryId ?? (await resolveCategoryId(binding, prepared.categoryPath));

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
        categoryId,
        prepared.heroImageKey ?? null,
        publishedAt,
        now,
        prepared.isPublished,
        prepared.viewCount,
      ]);
      await upsertTagsForPost(binding, prepared.id, prepared.tags ?? []);

      return {
        ok: true,
        data: {
          ...prepared,
          categoryId,
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
      const categoryId =
        merged.categoryId ?? (await resolveCategoryId(binding, merged.categoryPath));
      const prepared = {
        ...merged,
        slug: normalizeSlug(merged.slug),
        categoryId,
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
      await upsertTagsForPost(binding, prepared.id, prepared.tags ?? []);

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
