import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { trimSlash } from "@blog-platform/seo-engine";

import { BlogBreadcrumb } from "@/features/blog/components/blog-breadcrumb";
import { PostList } from "@/features/blog/components/post-list";
import {
  paginateItems,
  parsePageParam,
  PostPagination,
} from "@/features/blog/components/post-pagination";
import {
  getPostsByTag,
  getSiteConfig,
  getTag,
  getTags,
} from "@/features/blog/server/content-source";

export const dynamic = "force-dynamic";

type TagPageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams?: Promise<{
    page?: string | string[];
  }>;
};

export async function generateStaticParams() {
  const tags = await getTags();
  return tags.map((tag) => ({ slug: tag.slug }));
}

export async function generateMetadata({ params, searchParams }: TagPageProps): Promise<Metadata> {
  const { slug } = await params;
  const resolvedSearchParams: { page?: string | string[] } = await (searchParams ??
    Promise.resolve({}));
  const page = parsePageParam(resolvedSearchParams.page);
  const [tag, site] = await Promise.all([getTag(slug), getSiteConfig()]);
  return tag
    ? {
        title: page > 1 ? `${tag.label} - ${page}페이지` : tag.label,
        description: tag.description,
        alternates: {
          canonical: `${trimSlash(site.siteUrl)}/blog/tags/${tag.slug}${page > 1 ? `?page=${page}` : ""}`,
        },
      }
    : {};
}

function tagHrefForPage(slug: string, page: number) {
  return page > 1 ? `/blog/tags/${slug}?page=${page}` : `/blog/tags/${slug}`;
}

export default async function TagPage({ params, searchParams }: TagPageProps) {
  const { slug } = await params;
  const resolvedSearchParams: { page?: string | string[] } = await (searchParams ??
    Promise.resolve({}));
  const [tag, posts, site] = await Promise.all([
    getTag(slug),
    getPostsByTag(slug, { limit: 100 }),
    getSiteConfig(),
  ]);
  if (!tag) notFound();
  const pagination = paginateItems(posts, parsePageParam(resolvedSearchParams.page));
  const analyticsContext = {
    provider: site.analytics.provider,
    slug: `tag:${tag.slug}`,
    title: tag.label,
    url: `${site.siteUrl.replace(/\/+$/, "")}/blog/tags/${tag.slug}`,
    siteUrl: site.siteUrl,
    tags: [tag.slug],
  };

  return (
    <main className="mx-auto w-full max-w-5xl px-5 pb-12 pt-8 sm:px-8 sm:pb-16 sm:pt-10">
      <BlogBreadcrumb
        entries={[
          { href: "/blog", label: "글" },
          { href: "/blog/tags", label: "태그" },
          { label: tag.label },
        ]}
        label="태그 위치"
      />
      <section className="mb-10 grid gap-4">
        <p className="text-sm font-semibold uppercase text-muted-foreground">Tag</p>
        <h1 className="max-w-3xl text-5xl font-semibold leading-none tracking-normal sm:text-7xl">
          {tag.label}
        </h1>
        {tag.description ? (
          <p className="max-w-2xl text-lg leading-8 text-muted-foreground">{tag.description}</p>
        ) : null}
      </section>
      <section className="space-y-5">
        <PostList analyticsContext={analyticsContext} posts={pagination.items} />
        <PostPagination
          currentPage={pagination.currentPage}
          hrefForPage={(page) => tagHrefForPage(tag.slug, page)}
          totalPages={pagination.totalPages}
        />
      </section>
    </main>
  );
}
