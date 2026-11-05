import type { PublicPost } from "../blog/server/content-source-types";

export const blogPreviewPath = "/experiments/blog-rounded";

export function canOptimizePreviewImage(src: string) {
  if (src.startsWith("/")) return true;
  try {
    return new URL(src).hostname === "pub-2eadf17a82cb46679204775b78a2c16a.r2.dev";
  } catch {
    return false;
  }
}

export type PreviewPost = Pick<
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

export type PreviewCategory = { slug: string; label: string; depth: number };

export function matchesCategory(post: PreviewPost, category: string) {
  return (
    !category || post.category === category || Boolean(post.category?.startsWith(`${category}/`))
  );
}

export function filterPreviewPosts(posts: PreviewPost[], query: string, category: string) {
  const terms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  return posts.filter((post) => {
    const text = [post.title, post.excerpt, ...post.tagEntries.map((tag) => tag.label)]
      .filter(Boolean)
      .join(" ")
      .toLocaleLowerCase();
    return matchesCategory(post, category) && terms.every((term) => text.includes(term));
  });
}
