import { Grid2X2, List } from "lucide-react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AnalyticsLink } from "@/features/blog/components/analytics-link";
import {
  paginateItems,
  parsePageParam,
  PostPagination,
} from "@/features/blog/components/post-pagination";
import { PostList } from "@/features/blog/components/post-list";
import {
  getPublishedPosts,
  getSiteConfig,
  listCategories,
  searchPosts,
} from "@/features/blog/server/content-source";
import { homeListingMetadata } from "@/features/blog/lib/listing-metadata";

export const revalidate = 300;

type BlogSearchParams = {
  category?: string | string[];
  page?: string | string[];
  q?: string | string[];
  view?: string | string[];
};

type BlogHomePageProps = {
  searchParams?: Promise<BlogSearchParams>;
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function hrefFor(params: { category?: string; page?: number; q?: string; view?: "tile" | "list" }) {
  if (params.category && !params.q) {
    const page = params.page && params.page > 1 ? `?page=${params.page}` : "";
    return `/blog/categories/${params.category}${page}`;
  }
  const search = new URLSearchParams();
  if (params.category) search.set("category", params.category);
  if (params.q) search.set("q", params.q);
  if (params.view && params.view !== "tile") search.set("view", params.view);
  if (params.page && params.page > 1) search.set("page", String(params.page));
  const query = search.toString();
  return query ? `/blog?${query}` : "/blog";
}

export async function generateMetadata({ searchParams }: BlogHomePageProps): Promise<Metadata> {
  const [site, resolvedSearchParams]: [
    Awaited<ReturnType<typeof getSiteConfig>>,
    BlogSearchParams,
  ] = await Promise.all([getSiteConfig(), searchParams ?? Promise.resolve({})]);
  const query = firstParam(resolvedSearchParams.q)?.trim();
  const category = firstParam(resolvedSearchParams.category)?.trim().toLowerCase();
  const page = parsePageParam(resolvedSearchParams.page);
  return homeListingMetadata({ siteUrl: site.siteUrl, query, category, page });
}

export default async function BlogHomePage({ searchParams }: BlogHomePageProps) {
  const defaultSearchParams: BlogHomePageProps["searchParams"] = Promise.resolve({});
  const resolvedSearchParams = await (searchParams ?? defaultSearchParams);
  const activeCategory = firstParam(resolvedSearchParams.category);
  const query = firstParam(resolvedSearchParams.q)?.trim() ?? "";
  const view = firstParam(resolvedSearchParams.view) === "list" ? "list" : "tile";
  const requestedPage = parsePageParam(resolvedSearchParams.page);
  if (activeCategory && !query) {
    redirect(
      `/blog/categories/${activeCategory}${requestedPage > 1 ? `?page=${requestedPage}` : ""}`,
    );
  }
  const [site, allPosts, searchedPosts, parentCategories, childCategories] = await Promise.all([
    getSiteConfig(),
    getPublishedPosts({ limit: 100, analyzeBody: false }),
    query ? searchPosts({ query, limit: 100 }) : Promise.resolve(null),
    listCategories({ depth: 1 }),
    listCategories({ depth: 2 }),
  ]);
  const sourcePosts = searchedPosts ?? allPosts;
  const analyticsContext = {
    provider: site.analytics.provider,
    slug: "listing",
    title: query ? `Search: ${query}` : "Home listing",
    url: `${site.siteUrl.replace(/\/+$/, "")}/blog`,
    siteUrl: site.siteUrl,
    target: query,
  };
  const posts = activeCategory
    ? sourcePosts.filter(
        (post) =>
          post.category === activeCategory ||
          (post.category?.startsWith(`${activeCategory}/`) ?? false),
      )
    : sourcePosts;
  const pagination = paginateItems(posts, requestedPage);
  const categoryCounts = new Map<string, number>();
  for (const post of allPosts) {
    if (post.category) {
      categoryCounts.set(post.category, (categoryCounts.get(post.category) ?? 0) + 1);
      const parentSlug = post.category.split("/")[0];
      if (parentSlug && parentSlug !== post.category) {
        categoryCounts.set(parentSlug, (categoryCounts.get(parentSlug) ?? 0) + 1);
      }
    }
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-5 pb-12 pt-8 sm:px-8 sm:pb-16 sm:pt-10">
      <h1 className="sr-only">기록하고 실험하는 개발 블로그</h1>

      <div className="grid gap-8 xl:grid-cols-[12rem_minmax(0,1fr)]">
        <aside aria-label="카테고리 목록" className="hidden xl:block xl:pt-11" id="categories">
          <h2 className="text-base font-semibold">카테고리</h2>
          <div className="mt-3 h-px bg-border" />
          <nav className="mt-4 flex flex-col gap-3">
            <AnalyticsLink
              aria-current={!activeCategory ? "page" : undefined}
              analyticsContext={analyticsContext}
              className={`whitespace-nowrap text-sm ${
                !activeCategory
                  ? "font-semibold text-primary"
                  : "text-foreground hover:text-primary"
              }`}
              eventName="category_click"
              href={hrefFor({ q: query, view })}
              target="all"
            >
              전체보기 <span className="text-muted-foreground">({allPosts.length})</span>
            </AnalyticsLink>
            {parentCategories.map((category) => {
              const children = childCategories.filter(
                (child) => child.parentSlug === category.slug,
              );
              return (
                <div className="grid gap-2" key={category.slug}>
                  <AnalyticsLink
                    aria-current={activeCategory === category.slug ? "page" : undefined}
                    analyticsContext={analyticsContext}
                    className={`whitespace-nowrap text-sm ${
                      activeCategory === category.slug
                        ? "font-semibold text-primary"
                        : "text-foreground hover:text-primary"
                    }`}
                    eventName="category_click"
                    href={hrefFor({ category: category.slug, q: query, view })}
                    target={category.slug}
                  >
                    {category.label}{" "}
                    <span className="text-muted-foreground">
                      ({categoryCounts.get(category.slug) ?? 0})
                    </span>
                  </AnalyticsLink>
                  {children.length > 0 ? (
                    <div className="grid gap-2 border-l border-border pl-3">
                      {children.map((child) => (
                        <AnalyticsLink
                          aria-current={activeCategory === child.slug ? "page" : undefined}
                          analyticsContext={analyticsContext}
                          className={`whitespace-nowrap text-sm ${
                            activeCategory === child.slug
                              ? "font-semibold text-primary"
                              : "text-muted-foreground hover:text-primary"
                          }`}
                          eventName="category_click"
                          href={hrefFor({ category: child.slug, q: query, view })}
                          key={child.slug}
                          target={child.slug}
                        >
                          {child.label}{" "}
                          <span className="text-muted-foreground">
                            ({categoryCounts.get(child.slug) ?? 0})
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

        <section className="min-w-0 space-y-5" aria-label="글 목록" id="posts">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              {pagination.totalCount}개의 글{query ? `, "${query}" 검색 결과` : ""}
            </p>
            <div aria-label="보기 방식" className="flex items-center gap-2">
              <a
                aria-label="타일뷰"
                aria-current={view === "tile" ? "page" : undefined}
                className={`grid size-10 place-items-center rounded-md border ${
                  view === "tile"
                    ? "border-primary text-primary"
                    : "border-border text-muted-foreground"
                }`}
                href={hrefFor({
                  category: activeCategory,
                  page: pagination.currentPage,
                  q: query,
                  view: "tile",
                })}
              >
                <Grid2X2 aria-hidden="true" size={18} />
              </a>
              <a
                aria-label="리스트뷰"
                aria-current={view === "list" ? "page" : undefined}
                className={`grid size-10 place-items-center rounded-md border ${
                  view === "list"
                    ? "border-primary text-primary"
                    : "border-border text-muted-foreground"
                }`}
                href={hrefFor({
                  category: activeCategory,
                  page: pagination.currentPage,
                  q: query,
                  view: "list",
                })}
              >
                <List aria-hidden="true" size={19} />
              </a>
            </div>
          </div>
          <PostList
            analyticsContext={analyticsContext}
            postClickEvent={query ? "search_result_click" : "post_card_click"}
            posts={pagination.items}
            view={view}
          />
          <PostPagination
            currentPage={pagination.currentPage}
            hrefForPage={(page) => hrefFor({ category: activeCategory, page, q: query, view })}
            totalPages={pagination.totalPages}
          />
        </section>
      </div>
    </main>
  );
}
