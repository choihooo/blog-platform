import type { ProjectCaseStudy } from "../project-types";

export const kustingProject = {
  slug: "kusting",
  index: "07",
  name: "Kusting",
  meta: "운영 플랫폼 · 2026",
  description: "글쓰기 스터디의 추천, 일정 조율과 알림을 하나의 운영 흐름으로 연결했습니다.",
  role: "Product Engineer",
  period: "2026.02 ~ 2026.04",
  organization: "Side Project",
  technologies: ["Next.js", "TypeScript", "pgvector", "OpenAI", "Firebase", "PWA"],
  metrics: [{ label: "큐레이션 탭 CTR", value: "약 15%", detail: "동일 노출 위치 기준 향상" }],
  stories: [
    {
      eyebrow: "Product 01",
      title: "추천 결과뿐 아니라 추천 이유까지 설명하기",
      problem:
        "태그 기반 추천만으로는 사용자마다 다른 관심사를 충분히 반영하기 어려웠고, 사용자는 게시글이 추천된 이유를 알 수 없었습니다.",
      approach:
        "사용자 관심사와 큐레이션, 게시글을 embedding pipeline으로 연결하고 pgvector HNSW로 후보를 검색했습니다. OpenAI와 Ollama를 교체할 수 있도록 provider 경계를 분리하고 추천 이유를 UI에 함께 노출했습니다.",
      result: "동일 노출 위치 기준 큐레이션 탭 CTR이 약 15% 향상됐습니다.",
    },
    {
      eyebrow: "Product 02",
      title: "날짜 투표에서 일정 알림까지 하나의 흐름으로 연결",
      problem:
        "일정 조율과 참여 알림이 분리되어 있어 투표가 끝난 뒤 확정 일정을 놓치기 쉬웠습니다.",
      approach:
        "날짜 투표, 참석 상태, 알림 수신을 하나의 사용자 여정으로 묶고 Firebase Messaging 기반 PWA push를 연결했습니다.",
      result: "일정 확정과 참여 알림을 별도 채널 없이 제품 안에서 이어서 받을 수 있게 했습니다.",
    },
  ],
} satisfies ProjectCaseStudy;
