import { notFound } from "next/navigation";

import { BlogArchiveModal } from "@/features/blog/components/blog-archive-modal";
import { TagListingPage } from "@/features/blog/components/tag-listing-page";
import { getTag } from "@/features/blog/server/content-source";

type TagModalProps = {
  params: Promise<{ slug: string }>;
};

export default async function TagModal({ params }: TagModalProps) {
  const { slug } = await params;
  const tag = await getTag(slug);
  if (!tag) notFound();

  return (
    <BlogArchiveModal title={`BLOG ARCHIVE / TAG / ${tag.label}`}>
      <TagListingPage page={1} slug={tag.slug} />
    </BlogArchiveModal>
  );
}
