import { getDatabase } from "@/lib/engagement/database.mjs";
import { createStore } from "@/lib/engagement/store.mjs";
import { getPosts } from "@/lib/posts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const headers = { "Cache-Control": "no-store" };
  try {
    const posts = await getPosts();
    const store = createStore(await getDatabase());
    return Response.json(await store.counts(posts.map(post => post.slug)), { headers });
  } catch {
    return Response.json({ error: "글 반응을 불러오지 못했어요." }, { status: 503, headers });
  }
}
