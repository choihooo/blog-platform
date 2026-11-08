import { projects, type ProjectContentBlock } from "../content/catalog/index.js";
import { loadPostContent, textFromEditorNodes } from "../content/index.js";
import {
  awards,
  activities,
  sideProjects,
  skillGroups,
  workExperiences,
} from "../content/catalog/index.js";
import type { PublicPostRow, RagDocument } from "./corpus-types.js";

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
        [p.organization, p.period, p.role].filter(Boolean).join(" · "),
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
