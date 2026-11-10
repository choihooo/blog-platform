import { projects } from "@blog-platform/core/content/catalog";
import type { SearchContext } from "./follow-up";
import type { RagResult, RagSource } from "@blog-platform/core/search";
import { retrieve } from "./server";
import { projectCatalog } from "./discovery";
import { articleDiscovery } from "./article-discovery";

const clarify = (answer: string): RagResult => ({ answer, sources: [], kind: "clarification" });

/** Re-read trusted records; client history and generated prose are never evidence. */
export async function conversationAnswer(
  query: string,
  context?: SearchContext,
  signal?: AbortSignal,
): Promise<RagResult | null> {
  const compare = /^(?:표로\s*)?비교해줘[?.!\s]*$/.test(query);
  const short =
    /^(?:좀\s*짧게|쉽게\s*설명해줘|세\s*줄로\s*요약해줘|핵심만\s*요약해줘)[?.!\s]*$/.test(query);
  const count = /^(?:([123])\s*개|([한두세])\s*개)(?:만)?(?:\s*추천해줘)?[?.!\s]*$/.exec(query);
  const more = /^(?:다른\s*것도\s*있어|더\s*있어|다음\s*목록)[?.!\s]*$/.test(query);
  if (!compare && !short && !count && !more) return null;
  if (!context?.titles.length)
    return clarify(
      "먼저 프로젝트나 글을 골라주세요. ‘대표 프로젝트’ 또는 ‘React 글 추천’으로 시작할 수 있어요.",
    );
  if (more) {
    const excluded = new Set([
      ...(context.history ?? []).flatMap((s) => s.titles),
      ...context.titles,
    ]);
    const catalogQuery = [...(context.history ?? []), context]
      .reverse()
      .find((s) => projectCatalog(s.query))?.query;
    if (catalogQuery) return projectCatalog(catalogQuery, { excludeTitles: excluded })!;
    const articleQuery = [...(context.history ?? []), context].find((s) =>
      /글|블로그|포스트/.test(s.query),
    )?.query;
    if (articleQuery) {
      const { getPublishedPostsStrict } = await import("../blog/server/content-source");
      return articleDiscovery(
        articleQuery,
        await getPublishedPostsStrict({ limit: 100, analyzeBody: false }),
        excluded,
      );
    }
    return clarify("어떤 주제의 다른 글을 찾을까요? 주제를 짧게 알려주세요.");
  }
  const selected = context.titles.map((title) => projects.find((p) => p.name === title));
  if (compare && selected.every(Boolean) && selected.length >= 2) {
    const cell = (s: string) => s.replace(/\|/g, "/").replace(/\n/g, " ");
    const rows = selected.map(
      (p) =>
        `| ${cell(p!.name)} | ${cell(p!.role)} | ${cell(p!.technologies.join(", "))} | ${cell(p!.metrics.map((m) => `${m.label} ${m.value}`).join(", ") || "미기재")} |`,
    );
    return {
      answer: `공개 프로젝트 기록을 같은 항목으로 비교했어요.\n\n| 프로젝트 | 역할 | 기술 | 기록된 성과 |\n| --- | --- | --- | --- |\n${rows.join("\n")}\n\n서로 다른 지표이므로 수치만으로 우열을 판단할 수는 없어요.`,
      sources: selected.map((p) => ({
        title: p!.name,
        url: `/projects/${p!.slug}`,
        text: p!.description.slice(0, 550),
        score: 1,
      })),
    };
  }
  const limit = count ? Number(count[1] || ({ 한: 1, 두: 2, 세: 3 }[count[2]!] ?? 3)) : 3;
  const sources: RagSource[] = [];
  for (const title of context.titles.slice(0, limit)) {
    const p = projects.find((p) => p.name === title);
    if (p)
      sources.push({
        title: p.name,
        url: `/projects/${p.slug}`,
        text: p.description.slice(0, 550),
        score: 1,
      });
    else {
      const result = await retrieve(`${title} 요약`, signal);
      const exact = result.sources.find((s) => s.title === title);
      if (exact) sources.push(exact);
    }
  }
  if (!sources.length)
    return clarify(
      "해당 제목의 원문을 다시 확인하지 못했어요. 제목이나 프로젝트를 다시 골라주세요.",
    );
  if (compare) {
    if (sources.length < 2)
      return clarify("비교하려면 원문을 확인할 수 있는 항목 두 개 이상이 필요해요.");
    const safe = (s: string) => s.replace(/[|\n]/g, " ");
    return {
      answer: `확인된 발췌 범위만 비교했어요. 난이도나 우열은 평가하지 않았어요.\n\n| 제목 | 확인된 내용 |\n| --- | --- |\n${sources.map((s) => `| ${safe(s.title)} | ${safe(s.text.slice(0, 180))} |`).join("\n")}`,
      sources,
    };
  }
  return {
    answer: `${short ? "원문에서 확인되는 핵심을 짧게 정리했어요." : `${sources.length}개를 골랐어요.`}\n\n${sources.map((s, i) => `${i + 1}. [${s.title}](${s.url})\n${s.text.slice(0, short ? 160 : 300)}${s.text.length > (short ? 160 : 300) ? "…" : ""}`).join("\n\n")}`,
    sources,
  };
}
