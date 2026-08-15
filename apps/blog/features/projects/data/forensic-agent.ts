import type { ProjectCaseStudy } from "../project-types";

export const forensicAgentProject = {
  slug: "forensic-agent",
  index: "03",
  name: "AI 포렌식 Evidence UI",
  meta: "Evidence UI · 2026",
  description:
    "AI 검색 결과의 핵심 근거에서 원본 데이터까지 추적할 수 있는 Evidence UI를 설계·구현했습니다.",
  role: "Frontend Engineer",
  period: "2026.05",
  organization: "야근몬스터",
  team: "1인 개발 · 기존 프로젝트 인수인계",
  technologies: ["TypeScript", "Electron", "Qdrant", "XAI", "HCI"],
  relatedPosts: [
    {
      slug: "verifiable-ai-ui-design",
      title: "검증 가능한 AI UI 설계하기",
      excerpt: "AI 결과를 바로 믿는 대신 근거와 원본을 확인하게 만드는 UI 원칙을 다룹니다.",
    },
  ],
  metrics: [
    { label: "Evidence 적용", value: "4종", detail: "문서·이미지·음성·영상" },
    { label: "구간 탐색", value: "2종", detail: "음성·영상 타임스탬프 연결" },
  ],
  sections: [
    {
      id: "verifiable-evidence",
      eyebrow: "Case 01",
      title: "관련도 점수만으로 검색 결과를 검증하기 어려움",
      blocks: [
        {
          type: "text",
          id: "problem",
          title: "문제",
          body: [
            "AI 포렌식 검색 결과에는 파일명과 관련도 점수가 표시됐습니다. 하지만 연구진은 점수가 높다는 사실만으로 검색 결과가 실제 조사 목적과 일치하는지 판단하기 어려웠습니다.",
            "결과를 검증하려면 검색된 파일을 직접 열고 원본 전체를 살펴보며 관련 내용을 다시 찾아야 했습니다. AI가 왜 해당 파일을 결과로 제시했는지 설명하는 정보가 부족해 검색 결과를 그대로 신뢰하기도 어려웠습니다.",
          ],
        },
        {
          type: "text",
          id: "analysis",
          title: "원인 분석",
          body: [
            "관련도 점수는 검색어와 파일 사이의 유사도를 수치로 표현하지만 어떤 문장이나 장면이 결과에 영향을 주었는지는 설명하지 못했습니다. AI의 판단 결과와 원본 데이터 사이를 연결하는 정보 계층이 없었던 것이 문제였습니다.",
            "사용자는 검색 결과를 선택한 뒤 원본 전체에서 관련 근거를 직접 찾아야 했고, 파일의 길이가 길거나 결과가 여러 개일수록 검증 부담이 증가했습니다. XAI와 HCI 선행 연구 5편을 검토한 결과, 점수 자체보다 사용자가 판단을 재검증할 수 있는 출처와 근거를 제공해야 한다고 판단했습니다.",
          ],
        },
        {
          type: "text",
          id: "solution",
          title: "해결",
          body: [
            "AI 결과와 원본 데이터 사이에 Evidence 단계를 추가해 AI 검색 결과, 핵심 Evidence, 원본 데이터 순서로 탐색하는 정보 구조를 설계했습니다.",
            "검색 결과에는 관련도 점수와 함께 근거가 발견된 원본 파일, 핵심 문장 또는 장면, 원본 내부 위치, 파일 메타데이터를 표시했습니다. 사용자가 Evidence를 먼저 확인하고 추가 검증이 필요한 경우 원본으로 이동할 수 있도록 단계적인 탐색 흐름을 구성했습니다.",
          ],
        },
        {
          type: "image",
          src: "/projects/diagrams/forensic-evidence-hierarchy.png",
          alt: "AI 분석 결과에서 Evidence를 거쳐 원본 데이터를 확인하는 검증 정보 계층",
          caption: "점수 중심의 결과를 근거 텍스트, 출처, 원본 위치를 거쳐 검증하는 정보 계층",
          layout: "full",
          width: 2254,
          height: 560,
        },
        {
          type: "result",
          id: "result",
          title: "결과",
          body: "연구진은 관련도 점수뿐 아니라 AI가 결과를 제시한 근거와 출처를 함께 확인할 수 있게 됐습니다. 검색 결과 화면에서 핵심 Evidence를 먼저 검토하고 필요한 경우에만 원본 파일을 열 수 있도록 해, AI의 결론을 보여주는 화면을 사용자가 결과를 직접 검증할 수 있는 화면으로 전환했습니다.",
        },
      ],
    },
    {
      id: "media-evidence",
      eyebrow: "Case 02",
      title: "미디어마다 근거 형식과 탐색 방식이 다름",
      blocks: [
        {
          type: "text",
          id: "problem",
          title: "문제",
          body: [
            "포렌식 데이터에는 문서뿐 아니라 이미지, 음성, 영상이 함께 포함됐습니다. 문서는 일치 문장, 이미지는 OCR 텍스트, 음성과 영상은 특정 시점의 발화처럼 미디어마다 검색 근거가 표현되는 방식이 달랐습니다.",
            "공통된 Evidence 구조가 없어 파일 유형마다 별도의 화면과 데이터 처리 방식이 필요했습니다. 특히 음성과 영상은 관련 발화가 일부 구간에만 있어도 사용자가 원본을 처음부터 재생하며 해당 내용을 직접 찾아야 했습니다.",
          ],
        },
        {
          type: "text",
          id: "analysis",
          title: "원인 분석",
          body: [
            "검색 시스템은 미디어를 분석해 텍스트 정보를 생성하고 있었지만 분석 결과와 원본 위치의 연결 방식이 유형마다 달랐습니다. 문서와 이미지는 근거를 텍스트 단위로 보여줄 수 있었지만 음성과 영상은 근거가 시간 구간에 존재했습니다.",
            "이 차이를 UI에서 그대로 처리하면 미디어마다 별도의 Evidence 컴포넌트와 탐색 흐름이 필요했습니다. 근거의 내용과 원본 내부 위치가 하나의 공통 모델로 정의되지 않은 것이 핵심 원인이었습니다.",
          ],
        },
        {
          type: "text",
          id: "solution",
          title: "해결",
          body: [
            "문서의 일치 문장, 이미지의 OCR 텍스트, 음성과 영상의 STT 발화를 공통 Evidence 모델로 정규화했습니다. Evidence는 근거 텍스트, 원본 파일, 미디어 유형, 원본 내부 위치, 관련도와 이동에 필요한 메타데이터를 공통으로 갖도록 구성했습니다.",
            "음성과 영상에는 STT 발화의 시작·종료 시점을 저장했습니다. Evidence를 선택하면 해당 타임스탬프를 이용해 원본 플레이어가 관련 시점으로 이동하도록 구현했습니다. 공통 정보는 하나의 Evidence UI에서 처리하고 미디어별 탐색 동작만 유형에 따라 분기했습니다.",
          ],
        },
        {
          type: "image",
          src: "/projects/diagrams/forensic-evidence-model.png",
          alt: "문서 이미지 오디오 영상의 근거를 공통 Evidence 모델로 정규화하는 구조",
          caption:
            "미디어별 추출 결과를 공통 Evidence 모델로 정규화하고 동일한 UI와 원본 탐색 동작으로 연결한 구조",
          layout: "full",
          width: 3018,
          height: 452,
        },
        {
          type: "result",
          id: "result",
          title: "결과",
          body: "문서, 이미지, 음성, 영상 총 4개 미디어 유형에 동일한 Evidence UI를 적용했습니다. 사용자는 파일 유형이 달라도 같은 구조로 근거와 출처를 확인할 수 있게 됐으며, 음성과 영상은 Evidence를 선택하는 즉시 관련 발화 시점으로 이동해 탐색 범위를 전체 파일에서 관련 구간으로 줄였습니다. 새로운 미디어 유형도 공통 Evidence 모델을 확장해 연결할 수 있는 기반을 마련했습니다.",
        },
      ],
    },
  ],
} satisfies ProjectCaseStudy;
