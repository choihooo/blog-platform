import type { ProjectCaseStudy } from "../project-types";

export const dreamTrackProject = {
  slug: "dream-track",
  index: "04",
  name: "Dream Track",
  meta: "AI 진로 설계 서비스 · 2025",
  description:
    "사용자의 진로 탐색 과정을 AI 기반 설계 흐름으로 구체화한 SUMTECH HACKATHON 프로젝트입니다.",
  role: "Frontend Engineer",
  period: "2025.10",
  organization: "SUMTECH HACKATHON 2025",
  technologies: ["React", "TypeScript", "AI", "UX"],
  metrics: [{ label: "수상", value: "장려상", detail: "Dream Track 부문" }],
  stories: [
    {
      eyebrow: "Product 01",
      title: "AI 진로 설계 과정을 하나의 사용자 흐름으로 연결",
      problem:
        "진로 탐색에 필요한 입력과 추천 결과가 분리되면 사용자가 자신의 선택 기준과 다음 행동을 이해하기 어려웠습니다.",
      approach:
        "사용자 입력, AI 분석과 진로 제안을 순차적으로 확인할 수 있도록 화면 구조와 인터랙션 흐름을 설계하고 프론트엔드로 구현했습니다.",
      result: "Dream Track AI 진로 설계 서비스로 SUMTECH HACKATHON 2025 장려상을 수상했습니다.",
    },
  ],
} satisfies ProjectCaseStudy;
