import type { ExtractResult } from "./extract-from-supabase";
import type { MediaMappingRecord } from "./map-media";
import { createD1R2ContentAdapter } from "../content-adapter/d1-r2-adapter";

export type MigrationCommand = {
  phase: "category" | "tag" | "post" | "post_tag" | "media_ref" | "media" | "finalize";
  action: "upsert" | "update" | "delete";
  sql: string;
  params: Array<string | number | null | boolean>;
};

export type ImportPlan = {
  runbookId: string;
  generatedAt: string;
  estimatedCommands: MigrationCommand[];
  commandOrder: MigrationCommand["phase"][];
};

export type MigrationRecord = {
  phase: MigrationCommand["phase"];
  id: string;
  status: "queued" | "succeeded" | "skipped" | "failed";
  summary: string;
};

export type ImportSummary = {
  runbookId: string;
  commandCount: number;
  succeeded: number;
  skipped: number;
  failed: number;
  mediaFailures: MigrationRecord[];
  records: MigrationRecord[];
};

type D1Prepared = {
  bind?(...args: unknown[]): D1Prepared;
  run(...args: unknown[]): Promise<unknown>;
};

type D1Database = {
  prepare(sql: string): D1Prepared;
};

function isD1Database(value: unknown): value is D1Database {
  return (
    typeof value === "object" && value !== null && "prepare" in (value as Record<string, unknown>)
  );
}

function getD1Binding(): D1Database | undefined {
  const globalBinding = (globalThis as { D1_DATABASE?: D1Database | string | null }).D1_DATABASE;
  if (isD1Database(globalBinding)) return globalBinding;

  const envBinding = process.env.D1_DATABASE;
  if (!envBinding) return;

  try {
    const parsed = JSON.parse(envBinding) as unknown;
    return isD1Database(parsed) ? parsed : undefined;
  } catch {
    return;
  }
}

function normalizeParam(input: string | number | null | boolean | undefined) {
  if (typeof input === "boolean") return input ? 1 : 0;
  return input;
}

async function executeD1Command(binding: D1Database, command: MigrationCommand): Promise<void> {
  const statement = binding.prepare(command.sql);
  const params = command.params.map((param) => normalizeParam(param));

  if (statement.bind) {
    await statement.bind(...params).run();
    return;
  }

  await statement.run(...params);
}

function toDbBoolean(input: unknown): 0 | 1 {
  if (input === 1 || input === true) return 1;
  if (input === "1" || `${input}`.toLowerCase() === "true") return 1;
  return 0;
}

function quote(value: unknown): string | null {
  return value === null || value === undefined ? null : String(value);
}

function normalizeCategoryPath(input: string | undefined | null): string {
  return input
    ? input
        .toLowerCase()
        .trim()
        .replace(/^\/+|\/+$/g, "")
    : "";
}

function buildCategoryCommand(
  id: string,
  name: string,
  slug: string,
  parentId: string | null,
  parentSlug: string | null,
) {
  return {
    phase: "category" as const,
    action: "upsert" as const,
    sql: "INSERT INTO categories (id,name,slug,parent_id,parent_slug,depth,created_at) VALUES (?, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET name = excluded.name, slug = excluded.slug, parent_id = excluded.parent_id, parent_slug = excluded.parent_slug, depth = excluded.depth, created_at = excluded.created_at",
    params: [
      id,
      name,
      slug,
      quote(parentId),
      quote(parentSlug),
      normalizeCategoryPath(slug).split("/").length === 2 ? 2 : 1,
      new Date().toISOString(),
    ],
  };
}

function buildTagCommand(id: string, name: string, slug: string) {
  return {
    phase: "tag" as const,
    action: "upsert" as const,
    sql: "INSERT INTO tags (id,name,slug) VALUES (?, ?, ?) ON CONFLICT(id) DO UPDATE SET name = excluded.name, slug = excluded.slug",
    params: [id, name, slug],
  };
}

function buildPostCommand(
  post: {
    id: string;
    slug: string;
    title: string;
    content: string;
    summary?: string | null;
    category_id?: string | null;
    category?: string | null;
    hero_image_key?: string | null;
    category_path?: string | null;
    is_published?: boolean | number | string;
    published_at?: string | null;
  },
  categoryBySlug: Map<string, string>,
  categoryById: Map<string, string>,
) {
  const normalizedSlug = normalizeCategoryPath(post.slug);
  const normalizedCategoryPath = normalizeCategoryPath(
    post.category_path ?? post.category_id ?? null,
  );
  const normalizedCategoryId =
    post.category_id && categoryById.get(post.category_id) ? post.category_id : null;

  const mappedCategoryId =
    normalizedCategoryId ||
    categoryBySlug.get(normalizedCategoryPath || normalizeCategoryPath(post.category ?? null)) ||
    null;

  return {
    phase: "post" as const,
    action: "upsert" as const,
    sql: "INSERT INTO posts (id,slug,title,content,summary,category_id,hero_image_key,published_at,updated_at,is_published,view_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET slug = excluded.slug, title = excluded.title, content = excluded.content, summary = excluded.summary, category_id = excluded.category_id, hero_image_key = excluded.hero_image_key, published_at = excluded.published_at, updated_at = excluded.updated_at, is_published = excluded.is_published, view_count = excluded.view_count",
    params: [
      post.id,
      normalizedSlug,
      post.title,
      post.content,
      post.summary ?? "",
      mappedCategoryId,
      quote(post.hero_image_key),
      toDbBoolean(post.is_published) === 1 ? (post.published_at ?? new Date().toISOString()) : null,
      new Date().toISOString(),
      toDbBoolean(post.is_published),
      0,
    ],
  };
}

function buildPostTagCommand(postId: string, tagId: string) {
  return {
    phase: "post_tag" as const,
    action: "upsert" as const,
    sql: "INSERT OR IGNORE INTO post_tags (post_id, tag_id) VALUES (?, ?)",
    params: [postId, tagId],
  };
}

function buildMediaRefCommand(media: MediaMappingRecord, postId: string) {
  return {
    phase: "media_ref" as const,
    action: "upsert" as const,
    sql: "INSERT INTO media_refs (id, post_id, r2_key, kind, width, height, created_at) VALUES (?, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET post_id = excluded.post_id, r2_key = excluded.r2_key, kind = excluded.kind, width = excluded.width, height = excluded.height, created_at = excluded.created_at",
    params: [
      quote(media.targetR2Key) ?? `media-${postId}`,
      postId,
      media.targetR2Key,
      media.kind,
      media.width,
      media.height,
      new Date().toISOString(),
    ],
  };
}

function isValidR2Key(value: string) {
  return /^blog\/\d{4}\/\d{2}\/[a-z0-9-]+\/[a-z0-9-]+(?:-[a-z0-9-]+)*\.(?:webp|bin)$/i.test(value);
}

function mediaValidationRecords(input: {
  mediaMappings: MediaMappingRecord[];
  postsBySlug: Map<string, string>;
}): MigrationRecord[] {
  const seen = new Set<string>();
  const records: MigrationRecord[] = [];
  for (const mapping of input.mediaMappings) {
    const id = mapping.targetR2Key || mapping.sourceUrl;
    if (!mapping.targetR2Key || !isValidR2Key(mapping.targetR2Key)) {
      records.push({
        phase: "media_ref",
        id,
        status: "failed",
        summary: "invalid or missing R2 key",
      });
      continue;
    }
    if (seen.has(mapping.targetR2Key)) {
      records.push({
        phase: "media_ref",
        id,
        status: "failed",
        summary: "duplicate R2 key",
      });
      continue;
    }
    seen.add(mapping.targetR2Key);
    if (!input.postsBySlug.has(normalizeCategoryPath(mapping.canonicalPostSlug))) {
      records.push({
        phase: "media_ref",
        id,
        status: "skipped",
        summary: "missing target post for media mapping",
      });
    }
  }
  return records;
}

export function buildImportPlan(input: {
  extract: ExtractResult;
  mediaMappings: MediaMappingRecord[];
  runbookId: string;
}): ImportPlan {
  const categoryBySlug = new Map(
    input.extract.categories.map((category) => [category.slug, category.id]),
  );
  const categoryById = new Map(
    input.extract.categories.map((category) => [category.id, category.id]),
  );
  const tagIds = new Set(input.extract.tags.map((tag) => tag.id));
  const postIds = new Set(input.extract.posts.map((post) => post.id));
  const postsBySlug = new Map(
    input.extract.posts.map((post) => [normalizeCategoryPath(post.slug), post.id]),
  );

  const categoryCommands = [...input.extract.categories]
    .sort((a, b) => a.slug.localeCompare(b.slug))
    .sort((a, b) => a.depth - b.depth)
    .map((category) =>
      buildCategoryCommand(
        category.id,
        category.name,
        category.slug,
        category.parentId,
        category.parentSlug,
      ),
    );

  const tagCommands = [...input.extract.tags]
    .sort((a, b) => a.slug.localeCompare(b.slug))
    .map((tag) => buildTagCommand(tag.id, tag.name, tag.slug));

  const postCommands = [...input.extract.posts]
    .sort((a, b) => a.slug.localeCompare(b.slug))
    .map((post) => buildPostCommand(post, categoryBySlug, categoryById));

  const postTagCommands = input.extract.postTagPairs
    .filter((pair) => postIds.has(pair.postId) && tagIds.has(pair.tagId))
    .map((pair) => buildPostTagCommand(pair.postId, pair.tagId));

  const usedMediaKeys = new Set<string>();
  const mediaCommands = input.mediaMappings
    .filter((mapping) => mapping.targetR2Key && isValidR2Key(mapping.targetR2Key))
    .filter((mapping) => {
      if (usedMediaKeys.has(mapping.targetR2Key)) return false;
      usedMediaKeys.add(mapping.targetR2Key);
      return true;
    })
    .map((mapping) => {
      const postId = postsBySlug.get(normalizeCategoryPath(mapping.canonicalPostSlug));
      return postId ? buildMediaRefCommand(mapping, postId) : null;
    })
    .filter((command): command is ReturnType<typeof buildMediaRefCommand> => command !== null);

  const estimatedCommands = [
    ...categoryCommands,
    ...tagCommands,
    ...postCommands,
    ...postTagCommands,
    ...mediaCommands,
    {
      phase: "finalize" as const,
      action: "upsert" as const,
      sql: "INSERT INTO migration_runs (id, phase, status, start_at, end_at, summary) VALUES (?, ?, ?, ?, ?, ?)",
      params: [
        input.runbookId,
        "import",
        "running",
        new Date().toISOString(),
        new Date().toISOString(),
        "planned",
      ],
    },
  ];

  return {
    runbookId: input.runbookId,
    generatedAt: new Date().toISOString(),
    estimatedCommands,
    commandOrder: ["category", "tag", "post", "post_tag", "media_ref", "media", "finalize"],
  };
}

function mediaRefFromCommand(command: MigrationCommand["params"]) {
  return {
    id: String(command[0]),
    postId: String(command[1]),
    r2Key: String(command[2]),
    kind: String(command[3]) as "hero" | "body" | "og" | "pdf" | "attachment",
    width: typeof command[4] === "number" ? command[4] : null,
    height: typeof command[5] === "number" ? command[5] : null,
  };
}

export async function runImportPlan(input: {
  extract: ExtractResult;
  mediaMappings: MediaMappingRecord[];
  runbookId: string;
}): Promise<ImportSummary> {
  const plan = buildImportPlan(input);
  const adapter = createD1R2ContentAdapter();
  const binding = getD1Binding();

  const records: MigrationRecord[] = mediaValidationRecords({
    mediaMappings: input.mediaMappings,
    postsBySlug: new Map(
      input.extract.posts.map((post) => [normalizeCategoryPath(post.slug), post.id]),
    ),
  });
  const postsById = new Map(input.extract.posts.map((post) => [post.id, post]));

  for (const command of plan.estimatedCommands) {
    if (command.phase === "category" || command.phase === "tag") {
      if (!binding) {
        records.push({
          phase: command.phase,
          id: String(command.params[0] ?? "unknown"),
          status: "failed",
          summary: "D1 binding is not configured",
        });
        continue;
      }

      try {
        await executeD1Command(binding, command);
        records.push({
          phase: command.phase,
          id: String(command.params[0] ?? "unknown"),
          status: "succeeded",
          summary: `executed ${command.action} ${command.phase}`,
        });
      } catch (error) {
        records.push({
          phase: command.phase,
          id: String(command.params[0] ?? "unknown"),
          status: "failed",
          summary: error instanceof Error ? error.message : "failed to execute d1 command",
        });
      }
      continue;
    }

    if (command.phase === "post_tag") {
      if (!binding) {
        records.push({
          phase: command.phase,
          id: `${command.params[0]}:${command.params[1]}`,
          status: "failed",
          summary: "D1 binding is not configured",
        });
        continue;
      }

      try {
        await executeD1Command(binding, command);
        records.push({
          phase: command.phase,
          id: `${command.params[0]}:${command.params[1]}`,
          status: "succeeded",
          summary: "post-tag mapping upserted",
        });
      } catch (error) {
        records.push({
          phase: command.phase,
          id: `${command.params[0]}:${command.params[1]}`,
          status: "failed",
          summary: error instanceof Error ? error.message : "failed to upsert post-tag mapping",
        });
      }
      continue;
    }

    if (command.phase === "post") {
      const source = postsById.get(String(command.params[0]));
      if (!source) {
        records.push({
          phase: command.phase,
          id: String(command.params[0]),
          status: "skipped",
          summary: "missing source post",
        });
        continue;
      }

      const post = {
        id: source.id,
        slug: source.slug,
        title: source.title,
        content: source.content,
        summary: source.summary ?? "",
        categoryId: source.category_id,
        heroImageKey: source.hero_image_key ?? null,
        publishedAt: source.published_at,
        updatedAt: new Date().toISOString(),
        isPublished: toDbBoolean(source.is_published),
        viewCount: 0,
      };

      const result = await adapter.createPost({
        post,
        authorIdentity: "migration",
      });

      records.push({
        phase: command.phase,
        id: String(command.params[0]),
        status: result.ok ? "succeeded" : "failed",
        summary: result.ok ? "post upserted" : result.error.message,
      });
      continue;
    }

    if (command.phase === "media_ref") {
      const raw = mediaRefFromCommand(command.params);
      if (!raw.postId || !raw.r2Key) {
        records.push({
          phase: command.phase,
          id: String(command.params[0] ?? "unknown"),
          status: "skipped",
          summary: "media ref missing postId or r2Key",
        });
        continue;
      }

      const result = await adapter.upsertMediaRef({
        mediaRef: {
          id: raw.id,
          postId: raw.postId,
          r2Key: raw.r2Key,
          kind: raw.kind,
          width: raw.width,
          height: raw.height,
        },
        authorIdentity: "migration",
      });

      records.push({
        phase: command.phase,
        id: raw.id,
        status: result.ok ? "succeeded" : "failed",
        summary: result.ok ? "media reference upserted" : result.error.message,
      });
      continue;
    }

    records.push({
      phase: command.phase,
      id: String(command.params[0] ?? "finalize"),
      status: "succeeded",
      summary: `executed ${command.phase}`,
    });
  }

  return {
    runbookId: plan.runbookId,
    commandCount: records.length,
    succeeded: records.filter((entry) => entry.status === "succeeded").length,
    skipped: records.filter((entry) => entry.status === "skipped").length,
    failed: records.filter((entry) => entry.status === "failed").length,
    mediaFailures: records.filter(
      (entry) => entry.phase === "media_ref" && entry.status !== "succeeded",
    ),
    records,
  };
}
