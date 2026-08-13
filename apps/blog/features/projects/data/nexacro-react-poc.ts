import type { ProjectCaseStudy } from "../project-types";

export const nexacroReactPocProject = {
  slug: "nexacro-react-poc",
  index: "02",
  name: "Nexacro–React 전환 자동화",
  meta: "Migration PoC · 2026",
  description:
    "AI 기반 명세 자동화와 Playwright 검증으로 Nexacro 화면 유형 5종의 React 전환 가능성을 확인했습니다.",
  role: "Frontend Engineer",
  period: "2026.03 ~ 2026.04",
  organization: "야근몬스터",
  technologies: ["React", "Nexacro", "Playwright", "AI", "Spec Kit"],
  metrics: [
    { label: "화면 유형 검증", value: "5/5", detail: "주요 화면 유형 전환 검증" },
    { label: "명세 추출 성공률", value: "100%", detail: "UI 원천 데이터 수동 추출 제거" },
  ],
  stories: [
    {
      eyebrow: "Specification 01",
      title: "Nexacro 화면 정보를 React 구현 명세로 구조화",
      problem:
        "컴포넌트, 절대좌표, 이벤트와 데이터 필드를 React 구현 명세로 옮기는 절차가 없어 정보 누락과 전환 품질을 검증하기 어려웠습니다.",
      approach:
        "Playwright CLI로 원본 화면 정보를 추출하고 화면 구조, 기능 요구사항, acceptance criteria와 고객사 코드 제약조건을 분리한 Markdown 명세로 구조화했습니다.",
      result: "UI 원천 데이터의 수동 추출을 제거하고 명세 추출 성공률 100%를 달성했습니다.",
    },
    {
      eyebrow: "Validation 02",
      title: "동일 viewport와 기능별 기준으로 화면 유형 5종 검증",
      problem:
        "반응형 기준이 없는 Nexacro 화면이 React에서 원본의 정보 구조와 기능을 재현했는지 판단할 공통 기준이 필요했습니다.",
      approach:
        "고객사와 핵심 정보 및 하위 화면 이동 기준을 조율하고, 동일 viewport 스크린샷 비교와 기능별 acceptance criteria로 결과를 검증했습니다.",
      result: "주요 화면 유형 5종 중 5종의 React 전환 가능성과 재현도를 검증했습니다.",
    },
  ],
} satisfies ProjectCaseStudy;
