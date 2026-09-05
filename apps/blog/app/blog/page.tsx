import type { Metadata } from "next";

import { BlogListingPage } from "@/features/blog/components/blog-listing-page";
import { homeListingMetadata } from "@/features/blog/lib/listing-metadata";
import {
  getPublishedPosts,
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
    getPublishedPosts({ limit: 100, analyzeBody: false }),
    listCategories({ depth: 1 }),
    listCategories({ depth: 2 }),
  ]);

  return (
    <BlogListingPage
      childCategories={childCategories}
      page={1}
      parentCategories={parentCategories}
      posts={posts}
      site={site}
    />
  );
}
