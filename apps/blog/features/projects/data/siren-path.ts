import type { ProjectCaseStudy } from "../project-types";

export const sirenPathProject = {
  slug: "siren-path",
  index: "06",
  name: "Siren Path",
  meta: "기술 PoC · 2024",
  description:
    "서비스 아이디어의 핵심 기술 가능성을 검증하고 실제 사용 흐름으로 구체화한 PoC 프로젝트입니다.",
  role: "Frontend Engineer",
  period: "2024.12",
  organization: "KT&G 상상유니브 아이디어톤",
  technologies: ["React", "PoC", "UX", "Prototype"],
  metrics: [{ label: "수상", value: "대상", detail: "KT&G 상상유니브 아이디어톤" }],
  stories: [
    {
      eyebrow: "Prototype 01",
      title: "아이디어를 검증 가능한 기술 PoC와 UX 플로우로 전환",
      problem:
        "아이디어의 가치만 설명하는 단계에서는 핵심 기술의 구현 가능성과 사용자가 실제로 이용하는 과정을 함께 검증하기 어려웠습니다.",
      approach:
        "핵심 기능을 기술 PoC로 구현하고 사용자가 기능을 발견하고 결과를 확인하는 과정을 UX 플로우로 정리했습니다.",
      result: "기술 PoC와 UX 플로우를 바탕으로 KT&G 상상유니브 아이디어톤 대상을 수상했습니다.",
    },
  ],
} satisfies ProjectCaseStudy;
