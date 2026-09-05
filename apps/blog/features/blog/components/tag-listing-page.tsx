import { notFound } from "next/navigation";

import { BlogBreadcrumb } from "./blog-breadcrumb";
import { paginateItems, PostPagination } from "./post-pagination";
import { PostListView } from "./post-list-view";
import { getPostsByTag, getSiteConfig, getTag } from "../server/content-source";

export function tagListingHrefForPage(slug: string, page: number) {
  return page > 1 ? `/blog/tags/${slug}/page/${page}` : `/blog/tags/${slug}`;
}

export async function TagListingPage({ page, slug }: { page: number; slug: string }) {
  const [tag, posts, site] = await Promise.all([
    getTag(slug),
    getPostsByTag(slug, { limit: 100 }),
    getSiteConfig(),
  ]);
  if (!tag) notFound();
  const pagination = paginateItems(posts, page);
  if (page > pagination.totalPages) notFound();
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
        <PostListView
          analyticsContext={analyticsContext}
          posts={pagination.items}
          summary={`${pagination.totalCount}개의 글`}
        />
        <PostPagination
          currentPage={pagination.currentPage}
          hrefForPage={(page) => tagListingHrefForPage(tag.slug, page)}
          totalPages={pagination.totalPages}
        />
      </section>
    </main>
  );
}
