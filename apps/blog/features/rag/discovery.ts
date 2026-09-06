import { projects } from "../projects/project-data";
import { searchQuery } from "./identity";
import type { RagResult } from "./contracts";

/** Catalog requests read the same data as /projects, not an embedding similarity guess. */
export function projectCatalog(query: string): RagResult | null {
  const q = searchQuery(query).trim();
  if (
    !/^(?:(?:대표|주요|전체|개인|사이드|팀|회사)\s*)?프로젝트(?:\s*(?:목록|추천|소개|보여줘|알려줘|있어|뭐\s*있어|보여주세요|알려주세요|를|좀))*[?.!\s]*$/.test(
      q,
    )
  )
    return null;
  const personal = /개인|사이드/.test(q);
  const company = /회사/.test(q);
  const team = /팀/.test(q);
  const selected = projects
    .filter((p) =>
      team
        ? !!p.team && !p.team.startsWith("1인 개발")
        : personal
          ? p.organization === "Side Project"
          : company
            ? p.organization !== "Side Project"
            : true,
    )
    .slice(0, 3);
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
