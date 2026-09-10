import { BlogArchiveList } from "@/features/blog/components/blog-archive-list";
import { BlogArchiveModal } from "@/features/blog/components/blog-archive-modal";
import { getPublishedPosts, listCategories } from "@/features/blog/server/content-source";

export default async function BlogArchiveModalPage() {
  const [posts, parentCategories, childCategories] = await Promise.all([
    getPublishedPosts({ limit: 100, analyzeBody: false }),
    listCategories({ depth: 1 }),
    listCategories({ depth: 2 }),
  ]);

  return (
    <BlogArchiveModal>
      <BlogArchiveList
        posts={posts}
        parentCategories={parentCategories}
        childCategories={childCategories}
      />
    </BlogArchiveModal>
  );
}
