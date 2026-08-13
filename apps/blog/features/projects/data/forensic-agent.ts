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
  stories: [
    {
      eyebrow: "Research 01",
      title: "AI 결과를 원본까지 검증하는 정보 구조 설계",
      problem:
        "파일명과 관련도 score만으로는 연구진이 검색 결과와 실제 증거의 일치 여부를 판단하기 어려웠습니다.",
      approach:
        "XAI·HCI 선행 연구 5편을 검토하고 AI 결과, 핵심 근거, 원본 데이터 순서로 검증할 수 있는 정보 구조를 설계했습니다.",
      result: "검색 결과의 점수뿐 아니라 판단에 필요한 출처와 근거를 함께 확인할 수 있게 했습니다.",
    },
    {
      eyebrow: "Product 02",
      title: "미디어 유형별 Evidence와 원본 타임스탬프 연결",
      problem:
        "문서, 이미지, 음성, 영상마다 근거 형식이 달라 사용자가 관련 내용을 찾기 위해 원본 전체를 다시 확인해야 했습니다.",
      approach:
        "문서 일치 문장, 이미지 OCR 텍스트, 음성·영상 STT 구간을 공통 Evidence 모델로 정규화하고 파일 메타데이터와 연결했습니다. STT 구간을 선택하면 원본 미디어의 해당 시점으로 이동하도록 구현했습니다.",
      result:
        "4개 미디어 유형에 Evidence UI를 적용하고 음성·영상 탐색 범위를 전체 파일에서 관련 발화 구간으로 줄였습니다.",
    },
  ],
} satisfies ProjectCaseStudy;
