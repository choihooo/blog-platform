import { boundedJson } from "@blog-platform/core/search";
import { authorized } from "../http/access";
import { failureResponse, json } from "../http/response";
import { syncPublished } from "../services/sync";
export async function handleSync(request: Request, env: Env): Promise<Response> {
  if (!authorized(request, env.RAG_ADMIN_TOKEN)) return json({ error: "unauthorized" }, 401);
  let body: unknown;
  try {
    body = await boundedJson(request);
  } catch {
    return json({ error: "invalid_body" }, 400);
  }
  let stage = "validate";
  try {
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

    const result = await syncPublished(
      {
        offset,
        slug: typeof b.slug === "string" ? b.slug : undefined,
        revision: b.revision,
        dryRun: b.dryRun,
      },
      env,
      request.signal,
      (next) => {
        stage = next;
      },
    );
    return json(result.body, result.status);
  } catch (error) {
    return failureResponse(error, "/sync", stage);
  }
}
