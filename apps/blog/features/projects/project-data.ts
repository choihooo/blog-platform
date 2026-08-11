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
  {
    slug: "dream-track",
    index: "04",
    name: "Dream Track",
    meta: "AI 진로 설계 서비스 · 2025",
    description:
      "사용자의 진로 탐색 과정을 AI 기반 설계 흐름으로 구체화한 SUMTECH HACKATHON 프로젝트입니다.",
    role: "Frontend Engineer",
    period: "2025.10",
    organization: "SUMTECH HACKATHON 2025",
    technologies: ["React", "TypeScript", "AI", "UX"],
    metrics: [{ label: "수상", value: "장려상", detail: "Dream Track 부문" }],
    stories: [
      {
        eyebrow: "Product 01",
        title: "AI 진로 설계 과정을 하나의 사용자 흐름으로 연결",
        problem:
          "진로 탐색에 필요한 입력과 추천 결과가 분리되면 사용자가 자신의 선택 기준과 다음 행동을 이해하기 어려웠습니다.",
        approach:
          "사용자 입력, AI 분석과 진로 제안을 순차적으로 확인할 수 있도록 화면 구조와 인터랙션 흐름을 설계하고 프론트엔드로 구현했습니다.",
        result: "Dream Track AI 진로 설계 서비스로 SUMTECH HACKATHON 2025 장려상을 수상했습니다.",
      },
    ],
  },
  {
    slug: "jikhaeng",
    index: "05",
    name: "직행 기업 프로젝트",
    meta: "채용 서비스 · 2025",
    description:
      "온보딩, 추천 공고와 메모 기능을 연결해 구직자가 공고를 탐색하고 관리하는 흐름을 개선했습니다.",
    role: "Frontend Engineer",
    period: "2025.09",
    organization: "직행 기업 프로젝트",
    technologies: ["React", "TypeScript", "Product UX"],
    metrics: [{ label: "수상", value: "우수상", detail: "직행 기업 프로젝트" }],
    stories: [
      {
        eyebrow: "Product 01",
        title: "온보딩부터 추천 공고 관리까지 이어지는 경험 설계",
        problem:
          "사용자의 관심 조건을 수집하는 온보딩과 추천 공고 탐색, 지원 전 메모가 분리되면 공고를 비교하고 관리하기 어려웠습니다.",
        approach:
          "온보딩에서 수집한 정보를 추천 공고 화면에 연결하고, 공고별 메모를 남길 수 있도록 탐색과 관리 흐름을 구성했습니다.",
        result: "온보딩·추천 공고·메모 기능을 구현해 직행 기업 프로젝트 우수상을 수상했습니다.",
      },
    ],
  },
  {
    slug: "siren-path",
    index: "06",
    name: "Siren Path",
    meta: "기술 PoC · 2024",
    description:
      "서비스 아이디어의 핵심 기술 가능성을 검증하고 실제 사용 흐름으로 구체화한 PoC 프로젝트입니다.",
    role: "Frontend Engineer",
    period: "2024.12",
    organization: "KT&G 상상유니브 아이디어톤",
    technologies: ["React", "PoC", "UX", "Prototype"],
    metrics: [{ label: "수상", value: "대상", detail: "KT&G 상상유니브 아이디어톤" }],
    stories: [
      {
        eyebrow: "Prototype 01",
        title: "아이디어를 검증 가능한 기술 PoC와 UX 플로우로 전환",
        problem:
          "아이디어의 가치만 설명하는 단계에서는 핵심 기술의 구현 가능성과 사용자가 실제로 이용하는 과정을 함께 검증하기 어려웠습니다.",
        approach:
          "핵심 기능을 기술 PoC로 구현하고 사용자가 기능을 발견하고 결과를 확인하는 과정을 UX 플로우로 정리했습니다.",
        result: "기술 PoC와 UX 플로우를 바탕으로 KT&G 상상유니브 아이디어톤 대상을 수상했습니다.",
      },
    ],
  },
  {
    slug: "frontend-platform",
    index: "07",
    name: "AI 제품 프론트엔드 플랫폼 개선",
    meta: "Product platform · 2026",
    description:
      "포렌식 에이전트 데스크톱 앱의 검증 UI부터 공통 UI Kit과 레거시 전환 기준까지 제품 프론트엔드 기반을 정리했습니다.",
    role: "Frontend Engineer",
    period: "2026.03 ~ 2026.05",
    organization: "야근몬스터",
    technologies: ["React", "TypeScript", "Electron", "Qdrant", "i18n", "Playwright"],
    metrics: [],
    stories: [
      {
        eyebrow: "Product 01",
        title: "검색 결과의 출처와 근거를 먼저 확인하는 Evidence UI",
        problem:
          "score 중심의 검색 결과만으로는 사용자가 결과의 신뢰도를 판단할 근거가 부족했습니다.",
        approach:
          "문서·이미지·오디오·영상 hit를 공통 Result 모델로 정규화하고 file metadata, snippet과 STT segment를 Evidence 필드로 매핑했습니다. 검증된 payload만 renderer에 전달하도록 preload bridge 기준도 정리했습니다.",
        result: "실제 search hit의 출처와 근거를 중심으로 검색 결과를 검증할 수 있는 UI를 구현했습니다.",
      },
      {
        eyebrow: "System 02",
        title: "React UI Kit과 component showcase의 공통 기준 정리",
        problem:
          "신규 수주와 PoC마다 유사 UI와 다국어 처리 방식을 반복해서 구현하고 있었습니다.",
        approach:
          "atom과 molecule 컴포넌트의 props, state, variation을 확인하는 showcase를 구성하고 hardcoded text를 번역 key 기반으로 전환했습니다.",
        result: "props table, code example과 state preview를 한곳에서 확인하고 재사용할 수 있게 했습니다.",
      },
      {
        eyebrow: "Migration 03",
        title: "절대좌표 기반 레거시 화면의 React 전환 기준 수립",
        problem:
          "반응형 기준이 없는 Nexacro absolute 화면을 React로 전환할 화면 단위 명세와 검증 기준이 필요했습니다.",
        approach:
          "layout, interaction과 data state 기준을 분리해 acceptance criteria를 만들고 동일 viewport에서 원본과 전환 화면을 Playwright로 비교했습니다.",
        result: "화면별 React 전환 가능성과 사용성, 재현도를 일관된 기준으로 검증할 수 있게 했습니다.",
      },
    ],
  },
  {
    slug: "admin-platform",
    index: "08",
    name: "고객사 어드민 구조·개발 생산성 개선",
    meta: "Admin platform · 2025",
    description:
      "API 응답 기반 센터 관리 구조와 i18n 배포 전 검증을 도입하고 TypeScript migration을 진행했습니다.",
    role: "Frontend Engineer",
    period: "2025.03 ~ 2025.06",
    organization: "아이겐 코리아",
    technologies: ["React", "TypeScript", "Recoil", "i18n", "AWS CI"],
    metrics: [{ label: "평균 빌드 시간", value: "19%", detail: "CI build log 기준 단축" }],
    stories: [
      {
        eyebrow: "Architecture 01",
        title: "센터별 하드코딩을 API 응답 기반 화면으로 전환",
        problem:
          "신규 센터가 추가될 때마다 프론트엔드 코드를 수정하고 다시 배포해야 했습니다.",
        approach:
          "센터 목록, 상세 정보와 노출 조건을 API 응답 스키마 기준으로 매핑하고 Recoil selector와 LocalStorage cache로 조회·캐싱·반영 흐름을 분리했습니다.",
        result: "센터별 하드코딩 분기를 제거해 운영 변경에 필요한 프론트엔드 수정 범위를 줄였습니다.",
      },
      {
        eyebrow: "Tooling 02",
        title: "i18n 검증 자동화와 TypeScript migration",
        problem:
          "누락된 번역 key가 배포 후 런타임 UI에 그대로 노출되고 있었습니다.",
        approach:
          "국문 기준 누락 key 자동 검출 스크립트를 AWS CodePipeline에 연결하고 TypeScript 3.9.5에서 5.8.3으로 단계적으로 migration했습니다.",
        result: "번역 누락을 배포 전에 발견하고 CI build log 기준 평균 빌드 시간을 19% 단축했습니다.",
      },
    ],
  },
  {
    slug: "cmc-19",
    index: "09",
    name: "CMC 19기 웹·앱 프론트엔드",
    meta: "Web & App · CMC 19기",
    description:
      "Turborepo 기반 React 웹앱과 Expo WebView, 공통 디자인 시스템을 연결한 프론트엔드 프로젝트입니다.",
    role: "Frontend Engineer",
    period: "CMC 19기",
    organization: "Central MakeUs Challenge",
    technologies: ["React", "TypeScript", "Turborepo", "Expo", "Design System"],
    metrics: [],
    stories: [
      {
        eyebrow: "Platform 01",
        title: "웹과 Expo 앱이 공유하는 프론트엔드 기반 구성",
        problem:
          "React 웹앱과 Expo WebView가 함께 동작하면서도 UI와 개발 기준을 일관되게 유지할 구조가 필요했습니다.",
        approach:
          "Turborepo를 중심으로 웹앱과 공통 디자인 시스템의 경계를 정리하고 Expo WebView에서 제품 흐름을 연결했습니다.",
        result: "웹과 앱에서 공통 UI 기준을 재사용할 수 있는 프론트엔드 구조를 구성했습니다.",
      },
    ],
  },
];

export function getProject(slug: string) {
  return projects.find((project) => project.slug === slug);
}
