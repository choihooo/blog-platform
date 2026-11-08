import type { RagChunk } from "./corpus-types";
import { referencedProjects } from "./project-identity";

function passageWindow(text: string, terms: string[], limit: number, metrics?: RegExp): string {
  const lower = text.toLowerCase();
  const starts = [
    0,
    ...terms.map((term) => Math.max(0, lower.indexOf(term) - 40)),
    ...(metrics ? [...text.matchAll(metrics)].map((m) => Math.max(0, m.index! - 60)) : []),
  ];
  const coverage = (start: number) =>
    terms.filter((term) => lower.slice(start, start + limit).includes(term)).length;
  const metricCoverage = (start: number) =>
    metrics ? [...text.slice(start, start + limit).matchAll(metrics)].length : 0;
  const start = starts.sort(
    (a, b) => metricCoverage(b) - metricCoverage(a) || coverage(b) - coverage(a) || a - b,
  )[0]!;
  return text.slice(start, start + limit);
}

export function currentMatches(
  chunks: RagChunk[],
  matches: { id: string; score: number }[],
  query = "",
  minScore = 0.48,
) {
  const articlesOnly = /블로그|\bblog\b|(?:^|\s)글(?:[을은이도만\s?!]|$)/i.test(query);
  const preferProjectPages =
    !articlesOnly &&
    !/회고|후기|포스트|포스팅/.test(query) &&
    /성과|실적|결과|수치|사용자\s*수|이용자\s*수|매출|전환율|성공률|검증률|얼마나|몇\s*(?:명|시간|개|종)|단축|절감/.test(
      query,
    );
  const current = new Map(chunks.map((c) => [c.id, c]));
  const introductions = new Map<string, string>();
  for (const chunk of chunks)
    if (!introductions.has(chunk.key)) introductions.set(chunk.key, chunk.text);
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
  const referencedUrls = new Set(
    preferProjectPages ? referencedProjects(query).map((p) => `/projects/${p.slug}`) : [],
  );
  const preferredProjects = new Set(
    preferProjectPages
      ? [...ranked.values()]
          .filter(
            (match) =>
              match.score >= minScore &&
              current.get(match.id)?.url.startsWith("/projects/") &&
              (!referencedUrls.size || referencedUrls.has(current.get(match.id)!.url)),
          )
          .map((match) => match.id)
      : [],
  );
  const hasTerm = (text: string, term: string) =>
    /^[a-z0-9]+$/.test(term)
      ? new RegExp(`(^|[^a-z0-9])${term}($|[^a-z0-9])`).test(text)
      : text.includes(term);
  const metricPattern = /사용자|이용자|유저/.test(query)
    ? /\d[\d,.]*\s*명/g
    : /검증|성공/.test(query)
      ? /\d[\d,.]*\s*(?:%|종)|\d+\s*\/\s*\d+/g
      : /\d[\d,.]*\s*(?:명|시간|초|%|종|건)|\d+\s*\/\s*\d+/g;
  const metricCount = (text: string) => [...text.matchAll(metricPattern)].length;
  const visited = new Set<string>();
  const metadataIds = new Set<string>();
  for (const chunk of chunks) {
    if (articlesOnly && !chunk.url.startsWith("/blog/")) continue;
    if (visited.has(chunk.key)) continue;
    visited.add(chunk.key);
    const metadata = [chunk.title, ...(chunk.tags ?? []), ...(chunk.categories ?? [])]
      .join(" ")
      .toLowerCase();
    const hits = terms.filter((term) => hasTerm(metadata, term)).length;
    const projectOutcome = preferProjectPages && chunk.url.startsWith("/projects/");
    const namedProject = projectOutcome && referencedUrls.has(chunk.url);
    if (terms.length && (hits / terms.length >= 0.5 || namedProject)) {
      // Metadata identifies a document, not necessarily its introduction chunk.
      const passages = chunks.filter((c) => c.key === chunk.key);
      const coverage = (text: string) => terms.filter((t) => text.toLowerCase().includes(t)).length;
      const best = passages.sort(
        (a, b) =>
          (projectOutcome ? metricCount(b.text) - metricCount(a.text) : 0) ||
          coverage(b.text) - coverage(a.text) ||
          (ranked.get(b.id)?.score ?? -1) - (ranked.get(a.id)?.score ?? -1),
      )[0]!;
      metadataIds.add(best.id);
      ranked.set(best.id, { id: best.id, score: 1 + hits / terms.length });
      if (projectOutcome && (!referencedUrls.size || namedProject)) {
        for (const passage of passages) preferredProjects.delete(passage.id);
        preferredProjects.add(best.id);
      }
    }
  }
  for (const match of [...ranked.values()].sort(
    (a, b) =>
      Number(preferredProjects.has(b.id)) - Number(preferredProjects.has(a.id)) ||
      b.score - a.score,
  )) {
    const chunk = current.get(match.id);
    if (
      !chunk ||
      (metadataIds.size > 0 && !metadataIds.has(match.id) && !preferredProjects.has(match.id)) ||
      (articlesOnly && !chunk.url.startsWith("/blog/")) ||
      match.score < minScore ||
      (counts.get(chunk.url) ?? 0) >= (chunk.url.startsWith("/blog/") ? 1 : 2)
    )
      continue;
    result.push({
      title: chunk.title.slice(0, 200),
      url: chunk.url,
      text:
        introductions.get(chunk.key) !== chunk.text
          ? `소개: ${introductions.get(chunk.key)!.slice(0, 200)}\n관련 본문: ${passageWindow(chunk.text, terms, 320, preferredProjects.has(match.id) ? metricPattern : undefined)}`
          : chunk.text,
      score: match.score,
    });
    counts.set(chunk.url, (counts.get(chunk.url) ?? 0) + 1);
    if (result.length === 3) break;
  }
  return result;
}
