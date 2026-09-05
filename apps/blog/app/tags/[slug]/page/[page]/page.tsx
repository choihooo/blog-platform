import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { POSTS_PER_PAGE } from "@/features/blog/components/post-pagination";
import { TagListingPage } from "@/features/blog/components/tag-listing-page";
import { tagListingMetadata } from "@/features/blog/lib/listing-metadata";
import {
  getPostsByTag,
  getSiteConfig,
  getTag,
  getTags,
} from "@/features/blog/server/content-source";

type TagPagedProps = {
  params: Promise<{
    slug: string;
    page: string;
  }>;
};

function parsePage(value: string) {
  const page = Number(value);
  if (!Number.isInteger(page) || page < 1) return 1;
  return page;
}

export async function generateStaticParams() {
  const tags = await getTags();
  const pagesPerTag: number[] = await Promise.all(
    tags.map(async (tag) => {
      const posts = await getPostsByTag(tag.slug, { limit: 100 });
      return Math.max(1, Math.ceil(posts.length / POSTS_PER_PAGE));
    }),
  );

  return tags.flatMap((tag, index) => {
    const totalPages = pagesPerTag[index] ?? 1;
    return Array.from({ length: totalPages }, (_, pageIndex) => pageIndex + 1)
      .filter((page) => page > 1)
      .map((page) => ({ slug: tag.slug, page: String(page) }));
  });
}

export async function generateMetadata({ params }: TagPagedProps): Promise<Metadata> {
  const { slug, page: pageParam } = await params;
  const page = parsePage(pageParam);
  const [tag, site] = await Promise.all([getTag(slug), getSiteConfig()]);
  if (!tag) notFound();
  return tagListingMetadata({ siteUrl: site.siteUrl, label: tag.label, slug: tag.slug, page });
}

export default async function TagPagedPage({ params }: TagPagedProps) {
  const { slug, page: pageParam } = await params;
  const page = parsePage(pageParam);
  if (page < 2) redirect(`/blog/tags/${slug}`);

  return <TagListingPage page={page} slug={slug} />;
}
