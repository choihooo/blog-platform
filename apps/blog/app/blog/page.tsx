import type { Metadata } from "next";
import { getSiteConfig } from "@/features/blog/server/content-source";
import { homeListingMetadata } from "@/features/blog/lib/listing-metadata";
import { getAllPublishedPosts, listCategories } from "@/features/blog/server/content-source";
import { RoundedBlog } from "@/features/blog-rounded/rounded-blog";

export const revalidate = 300;
export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteConfig();
  return homeListingMetadata({ siteUrl: site.siteUrl, page: 1 });
}

export default async function BlogHomePage() {
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
