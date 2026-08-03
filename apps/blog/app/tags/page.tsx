import type { Metadata } from "next";
import Link from "next/link";
import { trimSlash } from "@blog-platform/seo-engine";

import { getPublishedPosts, getSiteConfig, getTags } from "../../lib/content-source";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteConfig();
  return {
    title: "태그",
    description: "태그별 글 목록",
    alternates: { canonical: `${trimSlash(site.siteUrl)}/tags` },
  };
}

export default async function TagsPage() {
  const [tags, posts] = await Promise.all([
    getTags(),
    getPublishedPosts({ limit: 100, analyzeBody: false }),
  ]);
  const tagCounts = new Map<string, number>();

  for (const post of posts) {
    const slugs = new Set([...(post.tags ?? []), ...post.tagEntries.map((tag) => tag.slug)]);
    for (const slug of slugs) {
      tagCounts.set(slug, (tagCounts.get(slug) ?? 0) + 1);
    }
  }

  const sortedTags = [...tags].sort((a, b) => {
    const countDiff = (tagCounts.get(b.slug) ?? 0) - (tagCounts.get(a.slug) ?? 0);
    return countDiff || a.label.localeCompare(b.label, "ko");
  });

  return (
    <main className="mx-auto w-full max-w-5xl px-5 pb-12 pt-8 sm:px-8 sm:pb-16 sm:pt-10">
      <section className="mb-10 grid gap-4 border-b border-border pb-8 sm:mb-12 sm:pb-10">
        <p className="text-sm font-semibold uppercase text-muted-foreground">Tags</p>
        <h1 className="max-w-3xl text-5xl font-semibold leading-none tracking-normal sm:text-7xl">
          모든 태그
        </h1>
        <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
          관심 있는 태그를 선택해 관련 글을 모아보세요.
        </p>
      </section>

      {sortedTags.length > 0 ? (
        <nav aria-label="태그 목록" className="flex flex-wrap gap-2.5 sm:gap-3">
          {sortedTags.map((tag) => (
            <Link
              className="group inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-semibold transition-[color,background-color,border-color,transform] duration-200 hover:border-primary hover:bg-primary hover:text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:translate-y-px sm:text-base"
              href={`/tags/${tag.slug}`}
              key={tag.slug}
            >
              <span>{tag.label}</span>
              <span className="text-xs font-medium text-muted-foreground transition-colors group-hover:text-primary-foreground/70 sm:text-sm">
                {tagCounts.get(tag.slug) ?? 0}
              </span>
            </Link>
          ))}
        </nav>
      ) : (
        <div className="border-y border-border py-10">
          <p className="text-base font-semibold">아직 등록된 태그가 없습니다.</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            글에 태그가 추가되면 이곳에서 바로 찾아볼 수 있습니다.
          </p>
        </div>
      )}
    </main>
  );
}
