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
  team: "프론트엔드 1 · 백엔드 1",
  technologies: ["React", "Recoil", "REST API", "LocalStorage", "Architecture"],
  metrics: [
    { label: "운영 변경 절차", value: "4 → 2", detail: "신규 센터 추가 단계 50% 축소" },
    { label: "프론트 재배포", value: "1 → 0", detail: "신규 센터 추가 기준" },
  ],
  sections: [
    {
      id: "single-source-of-truth",
      eyebrow: "Case 01",
      title: "백엔드에 추가한 센터가 운영 화면에 표시되지 않음",
      blocks: [
        {
          type: "text",
          id: "problem",
          title: "문제",
          body: [
            "운영 과정에서 새로운 센터와 클라이언트를 백엔드에 추가해도 프론트엔드 운영 화면에는 자동으로 반영되지 않았습니다.",
            "프론트엔드에서 센터 목록을 하드코딩된 enum으로 관리하고 있어 백엔드 데이터를 추가한 뒤 프론트엔드의 enum도 별도로 수정하고 다시 배포해야 했습니다. 한쪽의 수정이 누락되면 백엔드에는 존재하지만 운영 화면에서는 선택할 수 없는 센터가 생겼습니다.",
          ],
        },
        {
          type: "text",
          id: "analysis",
          title: "원인 분석",
          body: [
            "센터 데이터의 관리 기준이 프론트엔드와 백엔드에 각각 존재하는 것이 원인이었습니다. 두 데이터는 같은 센터를 표현하지만 서로 동기화되는 구조가 아니었습니다.",
            "센터를 추가할 때마다 담당자가 두 위치를 직접 수정해야 했고 프론트엔드의 변경과 배포 여부에 따라 화면에 표시되는 데이터가 달라졌습니다. 개별적인 수정 누락이 아니라 동일한 데이터를 두 곳에서 관리하도록 설계된 구조의 문제라고 판단했습니다.",
          ],
        },
        {
          type: "text",
          id: "solution",
          title: "해결",
          body: [
            "프론트엔드에 하드코딩되어 있던 센터 enum을 제거하고 백엔드 API 응답을 센터 데이터의 단일 기준으로 사용하도록 변경했습니다.",
            "운영 화면은 내부 상수 대신 로그인 이후 전달받은 API 데이터를 기준으로 선택지와 화면 데이터를 구성했습니다. 센터의 이름과 식별자처럼 화면에 필요한 정보도 API 응답에서 가져와 프론트엔드가 백엔드 데이터의 복사본을 별도로 유지하지 않도록 했습니다.",
          ],
        },
        {
          type: "result",
          id: "result",
          title: "결과",
          body: "센터 데이터의 관리 지점을 프론트엔드와 백엔드 두 곳에서 백엔드 한 곳으로 통합했습니다. 백엔드에 센터를 추가하면 운영 화면에서도 같은 데이터를 사용하게 되어 enum 수정 누락으로 데이터가 불일치하는 구조적 원인을 제거했습니다. 신규 센터 추가를 위한 프론트엔드 코드 변경과 재배포도 필요하지 않게 됐습니다.",
        },
      ],
    },
    {
      id: "incremental-api-transition",
      eyebrow: "Case 02",
      title: "데이터 원천 변경으로 기존 화면 전체에 회귀가 발생할 위험",
      blocks: [
        {
          type: "text",
          id: "problem",
          title: "문제",
          body: [
            "하드코딩된 센터 데이터를 API 응답으로 바꾸려면 센터 목록을 사용하는 여러 운영 화면을 함께 수정해야 했습니다.",
            "기존 화면은 Recoil selector를 통해 센터별 데이터를 가공하고 있었습니다. API 전환과 동시에 상태 관리 구조까지 새로 설계하면 데이터 조회, 필터링, 선택 상태를 사용하는 화면 전반으로 변경 범위가 확산되고 회귀 여부를 확인할 범위도 함께 커질 수 있었습니다.",
          ],
        },
        {
          type: "text",
          id: "analysis",
          title: "원인 분석",
          body: [
            "화면 컴포넌트가 하드코딩된 enum을 직접 사용하는 부분과 Recoil에서 파생 데이터를 사용하는 부분이 함께 존재했습니다. 데이터 원천과 화면 상태 관리의 책임을 구분하지 않고 전체 구조를 한 번에 변경하면 로그인 이후 데이터 유지, 센터 선택 상태, 화면별 데이터 가공과 기존 selector를 사용하는 화면이 모두 영향을 받을 수 있었습니다.",
            "이번 작업의 목적은 상태 관리 기술을 교체하는 것이 아니라 센터 데이터의 원천을 백엔드 API로 통합하는 것이었습니다. 따라서 데이터 원천 변경과 화면 상태 구조 변경을 분리할 필요가 있다고 판단했습니다.",
          ],
        },
        {
          type: "text",
          id: "solution",
          title: "해결",
          body: [
            "API에서 받아온 센터 목록을 로그인 시점에 LocalStorage에 저장하고 기존 화면은 저장된 데이터를 바탕으로 동작하도록 구성했습니다.",
            "각 화면에서 API 응답을 직접 가공하지 않고 기존 Recoil selector가 LocalStorage의 센터 데이터로부터 필요한 형태를 파생하도록 변경했습니다. 데이터 원천은 API 응답으로 전환하면서도 화면 컴포넌트와 Recoil 기반 데이터 사용 방식은 최대한 유지해 변경 책임을 수집과 가공 계층으로 제한했습니다.",
          ],
        },
        {
          type: "image",
          src: "/projects/diagrams/api-data-source-before-after.png",
          alt: "프론트엔드와 백엔드에 분산된 센터 데이터를 API 단일 흐름으로 전환한 전후 구조",
          caption:
            "분산된 enum 관리에서 DB와 API를 원천으로 LocalStorage와 Recoil Selector를 거쳐 화면에 전달하는 단일 흐름으로 전환",
          layout: "wide",
          width: 1606,
          height: 1096,
        },
        {
          type: "result",
          id: "result",
          title: "결과",
          body: "기존 화면의 상태 관리 구조를 유지하면서 센터 데이터의 원천만 API로 전환했습니다. 변경을 데이터 수집과 가공 계층에 집중해 운영 화면 전체를 다시 구현하지 않고 전환했으며, 신규 센터 추가 절차를 4단계에서 2단계로 50% 줄였습니다. 센터 추가를 위한 프론트엔드 수정과 재배포는 1회에서 0회로 줄이고 API 전환으로 인한 회귀 위험도 제한했습니다.",
        },
      ],
    },
  ],
} satisfies ProjectCaseStudy;
