import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { trimSlash } from "@blog-platform/seo-engine";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@hozui/react";

import { PostList } from "../../components/post-list";
import { paginateItems, parsePageParam, PostPagination } from "../../components/post-pagination";
import {
  getCategoryByPath,
  getPostsByCategoryPath,
  getSiteConfig,
  listCategories,
} from "../../../lib/content-source";

export const dynamic = "force-dynamic";

type CategoryPageProps = {
  params: Promise<{
    categoryPath: string[];
  }>;
  searchParams?: Promise<{
    page?: string | string[];
  }>;
};

export async function generateStaticParams() {
  const categories = await listCategories({ depth: 1 });
  const depth2 = await listCategories({ depth: 2 });

  return [...categories, ...depth2].map((category) => ({
    categoryPath: category.slug.split("/"),
  }));
}

function toCanonicalPath(parts: string[]) {
  return parts
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean)
    .join("/")
    .replace(/^\/+|\/+$/g, "");
}

export async function generateMetadata({
  params,
  searchParams,
}: CategoryPageProps): Promise<Metadata> {
  const { categoryPath } = await params;
  const resolvedSearchParams: { page?: string | string[] } = await (searchParams ??
    Promise.resolve({}));
  const path = toCanonicalPath(categoryPath);
  const page = parsePageParam(resolvedSearchParams.page);
  const [category, site] = await Promise.all([getCategoryByPath(path), getSiteConfig()]);
  return category
    ? {
        title: page > 1 ? `${category.label} - ${page}페이지` : category.label,
        description: category.description,
        alternates: {
          canonical: `${trimSlash(site.siteUrl)}/categories/${category.slug}${page > 1 ? `?page=${page}` : ""}`,
        },
      }
    : {};
}

function categoryHrefForPage(path: string, page: number) {
  return page > 1 ? `/categories/${path}?page=${page}` : `/categories/${path}`;
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { categoryPath } = await params;
  const resolvedSearchParams: { page?: string | string[] } = await (searchParams ??
    Promise.resolve({}));
  const path = toCanonicalPath(categoryPath);
  if (!path) notFound();

  const [category, posts] = await Promise.all([
    getCategoryByPath(path),
    getPostsByCategoryPath(path, { limit: 100, publishedOnly: true }),
  ]);
  if (!category) notFound();
  const site = await getSiteConfig();
  const pagination = paginateItems(posts, parsePageParam(resolvedSearchParams.page));
  const analyticsContext = {
    provider: site.analytics.provider,
    slug: `category:${category.slug}`,
    title: category.label,
    url: `${site.siteUrl.replace(/\/+$/, "")}/categories/${category.slug}`,
    siteUrl: site.siteUrl,
    category: category.slug,
  };

  return (
    <main className="mx-auto w-full max-w-5xl px-5 pb-12 pt-8 sm:px-8 sm:pb-16 sm:pt-10">
      <Breadcrumb aria-label="카테고리 위치" className="mb-6" size="sm">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">글</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{category.label}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
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
        <PostList analyticsContext={analyticsContext} posts={pagination.items} />
        <PostPagination
          currentPage={pagination.currentPage}
          hrefForPage={(page) => categoryHrefForPage(path, page)}
          totalPages={pagination.totalPages}
        />
      </section>
    </main>
  );
}
