import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BlogBreadcrumb } from "@/features/blog/components/blog-breadcrumb";
import { POSTS_PER_PAGE, PostPagination } from "@/features/blog/components/post-pagination";
import { PostListView } from "@/features/blog/components/post-list-view";
import { categoryListingMetadata } from "@/features/blog/lib/listing-metadata";
import {
  getCategoryByPath,
  getPublishedPostPage,
  getSiteConfig,
  listCategories,
} from "@/features/blog/server/content-source";

type CategoryPageProps = {
  params: Promise<{
    categoryPath: string[];
  }>;
};

type CategoryRoute = {
  path: string;
  page: number;
};

function parseCategoryRoute(segments: string[]): CategoryRoute | null {
  const parts = segments.map((part) => part.trim().toLowerCase()).filter(Boolean);
  let page = 1;
  if (parts.length >= 3 && parts[parts.length - 2] === "page") {
    const value = Number(parts[parts.length - 1]);
    if (!Number.isInteger(value) || value < 1) return null;
    page = value;
    parts.length -= 2;
  }
  if (parts.length < 1 || parts.length > 2 || parts.includes("page")) return null;
  return { path: parts.join("/"), page };
}

export async function generateStaticParams() {
  const [depth1, depth2] = await Promise.all([
    listCategories({ depth: 1 }),
    listCategories({ depth: 2 }),
  ]);
  const categories = [...depth1, ...depth2];
  const pagesPerCategory: number[] = await Promise.all(
    categories.map(async (category) => {
      const posts = await getPublishedPostPage({
        categoryPath: category.slug,
        limit: 1,
        analyzeBody: false,
      });
      return Math.max(1, Math.ceil(posts.total / POSTS_PER_PAGE));
    }),
  );

  return categories.flatMap((category, index) => {
    const segments = category.slug.split("/");
    const totalPages = pagesPerCategory[index] ?? 1;
    return Array.from({ length: totalPages }, (_, pageIndex) => pageIndex + 1).map((page) => ({
      categoryPath: page > 1 ? [...segments, "page", String(page)] : segments,
    }));
  });
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { categoryPath } = await params;
  const route = parseCategoryRoute(categoryPath);
  if (!route) notFound();
  const [category, site] = await Promise.all([getCategoryByPath(route.path), getSiteConfig()]);
  if (!category) notFound();
  return categoryListingMetadata({
    siteUrl: site.siteUrl,
    label: category.label,
    slug: category.slug,
    page: route.page,
  });
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { categoryPath } = await params;
  const route = parseCategoryRoute(categoryPath);
  if (!route) notFound();

  const [category, posts, site] = await Promise.all([
    getCategoryByPath(route.path),
    getPublishedPostPage({
      categoryPath: route.path,
      page: route.page,
      limit: POSTS_PER_PAGE,
      analyzeBody: false,
    }),
    getSiteConfig(),
  ]);
  if (!category) notFound();
  const totalPages = Math.max(1, Math.ceil(posts.total / POSTS_PER_PAGE));
  if (route.page > totalPages) notFound();
  const analyticsContext = {
    provider: site.analytics.provider,
    slug: `category:${category.slug}`,
    title: category.label,
    url: `${site.siteUrl.replace(/\/+$/, "")}/blog/categories/${category.slug}`,
    siteUrl: site.siteUrl,
    category: category.slug,
  };

  return (
    <main className="mx-auto w-full max-w-5xl px-5 pb-12 pt-8 sm:px-8 sm:pb-16 sm:pt-10">
      <BlogBreadcrumb
        entries={[{ href: "/blog", label: "글" }, { label: category.label }]}
        label="카테고리 위치"
      />
      <section className="mb-10 grid gap-4">
        <p className="text-sm font-semibold uppercase text-muted-foreground">Category</p>
        <h1 className="max-w-3xl text-5xl font-semibold leading-none tracking-normal sm:text-7xl">
          {category.label}
        </h1>
        {category.description ? (
          <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
            {category.description}
          </p>
        ) : null}
      </section>
      <section className="space-y-5">
        <PostListView
          analyticsContext={analyticsContext}
          posts={posts.items}
          summary={`${posts.total}개의 글`}
        />
        <PostPagination
          currentPage={route.page}
          hrefForPage={(page) =>
            page > 1
              ? `/blog/categories/${route.path}/page/${page}`
              : `/blog/categories/${route.path}`
          }
          totalPages={totalPages}
        />
      </section>
    </main>
  );
}
