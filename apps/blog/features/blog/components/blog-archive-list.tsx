import Link from "next/link";
import { FileText, Folder, FolderOpen, FolderTree, Grid2X2, List } from "lucide-react";

import { formatPostDate } from "@/shared/date/date-format";
import type { CategoryHierarchy, PublicPost } from "../server/content-source";

type BlogArchiveListProps = {
  posts: PublicPost[];
  allPosts?: PublicPost[];
  activeCategoryPath?: string;
  parentCategories: CategoryHierarchy[];
  childCategories: CategoryHierarchy[];
};

function CategoryTree({
  posts,
  allPosts = posts,
  activeCategoryPath,
  parentCategories,
  childCategories,
}: BlogArchiveListProps) {
  const counts = new Map<string, number>();
  for (const post of allPosts) {
    if (!post.category) continue;
    counts.set(post.category, (counts.get(post.category) ?? 0) + 1);
    const parent = post.category.split("/")[0];
    if (parent && parent !== post.category) counts.set(parent, (counts.get(parent) ?? 0) + 1);
  }

  const visibleParents = parentCategories.filter((parent) => (counts.get(parent.slug) ?? 0) > 0);

  return (
    <aside className="blog-archive__sidebar" aria-label="블로그 카테고리">
      <div className="blog-archive__sidebar-heading">
        <FolderTree aria-hidden="true" size={14} /> CATEGORIES
      </div>
      <Link
        aria-current={!activeCategoryPath ? "page" : undefined}
        className={`blog-archive__category${!activeCategoryPath ? " blog-archive__category--active" : ""}`}
        href="/blog"
        replace
      >
        <FileText aria-hidden="true" size={14} /> 전체보기 <small>({allPosts.length})</small>
      </Link>
      <div className="blog-archive__category-tree">
        {visibleParents.map((parent) => {
          const children = childCategories.filter(
            (child) => child.parentSlug === parent.slug && (counts.get(child.slug) ?? 0) > 0,
          );
          const isParentActive = activeCategoryPath === parent.slug;
          return (
            <div key={parent.slug}>
              <Link
                aria-current={isParentActive ? "page" : undefined}
                className={`blog-archive__category${isParentActive ? " blog-archive__category--active" : ""}`}
                href={`/blog/categories/${parent.slug}`}
                replace
              >
                <Folder aria-hidden="true" size={14} /> {parent.label}{" "}
                <small>({counts.get(parent.slug) ?? 0})</small>
              </Link>
              {children.length > 0 ? (
                <div className="blog-archive__children">
                  {children.map((child) => (
                    <Link
                      aria-current={activeCategoryPath === child.slug ? "page" : undefined}
                      className={`blog-archive__category${activeCategoryPath === child.slug ? " blog-archive__category--active" : ""}`}
                      href={`/blog/categories/${child.slug}`}
                      key={child.slug}
                      replace
                    >
                      <FolderOpen aria-hidden="true" size={14} /> {child.label}{" "}
                      <small>({counts.get(child.slug) ?? 0})</small>
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </aside>
  );
}

function PostCover({ post }: { post: PublicPost }) {
  return post.coverImage ? (
    <img className="blog-archive__cover" src={post.coverImage} alt="" loading="lazy" />
  ) : (
    <img className="blog-archive__cover" src="/brand/no-thumbnail.webp" alt="" loading="lazy" />
  );
}

export function BlogArchiveList({
  posts,
  allPosts,
  activeCategoryPath,
  parentCategories,
  childCategories,
}: BlogArchiveListProps) {
  return (
    <div className="blog-archive__layout">
      <CategoryTree
        activeCategoryPath={activeCategoryPath}
        allPosts={allPosts}
        posts={posts}
        parentCategories={parentCategories}
        childCategories={childCategories}
      />
      <section className="blog-archive__posts" aria-label="공개 블로그 글 목록">
        <div className="blog-archive__list-toolbar">
          <List aria-hidden="true" size={15} />
          <strong>{posts.length}개의 글</strong>
          <div className="blog-archive__view-icons" aria-hidden="true">
            <List aria-hidden="true" size={16} />
            <Grid2X2 aria-hidden="true" size={16} />
          </div>
        </div>
        <div className="blog-archive__post-list">
          {posts.map((post) => (
            <article className="blog-archive__post" key={post.slug}>
              <Link
                className="blog-archive__post-link"
                href={`/blog/${post.slug}`}
                prefetch={false}
                replace
              >
                <PostCover post={post} />
                <div className="blog-archive__post-copy">
                  <div className="blog-archive__post-meta">
                    <time dateTime={post.publishedAt}>{formatPostDate(post.publishedAt)}</time>
                    <span>·</span>
                    <span>{post.readingTimeLabel}</span>
                  </div>
                  <h2>{post.title}</h2>
                  {post.excerpt ? <p>{post.excerpt}</p> : null}
                  <div className="blog-archive__tags">
                    {post.categoryEntry ? <span>{post.categoryEntry.label}</span> : null}
                    {post.tagEntries.slice(0, 4).map((tag) => (
                      <span key={tag.slug}>{tag.label}</span>
                    ))}
                  </div>
                </div>
                <span className="blog-archive__arrow" aria-hidden="true">
                  ›
                </span>
              </Link>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
