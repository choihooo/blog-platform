import { BlogListingPage } from "@/features/blog/components/blog-listing-page";
import { BlogArchiveModal } from "@/features/blog/components/blog-archive-modal";
import {
  getPublishedPosts,
  getSiteConfig,
  listCategories,
} from "@/features/blog/server/content-source";

type BlogPagedModalProps = {
  params: Promise<{ page: string }>;
};

function parsePage(value: string) {
  const page = Number(value);
  return Number.isInteger(page) && page > 1 ? page : 2;
}

export default async function BlogPagedModal({ params }: BlogPagedModalProps) {
  const page = parsePage((await params).page);
  const [site, posts, parentCategories, childCategories] = await Promise.all([
    getSiteConfig(),
    getPublishedPosts({ limit: 100, analyzeBody: false }),
    listCategories({ depth: 1 }),
    listCategories({ depth: 2 }),
  ]);

  return (
    <BlogArchiveModal title={`BLOG ARCHIVE / PAGE ${page}`}>
      <BlogListingPage
        childCategories={childCategories}
        page={page}
        parentCategories={parentCategories}
        posts={posts}
        site={site}
      />
    </BlogArchiveModal>
  );
}
