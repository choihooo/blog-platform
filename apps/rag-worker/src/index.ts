import { timingSafeEqual } from "node:crypto";
import { embeddingText } from "@blog-platform/core/search";
import { boundedJson, queryFrom } from "@blog-platform/core/search";
import { corpus, embed, evidenceIds, indexFor, profileFor, searchPublished } from "./retrieval";
import { generateGeminiAnswer } from "./gemini";

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

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const path = new URL(request.url).pathname;
    if (path === "/health" && request.method === "GET") return json({ ok: true });
    if (path === "/__local/d1" && request.method === "POST") return localD1Query(request, env);
    if (request.method !== "POST" || !["/search", "/answer", "/sync"].includes(path))
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
        const contentHash = await crypto.subtle.digest(
          "SHA-256",
          new TextEncoder().encode(
            JSON.stringify(
              chunks.map((chunk) => ({
                key: chunk.key,
                title: chunk.title,
                url: chunk.url,
                text: embeddingText(chunk),
              })),
            ),
          ),
        );
        const contentRevision = Array.from(new Uint8Array(contentHash), (byte) =>
          byte.toString(16).padStart(2, "0"),
        ).join("");
        if (offset > 0 && b.revision !== revision)
          return json({ error: "corpus_changed_restart_sync" }, 409);
        if (b.dryRun !== undefined && typeof b.dryRun !== "boolean")
          return json({ error: "invalid_body" }, 400);
        if (b.dryRun === true)
          return json({
            total: chunks.length,
            revision,
            contentRevision,
            profile: profileFor(env).id,
            requests: chunks.length,
            nextOffset: null,
          });
        const batch = chunks.slice(offset, offset + 16);
        stage = "vector_lookup";
        const existing = batch.length ? await indexFor(env).getByIds(batch.map((c) => c.id)) : [];
        const ids = new Set(existing.map((v) => v.id));
        const missing = batch.filter((c) => !ids.has(c.id));
        if (missing.length) {
          stage = "embedding";
          const values = await embed(
            env,
            missing.map(embeddingText),
            "RETRIEVAL_DOCUMENT",
            request.signal,
          );
          stage = "vector_upsert";
          await indexFor(env).upsert(
            missing.map((c, i) => ({
              id: c.id,
              values: values[i]!,
              namespace: profileFor(env).namespace,
            })),
          );
        }
        return json({
          indexed: missing.length,
          total: chunks.length,
          revision,
          contentRevision,
          nextOffset: offset + batch.length < chunks.length ? offset + batch.length : null,
        });
      }
      const query = queryFrom(body);
      if (!query) return json({ error: "invalid_query" }, 400);
      // Aggregate cap also works behind the Next proxy without trusting a client IP header.
      if (!(await env.SEARCH_LIMIT.limit({ key: "portfolio-search" })).success)
        return json({ error: "rate_limited" }, 429);
      stage = "search";
      const { evidence, ...result } = await searchPublished(query, env, request.signal);
      if (path === "/answer" && result.sources.length) {
        stage = "generation";
        result.answer = await generateGeminiAnswer({
          query,
          sources: result.sources,
          apiKey: env.GEMINI_API_KEY ?? "",
          model: env.GEMINI_GENERATION_MODEL ?? "",
          signal: request.signal,
        });
        stage = "evidence_revalidation";
        request.signal.throwIfAborted();
        const currentEvidence = evidenceIds(await corpus(env), result.sources);
        if (evidence.join(",") !== currentEvidence.join(",")) throw new Error("evidence_changed");
      }
      return json(result);
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
      return json(
        {
          error:
            error instanceof Error && error.message === "rate_limited"
              ? "rate_limited"
              : "retrieval_unavailable",
        },
        error instanceof Error && error.message === "rate_limited" ? 429 : 503,
      );
    }
  },
} satisfies ExportedHandler<Env>;
