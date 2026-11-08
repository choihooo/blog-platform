import { projects } from "@blog-platform/core/content/catalog";
import { searchQuery } from "@blog-platform/core/search";
import type { RagResult } from "@blog-platform/core/search";

/** Catalog requests read the same data as /projects, not an embedding similarity guess. */
export function projectCatalog(
  query: string,
  options?: { excludeTitles?: Set<string> },
): RagResult | null {
  const q = searchQuery(query)
    .trim()
    .replace(
      /어떤 프로젝트 했어|대표작 보여줘|가장 잘한 프로젝트가 뭐야|어떤 프로젝트 해봤어/g,
      "대표 프로젝트",
    )
    .replace(/실제 회사에서 만든 것도 있어|회사에서 한 프로젝트는/g, "회사 프로젝트")
    .replace(/혼자 만든 (?:거 있어|걸로)/g, "혼자 만든 프로젝트")
    .replace(/팀으로 만든 프로젝트는/g, "팀 프로젝트");
  if (
    !/^(?:(?:대표|주요|전체|개인|사이드|팀|회사|혼자 만든|최근|React|AI)\s*)?프로젝트(?:\s*(?:목록|추천|소개|보여줘|알려줘|있어|뭐\s*있어|보여주세요|알려주세요|를|좀|AI 제외))*[?.!\s]*$/.test(
      q,
    )
  )
    return null;
  const personal = /개인|사이드/.test(q);
  const company = /회사/.test(q);
  const team = /팀/.test(q);
  const solo = /혼자/.test(q);
  const recent = /최근/.test(q);
  const technology = /React/i.test(q) ? "react" : /^AI/.test(q) ? "ai" : null;
  const selected = projects
    .filter((p) => !options?.excludeTitles?.has(p.name))
    .filter((p) =>
      solo
        ? p.team?.startsWith("1인 개발")
        : team
          ? !!p.team && !p.team.startsWith("1인 개발")
          : personal
            ? p.organization === "Side Project"
            : company
              ? p.organization !== "Side Project" && p.format !== "showcase"
              : true,
    )
    .filter((p) => !technology || p.technologies.some((t) => t.toLowerCase() === technology))
    .filter((p) => !/AI 제외/.test(q) || !p.technologies.some((t) => t.toLowerCase() === "ai"))
    .sort((a, b) => (recent ? (b.period ?? "").localeCompare(a.period ?? "") : 0))
    .slice(0, 3);
  if (!selected.length)
    return {
      answer: "요청한 조건에 맞는 공개 프로젝트가 없어요. 회사·개인·기술 조건을 바꿔볼까요?",
      sources: [],
    };
  return {
    answer: `공개 포트폴리오의 ${personal ? "사이드 " : ""}프로젝트 ${selected.length}개를 먼저 소개할게요.\n\n${selected.map((p, i) => `## ${i + 1}. ${p.name}\n${p.description}`).join("\n\n")}\n\n궁금한 프로젝트명이나 순서를 말해 주면 더 자세히 찾아볼게요.`,
    sources: selected.map((p) => ({
      title: p.name,
      url: `/projects/${p.slug}`,
      text: p.description.slice(0, 550),
      score: 1,
    })),
  };
}

export function noEvidence(query: string): RagResult {
  const articles = /글|블로그|포스트/.test(query);
  return {
    kind: "no-evidence",
    answer: articles
      ? "이 주제에 맞는 공개 글을 아직 찾지 못했어요. 글이 없다고 단정할 수는 없어요. React·AI처럼 주제를 짧게 바꾸거나, 기억나는 제목을 알려주세요."
      : "현재 검색 결과만으로는 정확하게 답하기 어려워요. 프로젝트를 찾는 거라면 ‘대표 프로젝트’, 경력이 궁금하면 ‘개발 경험’으로 범위를 좁혀볼 수 있어요. 어떤 쪽이 궁금한가요?",
    sources: [],
  };
}
