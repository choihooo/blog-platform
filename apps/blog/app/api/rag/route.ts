import { boundedJson, queryFrom } from "@blog-platform/core/search";
import { isSearchContext, type SearchContext } from "@/features/rag/contracts";
import { answerQuestion } from "@/features/rag/server/answer-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin)
    return Response.json({ error: "forbidden" }, { status: 403 });
  let query: string | null;
  let context: SearchContext | undefined;
  try {
    const body = await boundedJson(request, 32768);
    query = queryFrom(body);
    if (body && typeof body === "object" && "context" in body && body.context !== undefined) {
      if (!isSearchContext(body.context)) throw new Error("invalid_context");
      context = body.context;
    }
  } catch {
    query = null;
  }
  if (!query) return Response.json({ error: "invalid_query" }, { status: 400 });
  try {
    const result = await answerQuestion(query, context, request.signal);
    return Response.json(result, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    const limited = error instanceof Error && error.message === "rate_limited";
    return Response.json(
      { error: limited ? "rate_limited" : "retrieval_unavailable" },
      {
        status: limited ? 429 : 503,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }
}
