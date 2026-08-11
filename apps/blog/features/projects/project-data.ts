export type ProjectMetric = {
  detail: string;
  label: string;
  value: string;
};

export type ProjectStory = {
  approach: string;
  eyebrow: string;
  image?: {
    alt: string;
    caption: string;
    src: string;
  };
  problem: string;
  result: string;
  title: string;
};

export type ProjectCaseStudy = {
  description: string;
  index: string;
  meta: string;
  metrics: readonly ProjectMetric[];
  name: string;
  organization: string;
  period: string;
  role: string;
  slug: string;
  stories: readonly ProjectStory[];
  technologies: readonly string[];
};

export const projects: readonly ProjectCaseStudy[] = [
  {
    slug: "ai-workflow",
    index: "01",
    name: "AI 프론트엔드 수정 자동화 워크플로",
    meta: "Internal workflow · 2026.05",
    description:
      "DOM 컨텍스트와 병렬 실행으로 AI 수정 과정의 탐색 실패와 처리 병목을 개선했습니다.",
    role: "Frontend Engineer",
    period: "2026.05",
    organization: "야근몬스터",
    technologies: ["Playwright", "TypeScript", "Codex", "Claude", "GLM"],
    metrics: [],
    stories: [
      {
        eyebrow: "Problem 01",
        title: "화면 이미지와 실제 DOM 요소가 연결되지 않음",
        problem:
          "기존에는 GLM에 화면 이미지를 전달해 수정 대상을 찾았습니다. 이미지 정보만으로는 화면의 시각적 형태와 실제 HTML 요소를 안정적으로 연결하기 어려워 잘못된 요소를 선택하거나 같은 작업을 재시도하는 문제가 발생했습니다.",
        approach:
          "Playwright CLI로 DOM, HTML, selector 정보를 추출해 모델에 전달했습니다. 모델이 화면을 추측하는 대신 구조화된 컨텍스트를 기준으로 수정 대상과 소스 코드를 판단하도록 입력 구조를 변경했습니다.",
        result: "재시도를 줄이고 카드 처리 시간 31.6%, AI 실행 비용 35.4%를 절감했습니다.",
        image: {
          src: "/projects/ai-workflow/dom-mismatch-thumbnail.png",
          alt: "화면 이미지와 실제 DOM 요소가 연결되지 않는 문제를 표현한 비교 이미지",
          caption: "이미지의 시각적 위치와 실제 수정 대상 DOM이 불일치하던 기존 방식",
        },
      },
      {
        eyebrow: "Problem 02",
        title: "스크린샷과 HTML 전체 컨텍스트에 의존하는 높은 입력 비용",
        problem:
          "작업마다 화면 스크린샷과 넓은 HTML 컨텍스트를 반복해서 전달하면서 수정에 직접 필요하지 않은 정보까지 모델 입력에 포함됐습니다. 브라우저 상태를 해석하는 과정도 길어져 카드별 실행 비용이 커졌습니다.",
        approach:
          "각 작업을 title, metadata, selector, sourceFile, acceptance criteria로 구성된 카드 데이터로 정규화했습니다. 모델이 브라우저 화면을 다시 추론하지 않고 수정 대상과 완료 조건을 바로 읽도록 screenshotless CLI workflow로 전환했습니다.",
        result:
          "post-slim dry-run 10회 기준 카드별 중앙값 비용을 35.4%, 입력 토큰을 10.3% 절감했습니다.",
      },
      {
        eyebrow: "Problem 03",
        title: "독립적인 수정 카드도 순서대로 기다리는 처리 병목",
        problem:
          "서로 영향을 주지 않는 수정 요청까지 하나씩 순차 실행되어 앞선 카드의 탐색과 수정이 끝날 때까지 다음 작업이 대기했습니다. 카드 수가 늘수록 전체 완료 시간이 그대로 누적됐습니다.",
        approach:
          "의존성이 없는 카드를 독립 실행 단위로 분리하고 병렬로 처리한 뒤, 각 결과를 acceptance criteria 기준으로 검증하고 합치는 흐름을 구성했습니다.",
        result: "post-slim dry-run 10회 기준 전체 카드 처리 시간 중앙값을 31.6% 단축했습니다.",
      },
    ],
  },
  {
    slug: "kusting",
    index: "02",
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
  },
  {
    slug: "geobugirin",
    index: "03",
    name: "거부기린",
    meta: "데스크톱 앱 · 2026",
    description: "웹캠 기반 자세 측정과 상태별 피드백을 제공하는 Tauri 데스크톱 앱입니다.",
    role: "Frontend Engineer",
    period: "2026.04 ~ 현재",
    organization: "Side Project",
    technologies: ["React", "Tauri", "Turborepo", "Webcam", "Pose", "R2"],
    metrics: [],
    stories: [
      {
        eyebrow: "Platform 01",
        title: "실제 배포 가능한 데스크톱 릴리스 구조 만들기",
        problem:
          "컴퓨터비전 기능을 구현하는 것과 별개로 signing, notarization, updater artifact와 배포 경로를 일관되게 관리할 기준이 필요했습니다.",
        approach:
          "React/Tauri 앱, 랜딩, admin, 디자인 시스템을 pnpm/Turborepo monorepo로 분리하고 R2 upload와 sidecar를 포함한 릴리스 체크리스트를 정리했습니다.",
        result:
          "빌드 산출물과 업데이트 경로를 명시해 반복 가능한 데스크톱 릴리스 기반을 만들었습니다.",
      },
      {
        eyebrow: "Engine 02",
        title: "웹캠과 자세 측정 엔진의 상태를 분리하기",
        problem:
          "카메라 연결, 모델 초기화, 프레임 추론과 점수 계산이 한 흐름에 섞이면 오류 원인과 사용자 상태를 구분하기 어려웠습니다.",
        approach:
          "camera stream, model initialization, frame loop, scoring 상태를 분리하고 목, 어깨, 상체 landmark 기준 posture score를 구성했습니다.",
        result:
          "loading, camera unavailable, detecting, warning, normal 상태마다 명확한 피드백을 제공할 수 있게 됐습니다.",
      },
    ],
  },
];

export function getProject(slug: string) {
  return projects.find((project) => project.slug === slug);
}
