import type { Metadata } from "next";
import { getSiteConfig } from "@/features/blog/server/content-source";
import { homeListingMetadata } from "@/features/blog/lib/listing-metadata";
import { loadBlogListing } from "@/features/blog/server/listing-service";
import { BlogListing } from "@/features/blog/listing/blog-listing";

export const revalidate = 300;
export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteConfig();
  return homeListingMetadata({ siteUrl: site.siteUrl, page: 1 });
}

export default async function BlogHomePage() {
  const { posts, categories } = await loadBlogListing();
  return <BlogListing categories={categories} posts={posts} />;
}
