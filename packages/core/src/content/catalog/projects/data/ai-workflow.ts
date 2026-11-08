import type { ProjectCaseStudy } from "../project-types.js";

export const aiWorkflowProject = {
  slug: "ai-workflow",
  index: "01",
  name: "AI 수정 workflow 자동화",
  meta: "Internal workflow · 2026.03 ~ 2026.05",
  description:
    "DOM Tree 기반 컨텍스트, 멀티 에이전트 부트스트랩, 병렬 라우팅으로 AI 수정 workflow의 정확도와 확장성, 처리 속도를 개선했습니다.",
  role: "Frontend Engineer",
  period: "2026.03 ~ 2026.05",
  organization: "야근몬스터",
  team: "1인 개발",
  technologies: ["Playwright", "TypeScript", "Codex", "Claude", "GLM"],
  metrics: [],
  relatedPosts: [
    {
      slug: "ai-agent-skills-vs-multi-agent",
      title: "AI 에이전트 스킬 vs 멀티에이전트",
      excerpt: "스킬과 멀티에이전트의 차이를 실제 AI 작업 흐름 관점에서 정리했습니다.",
    },
  ],
  sections: [
    {
      id: "dom-context",
      eyebrow: "Case 01",
      title: "AI가 화면의 수정 대상을 정확히 찾지 못함",
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
          title: "문제",
          body: [
            "사용자가 화면 수정을 요청하면 GLM이 화면 캡처를 분석해 수정 대상을 찾고, 해당 요소와 연결된 코드를 변경하도록 구성했습니다.",
            "하지만 비슷한 형태의 요소가 여러 개 있거나 화면 구조가 복잡한 경우 수정 대상을 잘못 선택했습니다. 화면에서는 올바른 위치를 짚더라도 실제 DOM 요소나 소스 파일을 찾지 못해 관련 없는 코드를 변경했고, 결과를 확인한 뒤 같은 작업을 다시 요청해야 했습니다.",
          ],
        },
        {
          type: "text",
          id: "analysis",
          title: "원인 분석",
          body: [
            "GLM의 비전 성능만으로는 화면에 보이는 요소와 실제 DOM 및 소스 코드를 정확하게 연결하기 어려웠습니다. 화면 캡처에는 요소의 모양과 시각적 위치만 담기고 selector, DOM 계층, 컴포넌트 정보는 포함되지 않았습니다.",
            "결국 AI는 이미지에서 수정 대상을 추정한 뒤 코드베이스에서 다시 관련 요소를 탐색해야 했습니다. 이 과정에서 유사한 텍스트나 컴포넌트가 검색되면 잘못된 대상을 선택했고, 넓은 화면 컨텍스트를 반복해서 해석하면서 입력 비용과 처리 시간도 함께 증가했습니다.",
          ],
        },
        {
          type: "text",
          id: "solution",
          title: "해결",
          body: [
            "AI 컨텍스트에 포함하던 화면 캡처를 Playwright로 추출한 DOM Tree로 대체했습니다. 화면 전체를 이미지로 전달하는 대신 수정 대상의 selector, DOM 계층, 주변 요소 정보를 구조화했습니다.",
            "작업 카드에는 수정 요청과 함께 대상 selector, 관련 DOM, 소스 파일, Acceptance Criteria를 담았습니다. AI가 화면의 위치를 추측하는 대신 실제 브라우저 구조를 기준으로 수정 대상과 완료 조건을 바로 판단하도록 입력 흐름을 변경했습니다.",
          ],
        },
        {
          type: "result",
          id: "result",
          title: "결과",
          body: "수정 대상과 실제 DOM을 직접 연결하면서 잘못된 요소를 변경하는 재시도가 감소했습니다. 화면 전체를 해석하지 않고 필요한 DOM 컨텍스트만 사용해 post-slim dry-run 10회 중앙값 기준 입력 토큰을 10.3%, AI 실행 비용을 35.4% 절감했습니다. 동일한 작업 카드 구조를 이후 에이전트 실행과 결과 검증에도 재사용할 수 있게 됐습니다.",
        },
      ],
    },
    {
      id: "multi-agent-bootstrap",
      eyebrow: "Case 02",
      title: "workflow가 Claude API에 종속되어 있었음",
      blocks: [
        {
          type: "text",
          id: "problem",
          title: "문제",
          body: [
            "기존 AI 수정 workflow는 Claude API의 요청과 응답 구조를 기준으로 구현되어 있었습니다. 작업 컨텍스트 생성부터 에이전트 실행과 결과 수집까지 Claude 전용 코드에 연결된 상태였습니다.",
            "Codex를 함께 사용하려면 기존 흐름을 재사용하지 못하고 동일한 기능을 다시 구현해야 했습니다. 모델별 성능이나 비용을 비교해 적절한 도구를 선택하기도 어려웠고, workflow 전체가 하나의 에이전트에 종속됐습니다.",
          ],
        },
        {
          type: "text",
          id: "analysis",
          title: "원인 분석",
          body: [
            "Codex 플러그인의 실행 구조를 분석해 Claude workflow와 비교했습니다. 두 도구는 인증, 명령 호출, 세션 관리, 결과 형식은 달랐지만 작업 컨텍스트를 구성하고 에이전트를 실행한 뒤 결과를 수집한다는 공통 흐름을 가지고 있었습니다.",
            "문제는 이 공통 흐름과 Claude에만 필요한 구현이 분리되지 않았다는 점이었습니다. 에이전트 선택이 workflow의 시작 단계가 아니라 내부 실행 로직 곳곳에 반영되어 있어 다른 도구를 연결할 때 변경 범위가 커졌습니다.",
          ],
        },
        {
          type: "text",
          id: "solution",
          title: "해결",
          body: [
            "작업 생성, 실행, 결과 수집에 필요한 공통 인터페이스를 정의하고 Claude와 Codex의 차이를 각각의 어댑터 내부로 분리했습니다. workflow는 구체적인 API나 명령 형식을 알지 않고 공통 실행 계약만 사용하도록 변경했습니다.",
            "부트스트랩 단계에서 사용할 에이전트 어댑터를 주입해 동일한 작업 카드와 Acceptance Criteria를 두 환경에서 재사용했습니다. 에이전트별 인증과 세션 처리, 응답 변환은 어댑터가 담당하고 이후 검증과 결과 병합은 공통 흐름에서 처리하도록 구성했습니다.",
          ],
        },
        {
          type: "result",
          id: "result",
          title: "결과",
          body: "하나의 작업 카드와 검증 흐름을 Claude와 Codex에서 모두 실행할 수 있게 됐습니다. 특정 에이전트에 대한 종속성을 제거해 작업 특성이나 실행 환경에 따라 도구를 선택할 수 있게 했으며, 새로운 에이전트를 연결할 때도 전체 workflow가 아닌 해당 어댑터만 구현할 수 있는 구조를 마련했습니다.",
        },
      ],
    },
    {
      id: "parallel-workflow",
      eyebrow: "Case 03",
      title: "한 번의 명령이 하나의 이슈만 처리함",
      blocks: [
        {
          type: "text",
          id: "problem",
          title: "문제",
          body: [
            "한 번의 명령이 하나의 이슈만 처리했기 때문에 여러 수정 요청이 있으면 동일한 스킬을 작업 수만큼 반복해서 실행해야 했습니다.",
            "각 작업은 앞선 작업의 탐색과 수정, 검증이 모두 끝난 뒤에야 시작됐습니다. 서로 다른 화면이나 파일을 수정해 영향을 주지 않는 요청도 같은 대기열에서 순서대로 처리되어 카드가 늘어날수록 전체 완료 시간이 그대로 누적됐습니다.",
          ],
        },
        {
          type: "text",
          id: "analysis",
          title: "원인 분석",
          body: [
            "기존 workflow는 모든 수정 요청을 하나의 실행 대기열에서 직렬로 처리했습니다. 작업 사이의 의존성과 충돌 가능성을 구분하는 단계가 없어 안전 여부와 관계없이 하나씩 실행하는 방식이었습니다.",
            "실제 처리 시간을 분석해 보니 독립적인 작업도 앞선 카드의 AI 응답을 기다리는 대기 시간이 병목으로 남았습니다. 단순히 에이전트 수를 늘리는 것이 아니라, 어떤 작업을 함께 실행해도 되는지 먼저 판단할 라우팅 과정이 필요했습니다.",
          ],
        },
        {
          type: "text",
          id: "solution",
          title: "해결",
          body: [
            "실행 전에 AI가 각 작업 카드의 수정 범위와 의존성을 판단하는 라우팅 단계를 추가했습니다. 동일한 파일이나 상태를 다루는 작업은 순차 실행 그룹으로 묶고, 서로 영향을 주지 않는 작업은 독립 실행 단위로 분리했습니다.",
            "독립적인 작업은 여러 에이전트에 분배해 병렬로 실행했습니다. 각 실행 결과는 작업 카드의 Acceptance Criteria에 따라 개별 검증하고, 검증을 통과한 결과만 병합해 병렬 처리로 인한 충돌 가능성을 제어했습니다.",
          ],
        },
        {
          type: "image",
          src: "/projects/diagrams/ai-workflow-architecture.png",
          alt: "DOM Tree 컨텍스트 생성부터 Claude와 Codex 병렬 실행 및 자동 검증까지의 AI 수정 workflow 구조",
          caption:
            "DOM Tree로 컨텍스트를 구성하고 작업 의존성을 판단한 뒤 Claude와 Codex에 분배해 검증하는 전체 workflow",
          layout: "wide",
          width: 1952,
          height: 1482,
        },
        {
          type: "result",
          id: "result",
          title: "결과",
          body: "여러 개의 수정 요청을 한 번의 명령으로 전달하고, 독립적인 작업을 동시에 처리할 수 있게 됐습니다. 사용자가 동일한 스킬을 반복해서 실행할 필요가 없어졌으며, post-slim dry-run 10회 기준 전체 카드 처리 시간 중앙값을 31.6% 단축했습니다. 의존성이 있는 작업은 기존처럼 순서를 유지해 처리 속도와 결과 안정성을 함께 확보했습니다.",
        },
      ],
    },
  ],
} satisfies ProjectCaseStudy;
