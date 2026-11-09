export function json(body: unknown, status = 200) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

export function failureResponse(error: unknown, path: string, stage: string): Response {
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
