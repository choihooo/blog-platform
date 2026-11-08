import type { ProjectCaseStudy } from "../project-types.js";

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
  team: "1인 개발",
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
  sections: [
    {
      id: "resource-validation",
      eyebrow: "Case 01",
      title: "번역 누락이 배포 이후 사용자 화면에서 발견됨",
      blocks: [
        {
          type: "text",
          id: "problem",
          title: "문제",
          body: [
            "서비스는 한국어, 중국어, 일본어, 영어 리소스를 각각의 JSON 파일로 관리하고 있었습니다. 새로운 기능을 추가하거나 기존 문구를 변경할 때 기준 언어에는 키를 추가했지만 다른 언어에는 동일한 키를 추가하지 않는 문제가 발생했습니다.",
            "번역 키가 누락된 상태로 배포되면 사용자 화면에는 번역 문구 대신 product.detail.description과 같은 i18n 키가 그대로 표시됐습니다. 당시 운영 화면에서 63건이 발견됐으며, 사용자가 직접 화면에 진입하기 전까지 누락 여부를 알기 어려웠습니다.",
          ],
        },
        {
          type: "text",
          id: "analysis",
          title: "원인 분석",
          body: [
            "언어별 JSON은 여러 단계로 중첩된 객체 구조를 사용했습니다. 파일 전체를 직접 비교하면 객체의 깊이와 키의 위치가 달라 누락된 항목을 빠르게 찾기 어려웠고, 언어와 키가 늘어날수록 수동 비교의 누락 가능성도 높아졌습니다.",
            "각 언어의 파일을 열어 키를 검색하고 해당 언어로 화면을 실행하는 데 키 하나당 20~30초가 필요했습니다. 문제의 핵심은 번역 작업자의 실수 자체가 아니라 여러 언어가 동일한 키 구조를 유지하는지 검사하는 자동화된 기준이 없다는 점이었습니다.",
          ],
        },
        {
          type: "text",
          id: "solution",
          title: "해결",
          body: [
            "한국어 리소스를 기준 데이터로 사용하고 다른 언어의 JSON이 동일한 키 경로를 갖는지 비교하는 TypeScript 검증 스크립트를 구현했습니다. 먼저 중첩된 JSON 객체를 product.detail.description처럼 점으로 연결된 키 경로로 평탄화했습니다.",
            "평탄화한 키 집합을 언어별로 비교해 기준 언어에는 있지만 대상 언어에는 없는 키와 대상 언어에만 존재하는 불일치 키를 찾았습니다. 검증 결과에는 실패 여부뿐 아니라 누락이 발생한 언어와 전체 키 경로를 함께 출력해 개발자가 바로 수정 위치를 확인하도록 했습니다.",
          ],
        },
        {
          type: "result",
          id: "result",
          title: "결과",
          body: "사람이 언어별 파일과 화면을 오가며 확인하던 검증을 TypeScript 스크립트 실행 한 번으로 대체했습니다. 키 하나를 검증하는 데 걸리던 시간을 20~30초에서 1초 이내로 단축했고, 누락된 언어와 키 경로를 즉시 확인할 수 있게 했습니다. 중첩 깊이와 관계없이 동일한 방식으로 리소스 누락과 불일치를 검사하는 기반도 마련했습니다.",
        },
      ],
    },
    {
      id: "ci-quality-gate",
      eyebrow: "Case 02",
      title: "검증 스크립트를 실행하지 않으면 동일한 문제가 반복됨",
      blocks: [
        {
          type: "text",
          id: "problem",
          title: "문제",
          body: [
            "검증 스크립트를 구현한 뒤에도 개발자가 로컬에서 직접 실행해야 한다면 번역 누락을 완전히 방지할 수 없었습니다.",
            "일정이 촉박하거나 번역과 관계없는 변경이라고 판단한 경우 검증 명령을 생략할 수 있었습니다. 스크립트가 존재하더라도 실행 여부가 개인의 작업 방식에 달려 있으면 누락된 리소스가 다시 배포될 가능성이 남았습니다.",
          ],
        },
        {
          type: "text",
          id: "analysis",
          title: "원인 분석",
          body: [
            "로컬 검증은 개발자의 실수를 줄이는 보조 수단이지만 배포 조건으로 강제되지 않으면 팀 전체의 품질 기준이 되기 어려웠습니다.",
            "기존 배포 과정에는 모든 언어의 리소스 키가 일치해야 한다는 조건이 없었습니다. 코드 빌드가 성공하면 번역 리소스가 누락돼도 배포가 계속 진행됐고, i18n 키 구조의 일치 여부가 빌드 성공 조건에 포함되지 않은 것이 문제의 반복 가능성을 남겼습니다.",
          ],
        },
        {
          type: "text",
          id: "solution",
          title: "해결",
          body: [
            "TypeScript 검증 스크립트를 AWS CodePipeline의 pre_build 단계에 연결해 애플리케이션을 빌드하기 전에 모든 언어의 리소스 키를 비교하도록 변경했습니다.",
            "누락 또는 불일치 키가 발견되면 스크립트가 실패 상태를 반환하고 CodePipeline이 이후 빌드와 배포를 중단하도록 구성했습니다. 오류 로그에는 문제가 발생한 언어와 전체 키 경로를 표시해 개발자가 CI 결과만 보고도 수정 위치를 확인할 수 있게 했습니다.",
          ],
        },
        {
          type: "image",
          src: "/projects/diagrams/i18n-ci-validation.png",
          alt: "다국어 JSON 키를 평탄화해 비교하고 불일치 시 CI를 차단하는 검증 흐름",
          caption:
            "한국어 리소스를 기준으로 언어별 키 집합을 비교하고 누락 또는 초과 키가 있으면 빌드와 배포를 차단하는 흐름",
          layout: "full",
          width: 2298,
          height: 420,
        },
        {
          type: "result",
          id: "result",
          title: "결과",
          body: "번역 리소스 검증을 개인의 선택적인 확인 작업에서 팀 공통 배포 조건으로 전환했습니다. 누락된 키가 사용자에게 노출되기 전에 CI에서 발견되고 배포가 차단되면서 운영 화면에 노출되던 i18n 키를 63건에서 0건으로 줄였습니다. 새로운 기능이나 언어가 추가돼도 동일한 검증을 자동으로 적용할 수 있게 됐습니다.",
        },
      ],
    },
  ],
} satisfies ProjectCaseStudy;
