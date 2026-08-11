import type { ProjectCaseStudy } from "../project-types";

export const adminPlatformProject = {
  slug: "admin-platform",
  index: "08",
  name: "고객사 어드민 구조·개발 생산성 개선",
  meta: "Admin platform · 2025",
  description:
    "API 응답 기반 센터 관리 구조와 i18n 배포 전 검증을 도입하고 TypeScript migration을 진행했습니다.",
  role: "Frontend Engineer",
  period: "2025.03 ~ 2025.06",
  organization: "아이겐 코리아",
  technologies: ["React", "TypeScript", "Recoil", "i18n", "AWS CI"],
  metrics: [{ label: "평균 빌드 시간", value: "19%", detail: "CI build log 기준 단축" }],
  stories: [
    {
      eyebrow: "Architecture 01",
      title: "센터별 하드코딩을 API 응답 기반 화면으로 전환",
      problem:
        "신규 센터가 추가될 때마다 프론트엔드 코드를 수정하고 다시 배포해야 했습니다.",
      approach:
        "센터 목록, 상세 정보와 노출 조건을 API 응답 스키마 기준으로 매핑하고 Recoil selector와 LocalStorage cache로 조회·캐싱·반영 흐름을 분리했습니다.",
      result: "센터별 하드코딩 분기를 제거해 운영 변경에 필요한 프론트엔드 수정 범위를 줄였습니다.",
    },
    {
      eyebrow: "Tooling 02",
      title: "i18n 검증 자동화와 TypeScript migration",
      problem:
        "누락된 번역 key가 배포 후 런타임 UI에 그대로 노출되고 있었습니다.",
      approach:
        "국문 기준 누락 key 자동 검출 스크립트를 AWS CodePipeline에 연결하고 TypeScript 3.9.5에서 5.8.3으로 단계적으로 migration했습니다.",
      result: "번역 누락을 배포 전에 발견하고 CI build log 기준 평균 빌드 시간을 19% 단축했습니다.",
    },
  ],
} satisfies ProjectCaseStudy;
