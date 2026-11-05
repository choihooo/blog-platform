import type { Metadata } from "next";
import { getAllPublishedPosts, listCategories } from "@/features/blog/server/content-source";
import { RoundedBlog } from "@/features/blog-rounded/rounded-blog";

export const metadata: Metadata = {
  title: "블로그 · 라운드 스타일 시안",
  robots: { index: false, follow: false, noarchive: true },
  alternates: { canonical: "/blog" },
};

export default async function BlogRoundedPreviewPage() {
  const [posts, parents, children] = await Promise.all([
    getAllPublishedPosts({ analyzeBody: false }),
    listCategories({ depth: 1 }),
    listCategories({ depth: 2 }),
  ]);
  const categories = parents.flatMap((parent) => [
    parent,
    ...children.filter((child) => child.parentSlug === parent.slug),
  ]);
  return (
    <RoundedBlog
      categories={categories}
      posts={posts.map(
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
      )}
    />
  );
}
