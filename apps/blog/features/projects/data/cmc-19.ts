import type { ProjectCaseStudy } from "../project-types";

export const cmc19Project = {
  slug: "cmc-19",
  index: "09",
  name: "CMC 19기 웹·앱 프론트엔드",
  meta: "Web & App · CMC 19기",
  description:
    "Turborepo 기반 React 웹앱과 Expo WebView, 공통 디자인 시스템을 연결한 프론트엔드 프로젝트입니다.",
  role: "Frontend Engineer",
  period: "CMC 19기",
  organization: "Central MakeUs Challenge",
  technologies: ["React", "TypeScript", "Turborepo", "Expo", "Design System"],
  metrics: [],
  stories: [
    {
      eyebrow: "Platform 01",
      title: "웹과 Expo 앱이 공유하는 프론트엔드 기반 구성",
      problem:
        "React 웹앱과 Expo WebView가 함께 동작하면서도 UI와 개발 기준을 일관되게 유지할 구조가 필요했습니다.",
      approach:
        "Turborepo를 중심으로 웹앱과 공통 디자인 시스템의 경계를 정리하고 Expo WebView에서 제품 흐름을 연결했습니다.",
      result: "웹과 앱에서 공통 UI 기준을 재사용할 수 있는 프론트엔드 구조를 구성했습니다.",
    },
  ],
} satisfies ProjectCaseStudy;
