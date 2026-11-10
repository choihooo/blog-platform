import { boundedJson, queryFrom } from "@blog-platform/core/search";
import { authorized } from "../http/access";
import { failureResponse, json } from "../http/response";
import { searchPublished } from "../retrieval";
import { answerPublished } from "../services/answer";
export async function handleSearch(
  request: Request,
  env: Env,
  mode: "search" | "answer",
): Promise<Response> {
  if (!authorized(request, env.RAG_SEARCH_TOKEN)) return json({ error: "unauthorized" }, 401);
  let body: unknown;
  try {
    body = await boundedJson(request);
  } catch {
    return json({ error: "invalid_body" }, 400);
  }
  let stage = "validate";
  try {
    const query = queryFrom(body);
    if (!query) return json({ error: "invalid_query" }, 400);
    if (!(await env.SEARCH_LIMIT.limit({ key: "portfolio-search" })).success)
      return json({ error: "rate_limited" }, 429);
    stage = "search";
    if (mode === "answer")
      return json(
        await answerPublished(query, env, request.signal, (next) => {
          stage = next;
        }),
      );
    const result = await searchPublished(query, env, request.signal);
    return json({ sources: result.sources });
  } catch (error) {
    return failureResponse(error, `/${mode}`, stage);
  }
}
