import type { ProjectCaseStudy } from "../project-types.js";

export const typescriptMigrationProject = {
  slug: "typescript-migration",
  index: "06",
  name: "TypeScript 5 마이그레이션",
  meta: "Developer productivity · 2025",
  description:
    "TypeScript 3.9.5를 5.8.3으로 전환하고 타입 오류를 정리해 프로덕션 빌드 시간과 런타임 안정성을 개선했습니다.",
  role: "Frontend Engineer",
  period: "2025.04 ~ 2025.06",
  organization: "아이겐 코리아",
  team: "1인 개발",
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
    { label: "프로덕션 빌드 시간", value: "−19%", detail: "246.22초 → 199.51초" },
    { label: "런타임 오류", value: "−63%", detail: "27건 → 10건" },
  ],
  sections: [
    {
      id: "type-safety-migration",
      eyebrow: "Case 01",
      title: "TypeScript 5 전환 후 컴파일 진단 500여 건을 어떻게 정리했는가",
      blocks: [
        {
          type: "text",
          id: "problem",
          title: "문제",
          body: [
            "TypeScript 3.9.5를 사용하던 프로젝트에는 any와 실제 API 응답에 맞지 않는 타입 정의가 누적되어 있었습니다. 잘못된 데이터가 컴파일 단계에서 검출되지 않고 그래프 입력값이나 API 응답을 처리하는 과정에서 런타임 오류로 이어졌습니다.",
            "5.8.3으로 버전을 올리자 컴파일러가 기존 코드에서 500여 건의 진단을 표시했습니다. 이는 서로 독립된 결함 500개라기보다, 공통 타입 하나의 불일치가 여러 화면의 사용 코드로 전파되며 누적된 결과였습니다. 따라서 버전만 교체해서는 마이그레이션을 완료할 수 없었습니다.",
          ],
        },
        {
          type: "text",
          id: "analysis",
          title: "원인 분석",
          body: [
            "기존의 any 타입은 오류를 해결한 것이 아니라 컴파일러의 검사를 우회하고 있었습니다. API에서 예상과 다른 값이 들어와도 컴파일은 성공했고 화면이 실행된 이후에야 문제가 발견됐습니다.",
            "진단을 추적해 보니 공통 타입 정의, 실제 응답과 맞지 않는 API 인터페이스, number로 처리해야 하지만 any로 전달되던 입력값, 그리고 이 타입을 참조하는 화면 코드가 연결되어 있었습니다. 개별 화면부터 고치면 같은 원인을 반복해서 수정하게 되므로 데이터가 들어오는 경계와 공통 타입을 먼저 정리하기로 했습니다.",
          ],
        },
        {
          type: "text",
          id: "solution",
          title: "해결",
          body: [
            "수정 순서를 공통 타입→API 응답 경계→기능별 사용 코드로 정했습니다. 상위 타입을 먼저 바로잡은 뒤 남은 진단만 화면 단위로 처리해, 같은 원인에서 파생된 오류를 파일마다 임시로 막는 일을 줄였습니다.",
            "대표적으로 그래프 API 응답은 실제 데이터 구조를 기준으로 인터페이스를 다시 정의하고, 계산에 쓰이는 입력값은 number만 받도록 제한했습니다. any를 다른 임시 타입으로 치환하지 않고 API 경계에서 타입을 확정해 이후 로직과 컴포넌트가 같은 타입을 이어서 사용하도록 변경했습니다.",
          ],
        },
        {
          type: "result",
          id: "result",
          title: "결과",
          body: "컴파일 진단 500여 건을 해소해 TypeScript 3.9.5에서 5.8.3으로 전환했습니다. API 경계와 공통 타입을 실제 데이터 구조에 맞춘 결과, 잘못된 값이 화면 로직까지 전달되기 전에 컴파일 단계에서 확인할 수 있게 됐습니다. 마이그레이션 이후 7일간 수집한 런타임 오류도 27건에서 10건으로 63% 감소했습니다.",
        },
      ],
    },
    {
      id: "production-build-performance",
      eyebrow: "Case 02",
      title: "마이그레이션의 프로덕션 빌드 성능 개선 효과를 검증할 기준이 없음",
      blocks: [
        {
          type: "text",
          id: "problem",
          title: "문제",
          body: [
            "기존 프로덕션 빌드에는 평균 246.22초가 걸렸습니다. 대기 시간이 길었지만 TypeScript 버전 전환이 실제 개발 생산성에 어떤 영향을 미쳤는지 판단할 비교 기준은 없었습니다.",
            "TypeScript 5.8.3으로 전환한 뒤 한 번의 결과만 확인해서는 버전 변경의 효과인지 실행 환경의 차이인지 구분하기 어려웠습니다.",
          ],
        },
        {
          type: "text",
          id: "analysis",
          title: "원인 분석",
          body: [
            "프로덕션 빌드 시간은 TypeScript 버전뿐 아니라 캐시 사용 여부, 의존성 상태와 실행 환경의 영향을 받습니다. 마이그레이션 전후의 조건이 다르면 측정 결과를 직접 비교하기 어려웠습니다.",
            "따라서 체감 속도나 단일 실행 결과가 아니라 동일한 조건에서 마이그레이션 전후의 프로덕션 빌드 시간을 측정하고 비교할 필요가 있었습니다.",
          ],
        },
        {
          type: "text",
          id: "solution",
          title: "해결",
          body: [
            "동일한 조건에서 TypeScript 3.9.5와 5.8.3의 프로덕션 빌드 시간을 각각 측정하고 평균값을 비교했습니다.",
            "성능 변화와 타입 안정성 개선을 함께 판단할 수 있도록 프로덕션 빌드 시간뿐 아니라 마이그레이션 이후 7일간의 런타임 오류도 같은 프로젝트 기준으로 기록했습니다.",
          ],
        },
        {
          type: "result",
          id: "result",
          title: "결과",
          body: "평균 프로덕션 빌드 시간을 246.22초에서 199.51초로 줄여 19% 단축했습니다. 한 번의 빌드마다 약 46.71초의 대기 시간을 줄였으며, 타입 안정성 개선과 함께 마이그레이션이 개발 과정에 미친 변화를 수치로 확인했습니다.",
        },
      ],
    },
  ],
} satisfies ProjectCaseStudy;
