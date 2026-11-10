import { searchPosts } from "./content-source";
export async function searchPublicPosts(input: {
  query: string;
  categoryPath?: string;
  page: number;
  limit: number;
}) {
  const { query } = input;
  const posts = await searchPosts(input);
  return {
    items: posts.map((post) => ({
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt ?? "",
      category: post.categoryEntry
        ? { slug: post.categoryEntry.slug, label: post.categoryEntry.label }
        : null,
      tags: post.tagEntries.map((tag) => ({ slug: tag.slug, label: tag.label })),
      publishedAt: post.publishedAt,
      updatedAt: post.updatedAt ?? "",
      readingTimeLabel: post.readingTimeLabel,
      coverImage: post.coverImage ?? "",
      url: `/blog/${post.slug}`,
    })),
    total: posts.length,
    query,
  };
}
