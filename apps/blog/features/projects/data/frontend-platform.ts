import type { ProjectCaseStudy } from "../project-types";

export const frontendPlatformProject = {
  slug: "frontend-platform",
  index: "07",
  name: "AI 제품 프론트엔드 플랫폼 개선",
  meta: "Product platform · 2026",
  description:
    "포렌식 에이전트 데스크톱 앱의 검증 UI부터 공통 UI Kit과 레거시 전환 기준까지 제품 프론트엔드 기반을 정리했습니다.",
  role: "Frontend Engineer",
  period: "2026.03 ~ 2026.05",
  organization: "야근몬스터",
  technologies: ["React", "TypeScript", "Electron", "Qdrant", "i18n", "Playwright"],
  metrics: [],
  stories: [
    {
      eyebrow: "Product 01",
      title: "검색 결과의 출처와 근거를 먼저 확인하는 Evidence UI",
      problem:
        "score 중심의 검색 결과만으로는 사용자가 결과의 신뢰도를 판단할 근거가 부족했습니다.",
      approach:
        "문서·이미지·오디오·영상 hit를 공통 Result 모델로 정규화하고 file metadata, snippet과 STT segment를 Evidence 필드로 매핑했습니다. 검증된 payload만 renderer에 전달하도록 preload bridge 기준도 정리했습니다.",
      result: "실제 search hit의 출처와 근거를 중심으로 검색 결과를 검증할 수 있는 UI를 구현했습니다.",
    },
    {
      eyebrow: "System 02",
      title: "React UI Kit과 component showcase의 공통 기준 정리",
      problem:
        "신규 수주와 PoC마다 유사 UI와 다국어 처리 방식을 반복해서 구현하고 있었습니다.",
      approach:
        "atom과 molecule 컴포넌트의 props, state, variation을 확인하는 showcase를 구성하고 hardcoded text를 번역 key 기반으로 전환했습니다.",
      result: "props table, code example과 state preview를 한곳에서 확인하고 재사용할 수 있게 했습니다.",
    },
    {
      eyebrow: "Migration 03",
      title: "절대좌표 기반 레거시 화면의 React 전환 기준 수립",
      problem:
        "반응형 기준이 없는 Nexacro absolute 화면을 React로 전환할 화면 단위 명세와 검증 기준이 필요했습니다.",
      approach:
        "layout, interaction과 data state 기준을 분리해 acceptance criteria를 만들고 동일 viewport에서 원본과 전환 화면을 Playwright로 비교했습니다.",
      result: "화면별 React 전환 가능성과 사용성, 재현도를 일관된 기준으로 검증할 수 있게 했습니다.",
    },
  ],
} satisfies ProjectCaseStudy;
