import { revalidatePath, revalidateTag } from "next/cache";
import { blogContentCacheTags } from "@/features/blog/server/content-source";
import { syncPost } from "@/features/rag/server";

export async function refreshPublicPath(
  path: string,
): Promise<{ revalidated: true; ragSyncFailed: boolean }> {
  revalidateTag(blogContentCacheTags.posts, "max");
  revalidateTag(blogContentCacheTags.categories, "max");
  revalidatePath(path);
  const rewrittenPostPath = /^\/blog\/([^/]+)$/.exec(path);
  if (rewrittenPostPath) revalidatePath(`/posts/${rewrittenPostPath[1]}`);
  const postPath = /^\/(?:blog|posts)\/([^/]+)$/.exec(path);
  if (postPath && process.env.RAG_API_URL) {
    try {
      await syncPost(decodeURIComponent(postPath[1]!));
    } catch {
      return { revalidated: true, ragSyncFailed: true };
    }
  }
  return { revalidated: true, ragSyncFailed: false };
}
