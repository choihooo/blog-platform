import type { PublicPost } from "./public-content";

export const postImageSizes =
  "(max-width: 759px) calc(100vw - 48px), (max-width: 1100px) calc((100vw - 156px) / 2), (max-width: 1440px) calc((100vw - 386px) / 2), 528px";

export function canOptimizePostImage(src: string) {
  if (src.startsWith("/")) return true;
  try {
    return new URL(src).hostname === "pub-2eadf17a82cb46679204775b78a2c16a.r2.dev";
  } catch {
    return false;
  }
}

export type PostSummary = Pick<
  PublicPost,
  | "slug"
  | "title"
  | "excerpt"
  | "coverImage"
  | "publishedAt"
  | "readingTimeLabel"
  | "category"
  | "tagEntries"
>;

export type ListingCategory = { slug: string; label: string; depth: number };

export function matchesCategory(post: PostSummary, category: string) {
  return (
    !category || post.category === category || Boolean(post.category?.startsWith(`${category}/`))
  );
}

export function filterPosts(posts: PostSummary[], query: string, category: string) {
  const terms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  return posts.filter((post) => {
    const text = [post.title, post.excerpt, ...post.tagEntries.map((tag) => tag.label)]
      .filter(Boolean)
      .join(" ")
      .toLocaleLowerCase();
    return matchesCategory(post, category) && terms.every((term) => text.includes(term));
  });
}
