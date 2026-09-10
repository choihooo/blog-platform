import { timingSafeEqual } from "node:crypto";
import {
  chunkDocuments,
  currentMatches,
  EMBEDDING_MODEL,
  embeddingText,
  postDocument,
  staticDocuments,
  type PublicPostRow,
} from "../../blog/features/rag/corpus";
import { boundedJson, queryFrom } from "../../blog/features/rag/contracts";

function json(body: unknown, status = 200) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

function authorized(request: Request, secret: string | undefined) {
  if (!secret) return false;
  const actual = new TextEncoder().encode(request.headers.get("authorization") ?? "");
  const expected = new TextEncoder().encode(`Bearer ${secret}`);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

function isLocalRequest(request: Request) {
  const hostname = new URL(request.url).hostname;
  return hostname === "127.0.0.1" || hostname === "localhost";
}

async function localD1Query(request: Request, env: Env) {
  if (!isLocalRequest(request)) return json({ error: "not_found" }, 404);
  if (!authorized(request, env.RAG_ADMIN_TOKEN)) return json({ error: "unauthorized" }, 401);

  let body: unknown;
  try {
    body = await boundedJson(request);
  } catch {
    return json({ error: "invalid_body" }, 400);
  }

  if (!body || typeof body !== "object") return json({ error: "invalid_body" }, 400);
  const input = body as Record<string, unknown>;
  const sql = typeof input.sql === "string" ? input.sql.trim() : "";
  const params = Array.isArray(input.params) ? input.params : null;
  const operation =
    input.operation === "first" || input.operation === "run" ? input.operation : "all";
  if (!sql || sql.length > 20_000 || !params || params.length > 100) {
    return json({ error: "invalid_body" }, 400);
  }

  try {
    const db = env.DB.withSession("first-primary");
    const statement = db.prepare(sql).bind(...params);
    if (operation === "run") {
      const result = await statement.run();
      return json({ results: [], meta: result.meta ?? null });
    }
    const result = await statement.all();
    return json({ results: result.results, meta: result.meta ?? null });
  } catch {
    return json({ error: "query_failed" }, 502);
  }
}

async function corpus(env: Env, slug?: string) {
  // Fresh primary session: no cached or replicated publication status.
  const db = env.DB.withSession("first-primary");
  const sql = `SELECT p.id, p.slug, p.title, p.summary, p.content,
    c.name AS category_name, c.slug AS category_slug,
    parent.name AS parent_category_name, parent.slug AS parent_category_slug,
    (SELECT json_group_array(json_object('name', t.name, 'slug', t.slug))
      FROM post_tags pt JOIN tags t ON t.id = pt.tag_id
      WHERE pt.post_id = p.id) AS tags_json
    FROM posts p
    LEFT JOIN categories c ON c.id = p.category_id
    LEFT JOIN categories parent ON parent.id = c.parent_id
    WHERE p.is_published = 1`;
  const result = slug
    ? await db.prepare(`${sql} AND p.slug = ?`).bind(slug).all<PublicPostRow>()
    : await db.prepare(`${sql} ORDER BY p.id LIMIT 1001`).all<PublicPostRow>();
  if (!result.success || result.results.length > 1000) throw new Error("corpus_unavailable");
  return chunkDocuments([...(slug ? [] : staticDocuments()), ...result.results.map(postDocument)]);
}

async function embed(env: Env, text: string[]) {
  const result = await env.AI.run(EMBEDDING_MODEL, { text });
  if (
    !("data" in result) ||
    !Array.isArray(result.data) ||
    result.data.length !== text.length ||
    result.data.some((v) => v.length !== 1024 || v.some((n) => !Number.isFinite(n)))
  )
    throw new Error("embedding_shape");
  return result.data;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const path = new URL(request.url).pathname;
    if (path === "/health" && request.method === "GET") return json({ ok: true });
    if (path === "/__local/d1" && request.method === "POST") return localD1Query(request, env);
    if (request.method !== "POST" || !["/search", "/sync"].includes(path))
      return json({ error: "not_found" }, 404);
    if (!authorized(request, path === "/sync" ? env.RAG_ADMIN_TOKEN : env.RAG_SEARCH_TOKEN))
      return json({ error: "unauthorized" }, 401);
    let body: unknown;
    try {
      body = await boundedJson(request);
    } catch {
      return json({ error: "invalid_body" }, 400);
    }
    let stage = "validate";
    try {
      if (path === "/sync") {
        if (!body || typeof body !== "object") return json({ error: "invalid_body" }, 400);
        const b = body as Record<string, unknown>;
        const offset = b.offset ?? 0;
        if (
          !Number.isInteger(offset) ||
          typeof offset !== "number" ||
          offset < 0 ||
          offset > 100_000 ||
          (b.slug !== undefined && (typeof b.slug !== "string" || b.slug.length > 200))
        )
          return json({ error: "invalid_body" }, 400);
        stage = "corpus";
        const chunks = await corpus(env, typeof b.slug === "string" ? b.slug : undefined);
        const version = await crypto.subtle.digest(
          "SHA-256",
          new TextEncoder().encode(chunks.map((c) => c.id).join("")),
        );
        const revision = Array.from(new Uint8Array(version), (b) =>
          b.toString(16).padStart(2, "0"),
        ).join("");
        if (offset > 0 && b.revision !== revision)
          return json({ error: "corpus_changed_restart_sync" }, 409);
        const batch = chunks.slice(offset, offset + 16);
        stage = "vector_lookup";
        const existing = batch.length ? await env.INDEX.getByIds(batch.map((c) => c.id)) : [];
        const ids = new Set(existing.map((v) => v.id));
        const missing = batch.filter((c) => !ids.has(c.id));
        if (missing.length) {
          stage = "embedding";
          const values = await embed(env, missing.map(embeddingText));
          stage = "vector_upsert";
          await env.INDEX.upsert(
            missing.map((c, i) => ({ id: c.id, values: values[i]!, namespace: "public-v1" })),
          );
        }
        return json({
          indexed: missing.length,
          total: chunks.length,
          revision,
          nextOffset: offset + batch.length < chunks.length ? offset + batch.length : null,
        });
      }
      const query = queryFrom(body);
      if (!query) return json({ error: "invalid_query" }, 400);
      // Aggregate cap also works behind the Next proxy without trusting a client IP header.
      if (!(await env.SEARCH_LIMIT.limit({ key: "portfolio-search" })).success)
        return json({ error: "rate_limited" }, 429);
      stage = "embedding";
      const vectors = await embed(env, [query]);
      stage = "vector_query";
      const matches = await env.INDEX.query(vectors[0]!, {
        // Leave headroom for superseded IDs retained during incremental reindexing.
        topK: 100,
        namespace: "public-v1",
        returnMetadata: "none",
      });
      // Re-read AFTER search; stale vectors never supply deleted/unpublished/old text.
      stage = "corpus";
      const chunks = await corpus(env);
      return json({ sources: currentMatches(chunks, matches.matches, query) });
    } catch (error) {
      console.error(
        JSON.stringify({
          event: "rag_failure",
          operation: path,
          stage,
          code:
            error instanceof Error &&
            /^(corpus_unavailable|document_too_large|embedding_shape)$/.test(error.message)
              ? error.message
              : undefined,
          errorType: error instanceof Error ? error.name : "Unknown",
        }),
      );
      return json({ error: "retrieval_unavailable" }, 503);
    }
  },
} satisfies ExportedHandler<Env>;
