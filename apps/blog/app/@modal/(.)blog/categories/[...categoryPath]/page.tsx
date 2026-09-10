import { notFound } from "next/navigation";

import { BlogArchiveList } from "@/features/blog/components/blog-archive-list";
import { BlogArchiveModal } from "@/features/blog/components/blog-archive-modal";
import {
  getCategoryByPath,
  getPublishedPosts,
  getPostsByCategoryPath,
  listCategories,
} from "@/features/blog/server/content-source";

type CategoryModalProps = {
  params: Promise<{ categoryPath: string[] }>;
};

function categoryPathFromParams(segments: string[]) {
  const normalized = segments.map((segment) => segment.trim().toLowerCase()).filter(Boolean);
  if (normalized.length === 0 || normalized.length > 2) return;
  if (normalized.includes("page")) return;
  return normalized.join("/");
}

export default async function CategoryModal({ params }: CategoryModalProps) {
  const path = categoryPathFromParams((await params).categoryPath);
  if (!path) notFound();

  const [category, posts, allPosts, parentCategories, childCategories] = await Promise.all([
    getCategoryByPath(path),
    getPostsByCategoryPath(path, { limit: 100, publishedOnly: true }),
    getPublishedPosts({ limit: 100, analyzeBody: false }),
    listCategories({ depth: 1 }),
    listCategories({ depth: 2 }),
  ]);
  if (!category) notFound();

  return (
    <BlogArchiveModal title={`BLOG ARCHIVE / ${category.label}`}>
      <BlogArchiveList
        activeCategoryPath={path}
        allPosts={allPosts}
        childCategories={childCategories}
        parentCategories={parentCategories}
        posts={posts}
      />
    </BlogArchiveModal>
  );
}
