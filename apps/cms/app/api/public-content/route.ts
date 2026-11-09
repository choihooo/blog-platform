import { createContentAdapter } from "@blog-platform/core/storage";
import { queryPublicContent } from "../../../features/public-content/server/query";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  const result = await queryPublicContent(new URL(request.url), createContentAdapter());
  return Response.json(result.body, { status: result.status, headers: result.headers });
}
