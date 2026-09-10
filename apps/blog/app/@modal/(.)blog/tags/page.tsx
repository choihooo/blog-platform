import Link from "next/link";
import { Chip, ChipGroup, EmptyState } from "@hozui/react";

import { BlogArchiveModal } from "@/features/blog/components/blog-archive-modal";
import { getPublishedPosts } from "@/features/blog/server/content-source";

export default async function BlogTagsModal() {
  const posts = await getPublishedPosts({ limit: 100, analyzeBody: false });
  const tags = new Map<string, { label: string; count: number }>();

  for (const post of posts) {
    const seen = new Set<string>();
    for (const tag of post.tagEntries) {
      if (seen.has(tag.slug)) continue;
      seen.add(tag.slug);
      const current = tags.get(tag.slug);
      tags.set(tag.slug, { label: tag.label, count: (current?.count ?? 0) + 1 });
    }
  }

  const sortedTags = [...tags.entries()].sort(
    ([leftSlug, left], [rightSlug, right]) =>
      right.count - left.count ||
      left.label.localeCompare(right.label, "ko") ||
      leftSlug.localeCompare(rightSlug),
  );

  return (
    <BlogArchiveModal title="BLOG TAGS">
      <main className="mx-auto w-full max-w-5xl px-5 pb-12 pt-8 sm:px-8 sm:pb-16 sm:pt-10">
        {sortedTags.length > 0 ? (
          <ChipGroup aria-label="태그 목록" className="flex flex-wrap gap-2.5 sm:gap-3" role="nav">
            {sortedTags.map(([slug, tag]) => (
              <Link href={`/blog/tags/${slug}`} key={slug}>
                <Chip label={`${tag.label} · ${tag.count}`} tone="accent" />
              </Link>
            ))}
          </ChipGroup>
        ) : (
          <EmptyState
            className="border-y border-border"
            description="글에 태그가 추가되면 이곳에서 바로 찾아볼 수 있습니다."
            media="icon"
            title="아직 등록된 태그가 없습니다."
          />
        )}
      </main>
    </BlogArchiveModal>
  );
}
