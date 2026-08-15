import type { ProjectCaseStudy } from "../project-types";

export const nexacroReactPocProject = {
  slug: "nexacro-react-poc",
  index: "02",
  name: "Nexacro–React 전환 자동화",
  meta: "Migration PoC · 2026",
  description:
    "AI 기반 명세 자동화와 Playwright 검증으로 Nexacro 화면 유형 5종의 React 전환 가능성을 확인했습니다.",
  role: "Frontend Engineer",
  period: "2026.03 ~ 2026.04",
  organization: "야근몬스터",
  team: "1인 개발",
  technologies: ["React", "Nexacro", "Playwright", "AI", "Spec Kit"],
  metrics: [
    { label: "화면 유형 검증", value: "5/5", detail: "주요 화면 유형 전환 검증" },
    { label: "명세 추출 성공률", value: "100%", detail: "UI 원천 데이터 수동 추출 제거" },
  ],
  sections: [
    {
      id: "implementation-specification",
      eyebrow: "Case 01",
      title: "AI가 구현에 필요한 정보를 판단하지 못함",
      blocks: [
        {
          type: "text",
          id: "problem",
          title: "문제",
          body: [
            "이번 PoC의 목표는 Nexacro로 구현된 화면을 React로 전환하는 과정에서 AI를 최대한 활용하는 것이었습니다.",
            "초기에는 Nexacro 화면의 전체 정보와 전환 요청을 AI에 전달해 곧바로 React 코드를 생성하도록 했습니다. 하지만 화면에 표시되는 요소는 일부 구현되더라도 중요한 데이터 필드나 이벤트, 화면 간 이동이 누락되는 등 원본 화면을 안정적으로 재현하지 못했습니다. 동일한 화면을 다시 요청할 때마다 결과가 달라져 전환 품질을 예측하기도 어려웠습니다.",
          ],
        },
        {
          type: "text",
          id: "analysis",
          title: "원인 분석",
          body: [
            "Nexacro 화면에는 컴포넌트, 절대좌표, 이벤트, 데이터 바인딩, 화면 이동 등 다양한 정보가 함께 포함되어 있습니다. 이 정보를 별도의 기준 없이 하나의 명세에 모두 담자 AI가 어떤 정보가 핵심 요구사항이고 어떤 정보가 구현 참고사항인지 판단하기 어려웠습니다.",
            "문제는 AI에 제공하는 정보의 양이 아니라, AI가 구현 결정을 내릴 수 있도록 화면 구조와 기능 요구사항, 코드 제약조건, 완료 조건이 구분되지 않았다는 점이었습니다.",
          ],
        },
        {
          type: "text",
          id: "solution",
          title: "해결",
          body: [
            "Playwright CLI를 이용해 Nexacro 원본 화면에서 컴포넌트와 화면 구조, 이벤트, 데이터 필드 정보를 추출했습니다.",
            "추출한 정보를 그대로 전달하지 않고 화면 구조, 기능 요구사항, 화면 이동, 고객사 코드 제약조건, Acceptance Criteria로 분리한 Markdown 명세로 변환했습니다. AI가 원본 정보를 매번 다시 해석하는 대신 구조화된 명세를 기준으로 React 컴포넌트를 구현하도록 전환했습니다.",
          ],
        },
        {
          type: "result",
          id: "result",
          title: "결과",
          body: "AI가 핵심 정보와 참고 정보를 구분할 수 있게 되면서 데이터 필드, 이벤트, 화면 이동과 같은 주요 요구사항의 누락을 줄였습니다. Playwright로 원본 화면 정보를 수집해 사람이 화면을 확인하고 명세에 옮기던 작업을 제거했으며, PoC 대상 화면의 UI 원천 정보를 모두 명세로 추출했습니다. 이를 통해 원본 분석, 명세 생성, React 구현, 결과 검증으로 이어지는 반복 가능한 전환 절차를 마련했습니다.",
        },
      ],
    },
    {
      id: "automated-validation",
      eyebrow: "Case 02",
      title: "React 전환 결과를 사람이 직접 검증해야 함",
      blocks: [
        {
          type: "text",
          id: "problem",
          title: "문제",
          body: [
            "Nexacro 화면은 고정 좌표를 기반으로 구성되어 있어 React의 일반적인 반응형 화면과 동일한 기준으로 비교하기 어려웠습니다.",
            "React로 전환한 결과가 원본 화면의 정보 구조와 기능을 제대로 재현했는지 사람이 직접 점검하면서 항목 누락과 긴 검증 시간이 발생했습니다. 화면 수가 늘어날수록 문제도 함께 커졌습니다.",
          ],
        },
        {
          type: "text",
          id: "analysis",
          title: "원인 분석",
          body: [
            "전환 결과를 판정할 공통 기준이 없는 것이 핵심 원인이었습니다. Nexacro 화면에는 반응형 레이아웃 기준이 없어 단순한 픽셀 비교만으로 React 구현의 완성도를 판단하기 어려웠습니다.",
            "시각적으로 유사하더라도 핵심 기능이 누락될 수 있으므로 동일 viewport의 시각적 구조와 각 화면에서 반드시 동작해야 하는 기능을 함께 검증할 기준이 필요했습니다.",
          ],
        },
        {
          type: "text",
          id: "solution",
          title: "해결",
          body: [
            "고객사와 협의해 화면별 핵심 정보, 필수 기능, 하위 화면 이동 조건을 정의하고, 각 Acceptance Criteria를 Playwright가 실행할 수 있는 검증 조건으로 구체화했습니다.",
            "특정 데이터와 레이블의 노출 여부, 버튼 클릭 후 화면 이동, 입력에 따른 데이터 변경을 자동으로 확인했습니다. 동일 viewport에서 원본 Nexacro 화면과 React 화면의 스크린샷도 비교해 시각적 재현과 기능적 재현을 함께 검증했습니다.",
          ],
        },
        {
          type: "result",
          id: "result",
          title: "결과",
          body: "사람이 화면마다 반복하던 검증 절차를 공통 Acceptance Criteria와 Playwright 테스트로 전환했습니다. 테이블, 입력 폼, 상세 정보, 화면 이동 등 주요 화면 유형 5종을 동일한 기준으로 검증해 5종 모두 React 전환 가능성을 확인했습니다. 검증 항목을 코드와 명세로 남겨 새로운 화면도 Acceptance Criteria를 추가하는 방식으로 검증할 수 있는 기반을 마련했습니다.",
        },
      ],
    },
  ],
} satisfies ProjectCaseStudy;
