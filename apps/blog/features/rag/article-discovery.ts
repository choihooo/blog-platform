import type { RagResult } from "./contracts";
import type { PublicPost } from "../blog/server/content-source";

export function articleDiscovery(
  query: string,
  posts: PublicPost[],
  excludeTitles: Set<string> = new Set(),
): RagResult {
  const topic = /React|리액트/i.test(query)
    ? /react|리액트/i
    : /AI|인공지능/i.test(query) && !/AI 제외/i.test(query)
      ? /\bai\b|인공지능/i
      : null;
  const selected = posts
    .filter((p) => !excludeTitles.has(p.title))
    .filter((p) => p.status === "published")
    .filter(
      (p) =>
        !topic ||
        topic.test([p.title, ...(p.tags ?? []), ...p.tagEntries.map((t) => t.label)].join(" ")),
    )
    .filter(
      (p) =>
        !/AI 제외/i.test(query) ||
        !/\bai\b|인공지능/i.test(
          [p.title, ...(p.tags ?? []), ...p.tagEntries.map((t) => t.label)].join(" "),
        ),
    )
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .slice(0, 3);
  return {
    answer: selected.length
      ? `발행일 기준으로 공개 글 ${selected.length}개를 골랐어요.\n\n${selected.map((p, i) => `${i + 1}. [${p.title}](/blog/${p.slug})\n${(p.excerpt ?? "요약 미등록 — 원문에서 내용을 확인해 주세요.").slice(0, 300)}`).join("\n\n")}`
      : "요청한 조건에 맞는 공개 글을 찾지 못했어요. 제외 조건이나 주제를 바꿔볼까요?",
    sources: selected.map((p) => ({
      title: p.title,
      url: `/blog/${p.slug}`,
      text: (p.excerpt ?? p.title).slice(0, 550),
      score: 1,
    })),
  };
}
