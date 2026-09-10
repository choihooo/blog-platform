import { BlogArchiveModal } from "@/features/blog/components/blog-archive-modal";
import { PostListView } from "@/features/blog/components/post-list-view";
import { getSiteConfig, searchPosts } from "@/features/blog/server/content-source";

type BlogSearchModalProps = {
  searchParams?: Promise<{ q?: string | string[] }>;
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function BlogSearchModal({ searchParams }: BlogSearchModalProps) {
  const resolved = (await searchParams) ?? {};
  const query = firstParam(resolved.q)?.trim() ?? "";
  const [site, posts] = await Promise.all([
    getSiteConfig(),
    query ? searchPosts({ query, limit: 50 }) : Promise.resolve([]),
  ]);

  return (
    <BlogArchiveModal title="BLOG SEARCH">
      <main className="mx-auto w-full max-w-5xl px-5 pb-12 pt-8 sm:px-8 sm:pb-16 sm:pt-10">
        <h1 className="sr-only">글 검색</h1>
        <PostListView
          analyticsContext={{
            provider: site.analytics.provider,
            slug: "listing",
            title: `Search: ${query}`,
            url: `${site.siteUrl.replace(/\/+$/, "")}/blog/search`,
            siteUrl: site.siteUrl,
          }}
          postClickEvent="search_result_click"
          posts={posts}
          replaceLinks
          summary={
            query ? `${posts.length}개의 글, "${query}" 검색 결과` : "검색어를 입력해 주세요."
          }
        />
      </main>
    </BlogArchiveModal>
  );
}
