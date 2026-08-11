import type { ProjectCaseStudy } from "../project-types";

export const jikhaengProject = {
  slug: "jikhaeng",
  index: "05",
  name: "직행 기업 프로젝트",
  meta: "채용 서비스 · 2025",
  description:
    "온보딩, 추천 공고와 메모 기능을 연결해 구직자가 공고를 탐색하고 관리하는 흐름을 개선했습니다.",
  role: "Frontend Engineer",
  period: "2025.09",
  organization: "직행 기업 프로젝트",
  technologies: ["React", "TypeScript", "Product UX"],
  metrics: [{ label: "수상", value: "우수상", detail: "직행 기업 프로젝트" }],
  stories: [
    {
      eyebrow: "Product 01",
      title: "온보딩부터 추천 공고 관리까지 이어지는 경험 설계",
      problem:
        "사용자의 관심 조건을 수집하는 온보딩과 추천 공고 탐색, 지원 전 메모가 분리되면 공고를 비교하고 관리하기 어려웠습니다.",
      approach:
        "온보딩에서 수집한 정보를 추천 공고 화면에 연결하고, 공고별 메모를 남길 수 있도록 탐색과 관리 흐름을 구성했습니다.",
      result: "온보딩·추천 공고·메모 기능을 구현해 직행 기업 프로젝트 우수상을 수상했습니다.",
    },
  ],
} satisfies ProjectCaseStudy;
