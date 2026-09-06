import { boundedJson, queryFrom } from "@/features/rag/contracts";
import { retrieve } from "@/features/rag/server";
import { isSearchContext, resolveFollowUp, type SearchContext } from "@/features/rag/follow-up";
import { conversationAnswer } from "@/features/rag/conversation";

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
    const special = await conversationAnswer(query, context, request.signal);
    const resolved = special ? { query: context?.query ?? query } : resolveFollowUp(query, context);
    const result =
      special ??
      (resolved.clarification
        ? { answer: resolved.clarification, sources: [], kind: "clarification" }
        : await retrieve(resolved.query, request.signal));
    return Response.json(
      { ...result, resolvedQuery: resolved.query },
      {
        headers: { "Cache-Control": "no-store" },
      },
    );
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
