import { loadDraftPreview, previewCacheControl } from "../../../lib/preview";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export async function GET(request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const token = new URL(request.url).searchParams.get("token") ?? "";
  const result = await loadDraftPreview({ slug, token });
  const headers = {
    "cache-control": previewCacheControl(),
    "content-type": "text/html; charset=utf-8",
  };

  if (!result.ok) {
    return new Response("<h1>Preview unavailable</h1>", { status: 404, headers });
  }

  return new Response(
    `<!doctype html><main><h1>${escapeHtml(result.post.title)}</h1><pre>${escapeHtml(
      result.post.body,
    )}</pre></main>`,
    { headers },
  );
}
