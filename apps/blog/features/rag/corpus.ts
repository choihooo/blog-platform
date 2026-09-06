import { projects, type ProjectContentBlock } from "../projects/project-data";
import {
  workExperiences,
  sideProjects,
  activities,
  awards,
  skillGroups,
} from "../resume/resume-data";
import { loadPostContent, textFromEditorNodes } from "../../../../packages/editor/src/post-content";

export type RagDocument = {
  key: string;
  title: string;
  url: string;
  text: string;
  tags?: string[];
  categories?: string[];
};
export type RagChunk = RagDocument & { id: string };
export type PublicPostRow = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  content: string;
  tags_json?: string | null;
  category_name?: string | null;
  category_slug?: string | null;
  parent_category_name?: string | null;
  parent_category_slug?: string | null;
};
export const EMBEDDING_MODEL = "@cf/baai/bge-m3" as const;

function blockText(block: ProjectContentBlock): string {
  if ("body" in block)
    return [block.title, ...(Array.isArray(block.body) ? block.body : [block.body])]
      .filter(Boolean)
      .join("\n");
  if (block.type === "bullets") return block.items.join("\n");
  if (block.type === "metrics")
    return block.items.map((m) => `${m.label}: ${m.value}. ${m.detail}`).join("\n");
  if (block.type === "columns")
    return block.items
      .map((i) => `${i.title ?? ""}\n${typeof i.body === "string" ? i.body : i.body.join("\n")}`)
      .join("\n");
  return "caption" in block ? (block.caption ?? "") : "";
}

export function staticDocuments(): RagDocument[] {
  return [
    ...projects.map((p) => ({
      key: `project:${p.slug}`,
      title: p.name,
      url: `/projects/${p.slug}`,
      text: [
        p.description,
        `${p.organization} · ${p.period} · ${p.role}`,
        p.technologies.join(", "),
        ...p.metrics.map((m) => `${m.label}: ${m.value}. ${m.detail}`),
        ...(p.sections?.map((s) => `${s.title}\n${s.blocks.map(blockText).join("\n\n")}`) ??
          p.stories?.map(
            (s) => `${s.title}\n문제: ${s.problem}\n해결: ${s.approach}\n결과: ${s.result}`,
          ) ??
          []),
      ].join("\n\n"),
    })),
    ...workExperiences.map((w, i) => ({
      key: `resume:career:${i}`,
      title: `최호 · ${w.company} 경력`,
      url: "/resume",
      text: `${w.company} · ${w.period} · ${w.role}\n${w.description}`,
    })),
    ...workExperiences.map((w, i) => ({
      key: `resume:work:${i}`,
      title: `최호 · ${w.company}`,
      url: "/resume",
      text: `${w.company} · ${w.period}\n${w.achievements.map((a) => `${a.title}\n${a.context}\n${a.details.join("\n")}\n${a.result}`).join("\n\n")}`,
    })),
    {
      key: "resume:skills",
      title: "최호 · 기술 스택",
      url: "/resume",
      text: skillGroups.map(([g, s]) => `${g}: ${s.join(", ")}`).join("\n"),
    },
    {
      key: "resume:activities",
      title: "최호 · 활동·수상",
      url: "/resume",
      text: [...activities, ...awards].map((a) => a.join(": ")).join("\n\n"),
    },
    ...sideProjects.map((p, i) => ({
      key: `resume:side:${i}`,
      title: `최호 · ${p.name}`,
      url: "/resume",
      text: `${p.meta}\n${p.description}\n${p.achievements.map((a) => `${a.title}\n${a.context}\n${a.details.join("\n")}\n${a.result}`).join("\n\n")}`,
    })),
  ];
}

export function postDocument(row: PublicPostRow): RagDocument {
  const parsed: unknown = JSON.parse(row.tags_json ?? "[]");
  if (!Array.isArray(parsed)) throw new Error("corpus_unavailable");
  const tags = normalizeTerms(
    parsed.flatMap((tag: unknown) =>
      tag && typeof tag === "object" && "name" in tag && "slug" in tag ? [tag.name, tag.slug] : [],
    ),
  );
  return {
    key: `post:${row.id}`,
    title: row.title,
    url: `/blog/${encodeURIComponent(row.slug)}`,
    tags,
    categories: normalizeTerms([
      row.parent_category_name,
      row.parent_category_slug,
      row.category_name,
      row.category_slug,
    ]),
    text: [row.summary, textFromEditorNodes(loadPostContent(row.content).nodes)]
      .filter(Boolean)
      .join("\n\n"),
  };
}

function normalizeTerms(values: unknown[]): string[] {
  return [
    ...new Set(
      values
        .filter((v): v is string => typeof v === "string")
        .map((v) => v.normalize("NFC").trim())
        .filter(Boolean),
    ),
  ].sort();
}

/** Repeat classification for every chunk, including the end of long articles. */
export function embeddingText(document: RagDocument): string {
  return [
    document.title,
    document.categories?.length ? `카테고리: ${document.categories.join(", ")}` : "",
    document.tags?.length ? `태그: ${document.tags.join(", ")}` : "",
    document.text,
  ]
    .filter(Boolean)
    .join("\n");
}

export async function chunkDocuments(documents: RagDocument[]): Promise<RagChunk[]> {
  const chunks: RagChunk[] = [];
  for (const document of documents) {
    const text = document.text.replace(/\r\n/g, "\n").trim();
    // Bound a pathological article; fail explicitly instead of silently dropping content.
    if (text.length > 100_000) throw new Error("document_too_large");
    for (let offset = 0; offset < text.length;) {
      let end = Math.min(offset + 500, text.length);
      if (end < text.length) {
        const boundary = text.lastIndexOf("\n", end);
        if (boundary > offset + 250) end = boundary;
      }
      const part = text.slice(offset, end).trim();
      const hash = await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(
          JSON.stringify([
            EMBEDDING_MODEL,
            "v1",
            document.key,
            document.title,
            document.url,
            part,
            ...(document.tags || document.categories
              ? ["taxonomy-v1", document.categories ?? [], document.tags ?? []]
              : []),
          ]),
        ),
      );
      const id = Array.from(new Uint8Array(hash), (b) => b.toString(16).padStart(2, "0")).join("");
      chunks.push({ ...document, text: part, id });
      if (end === text.length) break;
      offset = end - 50;
    }
  }
  return [...new Map(chunks.map((c) => [c.id, c])).values()];
}

export function currentMatches(
  chunks: RagChunk[],
  matches: { id: string; score: number }[],
  query = "",
) {
  const articlesOnly = /블로그|\bblog\b|(?:^|\s)글(?:[을은이도만\s?!]|$)/i.test(query);
  const current = new Map(chunks.map((c) => [c.id, c]));
  const introductions = new Map<string, string>();
  for (const chunk of chunks)
    if (!introductions.has(chunk.url)) introductions.set(chunk.url, chunk.text);
  const counts = new Map<string, number>();
  const result = [];
  // Current public title/tag/category matches can recover documents whose old vector
  // IDs were invalidated. Never search stale vector metadata or unpublished content.
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
      match.score < 0.48 ||
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
