import { notFound } from "next/navigation";

import PostPage from "@/app/posts/[slug]/page";
import { BlogArchiveModal } from "@/features/blog/components/blog-archive-modal";
import { getPostBySlug } from "@/features/blog/server/content-source";

type BlogPostModalPageProps = { params: Promise<{ slug: string }> };

export default async function BlogPostModalPage({ params }: BlogPostModalPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  return (
    <BlogArchiveModal disableEntranceAnimation title={`BLOG ARCHIVE / ${post.title}`}>
      <PostPage params={Promise.resolve({ slug })} presentation="archive" />
    </BlogArchiveModal>
  );
}
