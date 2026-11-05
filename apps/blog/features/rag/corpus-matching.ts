import type { RagChunk } from "./corpus-types";

export function currentMatches(
  chunks: RagChunk[],
  matches: { id: string; score: number }[],
  query = "",
  minScore = 0.48,
) {
  const articlesOnly = /블로그|\bblog\b|(?:^|\s)글(?:[을은이도만\s?!]|$)/i.test(query);
  const current = new Map(chunks.map((c) => [c.id, c]));
  const introductions = new Map<string, string>();
  for (const chunk of chunks)
    if (!introductions.has(chunk.url)) introductions.set(chunk.url, chunk.text);
  const counts = new Map<string, number>();
  const result = [];
  const terms = [
    ...new Set(
      query
        .toLowerCase()
        .replace(/([a-z0-9+#.]+)(?:에|을|를|은|는|이|가|와|랑)(?=\s|$)/g, "$1")
        .replace(
          /(?:관련|대한|대해서|카테고리|블로그|포스트|프로젝트|추천|설명|소개|알려|보여|찾아)(?:주세요|해줘|줘|해|요)?/g,
          " ",
        )
        .split(/[^a-z0-9가-힣+#.]+/)
        .filter(
          (t) =>
            t.length >= 2 &&
            ![
              "있어",
              "있나요",
              "글을",
              "글은",
              "글이",
              "글도",
              "어떤",
              "무슨",
              "최호",
              "자세히",
              "해주세요",
            ].includes(t),
        ),
    ),
  ];
  const ranked = new Map(matches.filter((m) => Number.isFinite(m.score)).map((m) => [m.id, m]));
  const visited = new Set<string>();
  const metadataIds = new Set<string>();
  for (const chunk of chunks) {
    if (articlesOnly && !chunk.url.startsWith("/blog/")) continue;
    if (visited.has(chunk.url)) continue;
    visited.add(chunk.url);
    const metadata = [chunk.title, ...(chunk.tags ?? []), ...(chunk.categories ?? [])]
      .join(" ")
      .toLowerCase();
    const hits = terms.filter((term) =>
      /^[a-z0-9]+$/.test(term)
        ? new RegExp(`(^|[^a-z0-9])${term}($|[^a-z0-9])`).test(metadata)
        : metadata.includes(term),
    ).length;
    if (terms.length && hits / terms.length >= 0.5) {
      metadataIds.add(chunk.id);
      ranked.set(chunk.id, { id: chunk.id, score: 1 + hits / terms.length });
    }
  }
  for (const match of [...ranked.values()].sort((a, b) => b.score - a.score)) {
    const chunk = current.get(match.id);
    if (
      !chunk ||
      (metadataIds.size > 0 && !metadataIds.has(match.id)) ||
      (articlesOnly && !chunk.url.startsWith("/blog/")) ||
      match.score < minScore ||
      (counts.get(chunk.url) ?? 0) >= (chunk.url.startsWith("/blog/") ? 1 : 2)
    )
      continue;
    result.push({
      title: chunk.title.slice(0, 200),
      url: chunk.url,
      text:
        chunk.url.startsWith("/blog/") && introductions.get(chunk.url) !== chunk.text
          ? `글 소개: ${introductions.get(chunk.url)!.slice(0, 300)}\n관련 본문: ${chunk.text.slice(0, 200)}`
          : chunk.text,
      score: match.score,
    });
    counts.set(chunk.url, (counts.get(chunk.url) ?? 0) + 1);
    if (result.length === 3) break;
  }
  return result;
}
