import type { ProjectCaseStudy } from "../project-types";

export const i18nValidationProject = {
  slug: "i18n-validation",
  index: "05",
  name: "다국어 리소스 검증 자동화",
  meta: "CI automation · 2025",
  description:
    "다국어 리소스 누락을 자동 검출하고 배포 전에 차단해 사용자 화면에 노출되던 번역 키를 제거했습니다.",
  role: "Frontend Engineer",
  period: "2025.04 ~ 2025.06",
  organization: "아이겐 코리아",
  technologies: ["TypeScript", "i18n", "AWS CodePipeline", "JSON", "CI"],
  relatedPosts: [
    {
      slug: "contributing-korean-translation",
      title: "한국어 번역으로 기여하기",
      excerpt: "다국어 리소스를 추가하며 확인한 번역 구조와 검증 과정을 기록했습니다.",
    },
  ],
  metrics: [
    { label: "노출 키", value: "63 → 0", detail: "사용자 화면 기준" },
    { label: "키별 검증", value: "< 1초", detail: "기존 20~30초" },
  ],
  stories: [
    {
      eyebrow: "Validation 01",
      title: "중첩된 다국어 리소스의 누락과 불일치 자동 검출",
      problem:
        "수동 검증으로 한·중·일·영 리소스 누락을 배포 전에 발견하지 못해 사용자 화면에 i18n 키 63건이 그대로 노출됐습니다.",
      approach:
        "한국어 JSON을 기준으로 중첩 키 경로를 평탄화하고 언어별 누락 및 불일치 키를 자동으로 검출하는 TypeScript 스크립트를 구현했습니다.",
      result: "키별 검증 시간을 20~30초에서 1초 이내로 단축했습니다.",
    },
    {
      eyebrow: "CI 02",
      title: "번역 누락을 배포 전에 차단하는 공통 절차 도입",
      problem:
        "검증 스크립트가 로컬에서만 실행되면 개발자가 실행을 빠뜨렸을 때 동일한 문제가 다시 배포될 수 있었습니다.",
      approach:
        "AWS CodePipeline의 pre_build 단계에 검증을 연결하고 누락 발견 시 빌드를 실패시키도록 개발팀 공통 CI 절차에 적용했습니다.",
      result: "사용자 화면에 노출되던 i18n 키를 63건에서 0건으로 줄였습니다.",
    },
  ],
} satisfies ProjectCaseStudy;
