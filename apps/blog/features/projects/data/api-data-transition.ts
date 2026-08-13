import type { ProjectCaseStudy } from "../project-types";

export const apiDataTransitionProject = {
  slug: "api-data-transition",
  index: "04",
  name: "API 기반 운영 데이터 전환",
  meta: "Admin architecture · 2025",
  description:
    "프론트엔드의 하드코딩 enum을 제거하고 백엔드 API 응답을 단일 데이터 기준으로 전환했습니다.",
  role: "Frontend Engineer",
  period: "2025.03 ~ 2025.04",
  organization: "아이겐 코리아",
  technologies: ["React", "Recoil", "REST API", "LocalStorage", "Architecture"],
  metrics: [
    { label: "운영 변경 절차", value: "4 → 2", detail: "신규 센터 추가 단계 50% 축소" },
    { label: "프론트 재배포", value: "1 → 0", detail: "신규 센터 추가 기준" },
  ],
  stories: [
    {
      eyebrow: "Root cause 01",
      title: "프론트엔드와 백엔드에 중복된 데이터 기준 제거",
      problem:
        "백엔드에 센터와 클라이언트를 추가해도 운영 화면에 반영되지 않았고, 프론트엔드와 백엔드가 동일한 enum을 각각 관리해 수정 누락 시 데이터가 불일치했습니다.",
      approach:
        "프론트엔드의 하드코딩 enum을 제거하고 백엔드 API 응답을 센터 데이터의 단일 기준으로 사용하도록 구조를 변경했습니다.",
      result: "데이터 관리 지점을 2곳에서 1곳으로 줄여 불일치가 발생할 구조적 원인을 제거했습니다.",
    },
    {
      eyebrow: "Architecture 02",
      title: "기존 상태 구조를 유지하며 API 기반 화면으로 전환",
      problem:
        "데이터 원천을 바꾸면서 기존 화면 전체의 상태 관리 구조까지 수정하면 변경 범위와 회귀 위험이 커질 수 있었습니다.",
      approach:
        "로그인 시 센터 목록을 LocalStorage에 저장하고 화면별 가공 데이터는 기존 Recoil selector에서 파생하도록 구성해 변경 범위를 최소화했습니다.",
      result:
        "신규 센터 추가 절차를 4단계에서 2단계로 줄이고 프론트엔드 수정과 재배포를 없앴습니다.",
    },
  ],
} satisfies ProjectCaseStudy;
