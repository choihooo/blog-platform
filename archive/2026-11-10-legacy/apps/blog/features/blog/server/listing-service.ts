import { getAllPublishedPosts, listCategories } from "./content-source";
import type { ListingCategory, PostSummary } from "../model/post-summary";

export async function loadBlogListing(): Promise<{
  posts: PostSummary[];
  categories: ListingCategory[];
}> {
  const [posts, parents, children] = await Promise.all([
    getAllPublishedPosts({ analyzeBody: false }),
    listCategories({ depth: 1 }),
    listCategories({ depth: 2 }),
  ]);
  return {
    categories: parents.flatMap((parent) => [
      parent,
      ...children.filter((child) => child.parentSlug === parent.slug),
    ]),
    posts: posts.map(
      ({
        slug,
        title,
        excerpt,
        coverImage,
        publishedAt,
        readingTimeLabel,
        category,
        tagEntries,
      }) => ({
        slug,
        title,
        excerpt,
        coverImage,
        publishedAt,
        readingTimeLabel,
        category,
        tagEntries,
      }),
    ),
  };
}
