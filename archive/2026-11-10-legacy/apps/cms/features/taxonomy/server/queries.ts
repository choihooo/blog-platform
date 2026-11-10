import { createContentAdapter } from "@blog-platform/core/storage";
import type { TaxonomyData } from "../model/contracts";
export async function loadSettingsTaxonomy(): Promise<TaxonomyData> {
  const adapter = createContentAdapter();
  const [depth1Result, depth2Result, tagsResult, postsResult] = await Promise.allSettled([
    adapter.listCategories({ depth: 1 }),
    adapter.listCategories({ depth: 2 }),
    adapter.listTags(),
    adapter.listPosts({ publishedOnly: true, page: 1, limit: 100 }),
  ]);

  const depth1 = depth1Result.status === "fulfilled" ? depth1Result.value : undefined;
  const depth2 = depth2Result.status === "fulfilled" ? depth2Result.value : undefined;
  const tags = tagsResult.status === "fulfilled" ? tagsResult.value : undefined;
  const posts = postsResult.status === "fulfilled" ? postsResult.value : undefined;

  const categoryCounts = new Map<string, number>();
  if (posts?.ok) {
    for (const post of posts.data.items) {
      if (!post.categoryPath) continue;
      categoryCounts.set(post.categoryPath, (categoryCounts.get(post.categoryPath) ?? 0) + 1);
    }
  }

  const categories = [
    ...(depth1?.ok ? depth1.data.items : []),
    ...(depth2?.ok ? depth2.data.items : []),
  ].map((category) => ({
    ...category,
    postCount: categoryCounts.get(category.slug) ?? 0,
  }));

  return {
    categories,
    tags: tags?.ok ? tags.data.items : [],
  };
}
