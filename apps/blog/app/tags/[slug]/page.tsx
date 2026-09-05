import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { TagListingPage } from "@/features/blog/components/tag-listing-page";
import { tagListingMetadata } from "@/features/blog/lib/listing-metadata";
import { getSiteConfig, getTag, getTags } from "@/features/blog/server/content-source";

type TagPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  const tags = await getTags();
  return tags.map((tag) => ({ slug: tag.slug }));
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const { slug } = await params;
  const [tag, site] = await Promise.all([getTag(slug), getSiteConfig()]);
  if (!tag) notFound();
  return tagListingMetadata({ siteUrl: site.siteUrl, label: tag.label, slug: tag.slug, page: 1 });
}

export default async function TagPage({ params }: TagPageProps) {
  const { slug } = await params;
  return <TagListingPage page={1} slug={slug} />;
}
