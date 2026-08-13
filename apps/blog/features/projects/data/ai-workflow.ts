import type { ProjectCaseStudy } from "../project-types";

export const aiWorkflowProject = {
  slug: "ai-workflow",
  index: "01",
  name: "AI 수정 워크플로 자동화",
  meta: "Internal workflow · 2026.05",
  description: "DOM 컨텍스트와 병렬 실행으로 AI 수정 과정의 탐색 실패와 처리 병목을 개선했습니다.",
  role: "Frontend Engineer",
  period: "2026.05",
  organization: "야근몬스터",
  technologies: ["Playwright", "TypeScript", "Codex", "Claude", "GLM"],
  metrics: [],
  sections: [
    {
      id: "dom-context",
      eyebrow: "Problem 01",
      title: "화면 이미지와 실제 DOM 요소가 연결되지 않음",
      blocks: [
        {
          type: "image",
          src: "/projects/ai-workflow/dom-mismatch-thumbnail.png",
          alt: "화면 이미지와 실제 DOM 요소가 연결되지 않는 문제를 표현한 비교 이미지",
          caption: "이미지의 시각적 위치와 실제 수정 대상 DOM이 불일치하던 기존 방식",
          layout: "wide",
        },
        {
          type: "text",
          id: "problem",
          title: "Problem",
          body: "기존에는 GLM에 화면 이미지를 전달해 수정 대상을 찾았습니다. 이미지 정보만으로는 화면의 시각적 형태와 실제 HTML 요소를 안정적으로 연결하기 어려워 잘못된 요소를 선택하거나 같은 작업을 재시도하는 문제가 발생했습니다.",
        },
        {
          type: "text",
          id: "approach",
          title: "Approach",
          body: "Playwright CLI로 DOM, HTML, selector 정보를 추출해 모델에 전달했습니다. 모델이 화면을 추측하는 대신 구조화된 컨텍스트를 기준으로 수정 대상과 소스 코드를 판단하도록 입력 구조를 변경했습니다.",
        },
        {
          type: "result",
          id: "result",
          title: "Result",
          body: "재시도를 줄이고 카드 처리 시간 31.6%, AI 실행 비용 35.4%를 절감했습니다.",
        },
      ],
    },
    {
      id: "input-cost",
      eyebrow: "Problem 02",
      title: "스크린샷과 HTML 전체 컨텍스트에 의존하는 높은 입력 비용",
      blocks: [
        {
          type: "text",
          id: "problem",
          title: "Problem",
          body: "작업마다 화면 스크린샷과 넓은 HTML 컨텍스트를 반복해서 전달하면서 수정에 직접 필요하지 않은 정보까지 모델 입력에 포함됐습니다. 브라우저 상태를 해석하는 과정도 길어져 카드별 실행 비용이 커졌습니다.",
        },
        {
          type: "text",
          id: "approach",
          title: "Approach",
          body: "각 작업을 title, metadata, selector, sourceFile, acceptance criteria로 구성된 카드 데이터로 정규화했습니다. 모델이 브라우저 화면을 다시 추론하지 않고 수정 대상과 완료 조건을 바로 읽도록 screenshotless CLI workflow로 전환했습니다.",
        },
        {
          type: "result",
          id: "result",
          title: "Result",
          body: "post-slim dry-run 10회 기준 카드별 중앙값 비용을 35.4%, 입력 토큰을 10.3% 절감했습니다.",
        },
      ],
    },
    {
      id: "parallel-workflow",
      eyebrow: "Problem 03",
      title: "독립적인 수정 카드도 순서대로 기다리는 처리 병목",
      blocks: [
        {
          type: "text",
          id: "problem",
          title: "Problem",
          body: "서로 영향을 주지 않는 수정 요청까지 하나씩 순차 실행되어 앞선 카드의 탐색과 수정이 끝날 때까지 다음 작업이 대기했습니다. 카드 수가 늘수록 전체 완료 시간이 그대로 누적됐습니다.",
        },
        {
          type: "text",
          id: "approach",
          title: "Approach",
          body: "의존성이 없는 카드를 독립 실행 단위로 분리하고 병렬로 처리한 뒤, 각 결과를 acceptance criteria 기준으로 검증하고 합치는 흐름을 구성했습니다.",
        },
        {
          type: "result",
          id: "result",
          title: "Result",
          body: "post-slim dry-run 10회 기준 전체 카드 처리 시간 중앙값을 31.6% 단축했습니다.",
        },
      ],
    },
  ],
} satisfies ProjectCaseStudy;
