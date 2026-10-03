import { notFound } from "next/navigation";

import type { CategoryHierarchy, PublicPost } from "../server/content-source";
import { AnalyticsLink } from "./analytics-link";
import { BlogSearchForm } from "./blog-search-form";
import { POSTS_PER_PAGE, PostPagination } from "./post-pagination";
import { PostListView } from "./post-list-view";

export function blogListingHrefForPage(page: number) {
  return page > 1 ? `/blog/page/${page}` : "/blog";
}

type BlogListingPageProps = {
  page: number;
  site: {
    siteUrl: string;
    analytics: { provider: string };
  };
  posts: PublicPost[];
  total: number;
  categoryCounts: Record<string, number>;
  parentCategories: CategoryHierarchy[];
  childCategories: CategoryHierarchy[];
};

export function BlogListingPage({
  page,
  site,
  posts,
  total,
  categoryCounts,
  parentCategories,
  childCategories,
}: BlogListingPageProps) {
  const totalPages = Math.max(1, Math.ceil(total / POSTS_PER_PAGE));
  if (page > totalPages) notFound();

  const analyticsContext = {
    provider: site.analytics.provider,
    slug: "listing",
    title: "Home listing",
    url: `${site.siteUrl.replace(/\/+$/, "")}/blog`,
    siteUrl: site.siteUrl,
  };

  return (
    <main className="mx-auto w-full max-w-6xl px-5 pb-12 pt-8 sm:px-8 sm:pb-16 sm:pt-10">
      <h1 className="sr-only">기록하고 실험하는 개발 블로그</h1>

      <div className="grid gap-8 xl:grid-cols-[12rem_minmax(0,1fr)]">
        <aside aria-label="카테고리 목록" className="hidden xl:block xl:pt-11" id="categories">
          <h2 className="text-base font-semibold">카테고리</h2>
          <div className="mt-3 h-px bg-border" />
          <nav className="mt-4 flex flex-col gap-3">
            <AnalyticsLink
              analyticsContext={analyticsContext}
              className="whitespace-nowrap text-sm font-semibold text-primary"
              eventName="category_click"
              href="/blog"
              target="all"
            >
              전체보기 <span className="text-muted-foreground">({total})</span>
            </AnalyticsLink>
            {parentCategories.map((category) => {
              const children = childCategories.filter(
                (child) => child.parentSlug === category.slug,
              );
              return (
                <div className="grid gap-2" key={category.slug}>
                  <AnalyticsLink
                    analyticsContext={analyticsContext}
                    className="whitespace-nowrap text-sm text-foreground hover:text-primary"
                    eventName="category_click"
                    href={`/blog/categories/${category.slug}`}
                    target={category.slug}
                  >
                    {category.label}{" "}
                    <span className="text-muted-foreground">
                      ({categoryCounts[category.slug] ?? 0})
                    </span>
                  </AnalyticsLink>
                  {children.length > 0 ? (
                    <div className="grid gap-2 border-l border-border pl-3">
                      {children.map((child) => (
                        <AnalyticsLink
                          analyticsContext={analyticsContext}
                          className="whitespace-nowrap text-sm text-muted-foreground hover:text-primary"
                          eventName="category_click"
                          href={`/blog/categories/${child.slug}`}
                          key={child.slug}
                          target={child.slug}
                        >
                          {child.label}{" "}
                          <span className="text-muted-foreground">
                            ({categoryCounts[child.slug] ?? 0})
                          </span>
                        </AnalyticsLink>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </nav>
        </aside>

        <section aria-label="글 목록" className="min-w-0" id="posts">
          <BlogSearchForm className="mb-6 w-full max-w-xl" query="" />
          <PostListView
            analyticsContext={analyticsContext}
            postClickEvent="post_card_click"
            posts={posts}
            summary={`${total}개의 글`}
          />
          <PostPagination
            currentPage={page}
            hrefForPage={blogListingHrefForPage}
            totalPages={totalPages}
          />
        </section>
      </div>
    </main>
  );
}
