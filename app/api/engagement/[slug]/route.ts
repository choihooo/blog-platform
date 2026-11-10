import { getDatabase } from "@/lib/engagement/database.mjs";
import { createStore } from "@/lib/engagement/store.mjs";
import { createHandler } from "@/lib/engagement/handler.mjs";
import { getPosts } from "@/lib/posts";

export const runtime = "nodejs";

async function handle(request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  try {
    const query = await getDatabase();
    const secret = process.env.ENGAGEMENT_SECRET;
    if (!secret || secret.length < 32) throw new Error("Missing engagement configuration");
    return createHandler({
      store: createStore(query),
      secret,
      validSlug: async (candidate: string) => (await getPosts()).some(post => post.slug === candidate),
      // Configure only a header overwritten by the deployment's trusted proxy.
      ipHeader: process.env.ENGAGEMENT_IP_HEADER || (process.env.VERCEL ? "x-vercel-forwarded-for" : ""),
    })(request, slug);
  } catch {
    return Response.json(
      { error: "댓글과 좋아요를 불러오지 못했어요. 잠시 후 다시 시도해 주세요." },
      { status: 503, headers: { "Cache-Control": "private, no-store" } },
    );
  }
}

export { handle as GET, handle as POST };
