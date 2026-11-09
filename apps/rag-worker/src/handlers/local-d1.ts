import { boundedJson } from "@blog-platform/core/search";
import { authorized, isLocalRequest } from "../http/access";
import { json } from "../http/response";
export async function localD1Query(request: Request, env: Env) {
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
