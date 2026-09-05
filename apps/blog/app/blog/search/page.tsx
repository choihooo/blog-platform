import type { Metadata } from "next";

import { PostListView } from "@/features/blog/components/post-list-view";
import { searchListingMetadata } from "@/features/blog/lib/listing-metadata";
import { getSiteConfig, searchPosts } from "@/features/blog/server/content-source";

type BlogSearchParams = { q?: string | string[] };

type BlogSearchProps = {
  searchParams?: Promise<BlogSearchParams>;
};

const emptySearchParams: Promise<BlogSearchParams> = Promise.resolve({});

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export async function generateMetadata({ searchParams }: BlogSearchProps): Promise<Metadata> {
  const [site, resolvedSearchParams] = await Promise.all([
    getSiteConfig(),
    searchParams ?? emptySearchParams,
  ]);
  const query = firstParam(resolvedSearchParams.q)?.trim() ?? "";
  return searchListingMetadata({ siteUrl: site.siteUrl, query });
}

export default async function BlogSearchPage({ searchParams }: BlogSearchProps) {
  const [site, resolvedSearchParams] = await Promise.all([
    getSiteConfig(),
    searchParams ?? emptySearchParams,
  ]);
  const query = firstParam(resolvedSearchParams.q)?.trim() ?? "";
  const results = query ? await searchPosts({ query, limit: 50 }) : [];
  const analyticsContext = {
    provider: site.analytics.provider,
    slug: "listing",
    title: `Search: ${query}`,
    url: `${site.siteUrl.replace(/\/+$/, "")}/blog/search`,
    siteUrl: site.siteUrl,
    target: query,
  };

  return (
    <main className="mx-auto w-full max-w-6xl px-5 pb-12 pt-8 sm:px-8 sm:pb-16 sm:pt-10">
      <h1 className="sr-only">글 검색</h1>
      <section aria-label="검색 결과" className="min-w-0" id="posts">
        {query ? (
          <PostListView
            analyticsContext={analyticsContext}
            postClickEvent="search_result_click"
            posts={results}
            summary={`${results.length}개의 글, "${query}" 검색 결과`}
          />
        ) : (
          <PostListView posts={[]} summary="검색어를 입력해 주세요." />
        )}
      </section>
    </main>
  );
}
