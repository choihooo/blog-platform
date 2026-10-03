import type { Metadata } from "next";

import { BlogListingPage } from "@/features/blog/components/blog-listing-page";
import { POSTS_PER_PAGE } from "@/features/blog/components/post-pagination";
import { homeListingMetadata } from "@/features/blog/lib/listing-metadata";
import {
  getPublishedPostPage,
  getCategoryCounts,
  getSiteConfig,
  listCategories,
} from "@/features/blog/server/content-source";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteConfig();
  return homeListingMetadata({ siteUrl: site.siteUrl, page: 1 });
}

export default async function BlogHomePage() {
  const [site, posts, parentCategories, childCategories] = await Promise.all([
    getSiteConfig(),
    getPublishedPostPage({ limit: POSTS_PER_PAGE, analyzeBody: false }),
    listCategories({ depth: 1 }),
    listCategories({ depth: 2 }),
  ]);

  const categoryCounts = await getCategoryCounts([...parentCategories, ...childCategories]);

  return (
    <BlogListingPage
      childCategories={childCategories}
      page={1}
      parentCategories={parentCategories}
      posts={posts.items}
      total={posts.total}
      categoryCounts={categoryCounts}
      site={site}
    />
  );
}
