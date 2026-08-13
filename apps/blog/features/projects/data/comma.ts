import type { ProjectCaseStudy } from "../project-types";

export const commaProject = {
  slug: "comma",
  index: "08",
  name: "Comma",
  meta: "휴식 추천 서비스",
  description:
    "체크리스트 결과에 맞는 휴식 콘텐츠를 추천하는 모바일 서비스의 React 화면과 React Native Bridge를 구현했습니다.",
  role: "Frontend Engineer",
  period: "Side Project",
  organization: "Side Project",
  technologies: ["React", "React Query", "React Native", "Bridge", "Performance"],
  metrics: [
    { label: "질문 표시 시간", value: "41.1%", detail: "2,333.2ms → 1,373.6ms 단축" },
    { label: "API 호출", value: "50%", detail: "첫 진입·재진입 2회 → 1회" },
  ],
  stories: [
    {
      eyebrow: "Performance 01",
      title: "화면 렌더링과 핵심 콘텐츠 표시 시점을 분리해 병목 측정",
      problem:
        "화면 FCP는 307.2ms였지만 진입 후 데이터 요청을 시작해 핵심 질문이 표시되기까지 2,333.2ms가 걸렸습니다.",
      approach:
        "FCP와 핵심 질문 표시 시점을 분리 측정해 초기 렌더링이 아닌 데이터 준비 구간을 실제 병목으로 특정했습니다.",
      result: "체감 속도 개선에 필요한 측정 지표와 최적화 대상을 명확히 분리했습니다.",
    },
    {
      eyebrow: "Data 02",
      title: "React Query prefetch로 진입 전에 질문 데이터 준비",
      problem:
        "화면에 진입한 다음 데이터를 요청해 사용자가 빈 로딩 상태를 기다려야 했고 재진입 시에도 API 호출이 반복됐습니다.",
      approach:
        "질문 데이터와 로딩 상태를 React Query로 전환하고 이전 화면에서 prefetch해 진입 전에 캐시에 저장했습니다. LTE 유사 환경에서 개선 전후를 같은 조건으로 비교했습니다.",
      result: "질문 표시 시간을 41.1% 단축하고 첫 진입·재진입 API 호출을 2회에서 1회로 줄였습니다.",
    },
  ],
} satisfies ProjectCaseStudy;
