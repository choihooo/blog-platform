import type { ProjectCaseStudy } from "../project-types";

export const typescriptMigrationProject = {
  slug: "typescript-migration",
  index: "06",
  name: "TypeScript 5 마이그레이션",
  meta: "Developer productivity · 2025",
  description:
    "TypeScript 3.9.5를 5.8.3으로 전환하고 타입 오류를 정리해 빌드 시간과 런타임 안정성을 개선했습니다.",
  role: "Frontend Engineer",
  period: "2025.04 ~ 2025.06",
  organization: "아이겐 코리아",
  technologies: ["TypeScript", "React", "Migration", "Build", "Type Safety"],
  relatedPosts: [
    {
      slug: "typescript-compiler-performance-39-vs-58",
      title: "TypeScript 컴파일러 성능 측정 (3.9 vs 5.8)",
      excerpt: "실제 마이그레이션 전후의 컴파일 성능을 같은 조건에서 비교했습니다.",
    },
    {
      slug: "typescript-compiler-internals",
      title: "타입 스크립트 컴파일러 동작 방식",
      excerpt: "빌드 속도 변화의 원인을 이해하기 위해 컴파일러의 처리 단계를 살펴봅니다.",
    },
  ],
  metrics: [
    { label: "빌드 시간", value: "−19%", detail: "246.22초 → 199.51초" },
    { label: "런타임 오류", value: "−63%", detail: "27건 → 10건" },
  ],
  stories: [
    {
      eyebrow: "Migration 01",
      title: "TypeScript 3.9.5에서 5.8.3으로 단계적 전환",
      problem:
        "오래된 TypeScript와 any 타입으로 인해 잘못된 데이터가 컴파일 단계에서 검출되지 않고 실행 중에 발견됐습니다.",
      approach:
        "TypeScript 5.8.3 적용 후 발생한 타입 오류 500건 이상을 수정하고 그래프 API 응답을 인터페이스로 정의해 입력값을 number 타입으로 제한했습니다.",
      result: "런타임 오류를 27건에서 10건으로 줄여 63% 감소시켰습니다.",
    },
    {
      eyebrow: "Build 02",
      title: "동일한 조건에서 마이그레이션 전후 성능 검증",
      problem:
        "프로덕션 빌드에 평균 246.22초가 소요됐지만 마이그레이션이 실제 생산성에 미친 영향을 판단할 측정값이 없었습니다.",
      approach:
        "동일한 빌드 조건에서 마이그레이션 전후의 프로덕션 빌드 시간을 측정하고 7일간 런타임 오류를 함께 비교했습니다.",
      result: "평균 빌드 시간을 246.22초에서 199.51초로 줄여 19% 단축했습니다.",
    },
  ],
} satisfies ProjectCaseStudy;
