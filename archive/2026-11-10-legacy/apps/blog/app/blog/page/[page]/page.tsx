import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { BlogListingPage } from "@/features/blog/components/blog-listing-page";
import { homeListingMetadata } from "@/features/blog/lib/listing-metadata";
import { POSTS_PER_PAGE } from "@/features/blog/components/post-pagination";
import {
  getPublishedPostPage,
  getCategoryCounts,
  getSiteConfig,
  listCategories,
} from "@/features/blog/server/content-source";

export const revalidate = 300;

type BlogPagedProps = {
  params: Promise<{
    page: string;
  }>;
};

function parsePage(value: string) {
  const page = Number(value);
  if (!Number.isInteger(page) || page < 1) return 1;
  return page;
}

export async function generateStaticParams() {
  const { total } = await getPublishedPostPage({ limit: 1, analyzeBody: false });
  const totalPages = Math.max(1, Math.ceil(total / POSTS_PER_PAGE));
  return Array.from({ length: totalPages }, (_, index) => index + 1)
    .filter((page) => page > 1)
    .map((page) => ({ page: String(page) }));
}

export async function generateMetadata({ params }: BlogPagedProps): Promise<Metadata> {
  const [{ page }, site] = await Promise.all([params, getSiteConfig()]);
  return homeListingMetadata({ siteUrl: site.siteUrl, page: parsePage(page) });
}

export default async function BlogPagedPage({ params }: BlogPagedProps) {
  const { page: pageParam } = await params;
  const page = parsePage(pageParam);
  if (page < 2) redirect("/blog");

  const [site, posts, parentCategories, childCategories] = await Promise.all([
    getSiteConfig(),
    getPublishedPostPage({ page, limit: POSTS_PER_PAGE, analyzeBody: false }),
    listCategories({ depth: 1 }),
    listCategories({ depth: 2 }),
  ]);

  const categoryCounts = await getCategoryCounts([...parentCategories, ...childCategories]);

  return (
    <BlogListingPage
      childCategories={childCategories}
      page={page}
      parentCategories={parentCategories}
      posts={posts.items}
      total={posts.total}
      categoryCounts={categoryCounts}
      site={site}
    />
  );
}
