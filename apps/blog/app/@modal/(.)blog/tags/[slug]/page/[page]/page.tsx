import { notFound } from "next/navigation";

import { BlogArchiveModal } from "@/features/blog/components/blog-archive-modal";
import { TagListingPage } from "@/features/blog/components/tag-listing-page";
import { getTag } from "@/features/blog/server/content-source";

type TagPagedModalProps = {
  params: Promise<{ slug: string; page: string }>;
};

export default async function TagPagedModal({ params }: TagPagedModalProps) {
  const { slug, page: pageParam } = await params;
  const page = Number(pageParam);
  const tag = await getTag(slug);
  if (!tag || !Number.isInteger(page) || page < 2) notFound();

  return (
    <BlogArchiveModal title={`BLOG ARCHIVE / TAG / ${tag.label} / PAGE ${page}`}>
      <TagListingPage page={page} slug={tag.slug} />
    </BlogArchiveModal>
  );
}
