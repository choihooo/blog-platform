export const workExperiences = [
  {
    company: "야근몬스터",
    role: "Frontend Engineer",
    period: "2026.03 ~ 2026.05 · 계약직",
    description: "AI UI 수정 workflow · Nexacro 전환 검증 · Evidence UI 설계·구현 직접 담당",
    achievements: [
      {
        title: "AI workflow 개선",
        technologies: ["Playwright", "Codex", "Claude"],
        context:
          "스크린샷 기반 AI 수정 시 DOM 식별 실패로 재지시가 반복되고, 독립 작업까지 순차 실행되면서 수정 요청당 처리 시간과 AI 비용이 누적되는 문제 확인",
        details: [
          "Playwright CLI로 DOM·HTML 정보를 제공해 수정 대상과 관련 코드를 연결하는 입력 구조 설계·구현",
          "카드(수정 요청 1건을 의미하는 작업 단위)의 의존성 분리 및 독립 작업 병렬화, Codex·Claude에서 재사용 가능한 workflow로 공통화",
        ],
        result: "전체 workflow 처리 시간 중앙값 31.6% 단축, 소모 토큰량 중앙값 35.4% 절감",
      },
      {
        title: "AI 기반 명세 자동화로 Nexacro 화면 유형 5종 전환 검증 · 고객사 업무",
        technologies: ["React", "Nexacro", "Playwright"],
        context:
          "컴포넌트·좌표·이벤트·데이터 필드를 React 구현 명세로 전환하는 절차가 없어 정보 누락과 전환 품질을 검증하기 어려운 문제 개선",
        details: [
          "Nexacro→React 마이그레이션 PoC의 원본 분석, 명세화, 구현 및 검증 워크플로 설계",
          "Playwright CLI로 원본 화면 정보를 추출해 AI 입력용 Markdown 명세로 구조화",
          "GitHub Spec Kit을 참고해 화면 구조, 기능 요구사항, AC, 고객사 코드 제약조건을 분리하고 명세에 반영",
          "고객사와 태블릿 핵심 정보 및 하위 화면 이동 기준 조율",
          "스크린샷 비교와 기능별 AC로 화면 유형 5종 전체의 전환 품질 검증",
        ],
        result:
          "Playwright 기반 추출로 컴포넌트·좌표·이벤트·데이터 필드의 수동 정리 단계를 제거하고, 주요 화면 유형 5종 전체(5/5)의 React 전환 검증 완료",
      },
      {
        title: "AI 검색 결과의 원본 검증을 위한 Evidence UI 설계·구현",
        technologies: ["TypeScript", "Electron", "Qdrant"],
        context:
          "기존 UI가 파일명과 관련도 score만 제공해 연구진이 검색 결과와 실제 증거의 일치 여부를 판단하기 어려운 문제 개선",
        details: [
          "AI 포렌식 데스크톱 프로젝트의 검색 결과 및 원본 검증 UI 설계·구현",
          "XAI·HCI 선행 연구 5편 검토, AI 결과→핵심 근거→원본 데이터 순서의 검증 정보 구조 설계",
          "문서 본문 일치 문장, 이미지 OCR 텍스트, 음성·영상 STT 발화 구간 제공 및 공통 파일 메타데이터 연결",
          "STT 세그먼트에 시작·종료 시각 포함, 선택 시 원본 미디어의 해당 타임스탬프로 이동하도록 구현",
        ],
        result:
          "문서·이미지·음성·영상 4종 전체에 Evidence UI 적용, 음성·영상은 관련 발화 구간으로 바로 이동해 전체 파일을 다시 탐색하지 않도록 구현",
      },
    ],
  },
  {
    company: "아이겐 코리아",
    role: "Frontend Engineer",
    period: "2025.03 ~ 2025.06 · 인턴",
    description: "API 상태 전환 · i18n 검증 자동화 · TypeScript 타입 정리 직접 담당",
    achievements: [
      {
        title: "API 기반 데이터 전환으로 운영 변경 절차 50% 축소",
        technologies: ["React", "Recoil", "API"],
        context:
          "백엔드에 추가한 센터·클라이언트가 운영 화면에 반영되지 않는 문제의 원인 분석 및 프론트엔드 데이터 구조 전환",
        details: [
          "프론트엔드와 백엔드에서 동일한 enum을 각각 관리해 수정 누락 시 API와 운영 화면의 데이터가 불일치하는 원인 확인",
          "프론트엔드의 하드코딩 enum 제거, 백엔드 API 응답을 단일 데이터 기준으로 사용하도록 구조 변경",
          "로그인 시 센터 목록을 LocalStorage에 저장하고 화면별 가공 데이터는 기존 Recoil selector로 파생해 변경 범위 최소화",
          "백엔드 개발자와 프론트 수정·재배포 없이 신규 센터가 운영 화면에 반영되는지 검증",
        ],
        result: "추가 절차 4단계 → 2단계, 데이터 관리 지점 2곳 → 1곳, 프론트 수정·재배포 1회 → 0회",
      },
      {
        title: "i18n 검증 자동화로 노출 키 63건 제거",
        technologies: ["TypeScript", "i18n", "AWS CI"],
        context:
          "수동 검증으로 한·중·일·영 리소스 누락을 배포 전에 차단하지 못해 사용자 화면에 i18n 키 63건이 노출되는 문제 개선",
        details: [
          "다국어 리소스 자동 검증 도입 제안, 오류 분석부터 스크립트 구현·CI 적용까지 전 과정 담당",
          "한국어 JSON을 기준으로 중첩 키 경로를 평탄화하고 언어별 누락·불일치 키를 자동 검출하는 스크립트 구현",
          "동일 조건에서 마이그레이션 전후의 프로덕션 빌드 시간과 런타임 오류 변화를 비교·검증",
        ],
        result:
          "TypeScript 3.9.5 → 5.8.3 전환과 타입 오류 정리 이후, 동일 조건에서 평균 프로덕션 빌드 시간 246.22초 → 199.51초로 19% 단축",
      },
      {
        title: "TypeScript 마이그레이션으로 프로덕션 빌드 시간 19% 단축",
        technologies: ["TypeScript", "React", "Migration"],
        context:
          "프로덕션 빌드에 평균 246.22초가 소요되고, any 타입으로 인해 잘못된 데이터가 실행 단계에서 발견되는 문제 개선",
        details: [
          "TypeScript 3.9.5→5.8.3 전환 후 컴파일러가 표시한 진단 500여 건을 공통 타입→API 응답→기능별 사용 코드 순으로 정리",
          "그래프 API 응답을 실제 데이터 구조에 맞는 인터페이스로 재정의하고 숫자 입력을 number로 제한해 any를 통한 타입 검사 우회 제거",
          "동일 조건에서 마이그레이션 전후의 프로덕션 빌드 시간과 런타임 오류 변화를 비교·검증",
        ],
        result:
          "TypeScript 3.9.5 → 5.8.3 전환과 타입 오류 정리 이후, 동일 조건에서 평균 프로덕션 빌드 시간 246.22초 → 199.51초로 19% 단축",
      },
    ],
  },
] as const;

export const sideProjects = [
  {
    name: "Comma",
    meta: "2026.06 · 휴식 추천 서비스 · Frontend Engineer",
    url: "https://apps.apple.com/kr/app/id6786727870",
    description:
      "체크리스트 결과 기반 휴식 콘텐츠 추천 모바일 서비스 · React 웹 화면 및 React Native Bridge 연동 담당",
    achievements: [
      {
        title: "데이터 로딩 구조 개선으로 핵심 질문 표시 시간 41.1% 단축",
        technologies: ["React", "React Query", "React Native"],
        context:
          "화면 FCP는 307.2ms였지만 진입 후 데이터 요청을 시작해 핵심 질문 표시에 2,333.2ms가 걸리는 문제 개선",
        details: [
          "React Native와 웹 화면 사이에 타입 안전한 Bridge 인터페이스를 정의해 네이티브 ↔ 웹 데이터 전달 구조 구현",
          "FCP와 핵심 질문 표시 시점을 분리 측정해 초기 렌더링이 아닌 데이터 준비 구간을 병목으로 특정",
          "질문 데이터의 요청·로딩 상태를 React Query 기반으로 전환, 이전 화면에서 prefetch해 진입 전 캐시에 저장",
          "Chrome DevTools 네트워크 throttling으로 LTE 유사 환경을 만들어 개선 전후의 핵심 질문 표시 시점을 동일 조건으로 비교·검증",
        ],
        result: "질문 표시 시간 2,333.2ms → 1,373.6ms로 41.1% 단축",
      },
    ],
  },
  {
    name: "거부기린",
    meta: "2025.09 ~ 2026.08 · 자세 교정 서비스 · Frontend Engineer",
    url: "https://www.postureturtle.com",
    description:
      "최근 한 달 베타 사용자 43명이 약 1,300시간 사용한 웹캠 기반 데스크톱 자세 교정 서비스 · pose scoring, Tauri 배포, 상태별 피드백 UI 구현",
    achievements: [
      {
        title: "추론 파이프라인 분리로 모든 창 상태에서 추론 결과 수신률 100% 유지",
        technologies: ["Tauri", "Rust", "Python"],
        context:
          "Electron 앱을 백그라운드로 전환하거나 최소화하면 자세 추론이 느려지거나 중단되어 앱을 전면에 유지해야 하는 문제 개선",
        details: [
          "데스크톱 앱 전환, 자세 추론 파이프라인 재설계 및 창 상태별 성능 검증 담당",
          "Electron과 Tauri 실행 구조 비교, 화면과 자세 엔진의 실행 생명주기 분리를 위한 Tauri 전환",
          "React는 명령·결과 표시, Rust 네이티브 스레드는 반복 실행, Python sidecar는 카메라 캡처·MediaPipe 추론을 담당하도록 책임 분리",
          "고정 입력으로 포그라운드·백그라운드·최소화 상태를 각각 3회 교차 측정해 FPS, 추론 간격 P95, 중단 횟수 검증",
          "실시간 데모로 사용자 가치와 분석 과정을 전달해 큐시즘 밋업 프로젝트 대상 수상 및 U300, CMK 등 사업화 프로그램 선정",
        ],
        result:
          "고정 입력을 상태별 10분씩 3회 교차 측정해 결과 전달률 100% 유지, 평균 FPS 중앙값 1.41~2.22 및 최소화 시 정규화 CPU 사용률 1.19%p 감소",
      },
    ],
  },
  {
    name: "Kusting",
    meta: "2026.04 ~ 2026.07 · 블로그 스터디 운영 플랫폼 · Product Engineer",
    description:
      "글 제출, 일정 조율, 추천, 알림을 통합한 스터디 운영 플랫폼 · 개인화 추천 및 운영 자동화",
    achievements: [
      {
        title: "콘텐츠 자동 수집으로 게시글 등록 누락 100% 제거",
        technologies: ["Crawling", "PWA", "Firebase"],
        context:
          "글 작성 후 Notion에 URL과 태그를 직접 등록하는 과정에서 일주일간 게시글 9건이 누락되고, 사용자가 직접 방문해야 새 글을 확인할 수 있는 문제 개선",
        details: [
          "스터디 운영자이자 개발자로서 콘텐츠 누락·전달·탐색 문제 정의부터 설계·구현까지 담당",
          "스터디원 블로그의 신규 글을 자동 수집·등록하는 크롤링 흐름 구축, 실제 작성 글과 등록 데이터를 일주일 단위로 대조",
          "PWA와 Firebase 푸시 알림 연결, 새 콘텐츠를 사용자에게 능동적으로 전달하는 운영 구조로 전환",
        ],
        result:
          "게시글 누락 9건 → 0건, 글 1건당 수동 등록 시간 약 38초 → 0초, 게시글당 평균 조회수 21회 달성",
      },
      {
        title: "임베딩 기반 의미 추천으로 콘텐츠 CTR 15% 향상",
        technologies: ["Embedding", "PostgreSQL", "pgvector"],
        context: "태그가 달라도 의미가 유사한 콘텐츠를 연결하지 못하는 기존 태그 추천의 한계 개선",
        details: [
          "내·외부 콘텐츠 임베딩 및 pgvector HNSW 검색 적용을 통한 의미 기반 큐레이션 구현",
          "사용자 관심사와 게시글·큐레이션 데이터를 연결하고, 왜 이 콘텐츠를 추천했는지 보여주는 추천 사유 UI 구현",
          "동일 노출 위치에서 기존 태그 추천과 의미 기반 추천의 CTR 비교·검증",
        ],
        result: "기존 태그 추천 대비 콘텐츠 CTR 15% 향상 (2.1% → 2.4%)",
      },
    ],
  },
] as const;

export const activities = [
  [
    "CMC 19기 프론트엔드 개발자",
    "2026.05 ~ 2026.08 · CMC\nCMC 19기 프론트엔드 개발자\n‘브라우저를 AI의 런타임 환경으로 볼 수 있을까’ 세션 발표 진행",
  ],
  [
    "한국대학생IT경영학회",
    "2021.09 ~ 2025.12 · 한국대학생IT경영학회\nKUSITMS 31기 운영진 및 웹 메이커스 PM으로 공식 홈페이지 유지보수, 기수별 콘텐츠 운영, 이슈/PR 기반 릴리즈 관리 담당\nNext.js App Router 기반 공식 홈페이지에서 프로젝트·전시·리크루팅 콘텐츠와 33기 메인/OG 이미지, 아카이브 반영\nSEO 개선 및 프로젝트 리스트 검색 노출 작업 참여, LCP 7.0s → 0.5s 성능 개선 기록\nSKT DevOcean 리텐션 증가 마이페이지 개선 과제 수행 및 실제 서비스 적용\nVOIM Chrome Extension 프론트엔드에서 고대비 UI, 글자 크기·굵기 조절, 단축키 안내, 사용자 설정 등 접근성 보조 기능 구현",
  ],
  [
    "오픈소스 컨트리뷰션 아카데미 멘티",
    "2025.03 ~ 2025.04 · 오픈소스 컨트리뷰션 아카데미\nChromium 오픈소스 기여",
  ],
  [
    "유데미 러닝크루 2기 리더",
    "2025.03 ~ 2025.04 · 유데미\n유데미 러닝크루 2기 리더로 크루 8명의 Next.js 강의 학습을 주도하고, 주 1회 학습 기록 8편을 블로그에 발행해 8주 과정 완주",
  ],
] as const;

export const awards = [
  [
    "한국대학생IT경영학회 밋업프로젝트 대상",
    "2025.12 · 한국대학생IT경영학회\n웹캠과 MediaPipe 기반 자세 인식으로 거북목 등 잘못된 자세를 실시간 감지하고, 알림·위젯·통계 대시보드로 사용자의 자세 습관 개선을 돕는 서비스\nReact/TypeScript 기반 실시간 자세 분석 화면, 우측 패널, 출석·레벨·통계 대시보드 UI 구현\n레벨 모달 반응형, 우측 패널, 출석 현황 개선, 폴더 구조/의존성 정리, GA 추적 코드 추가",
  ],
  [
    "SUMTECH HACKATHON 2025 장려상",
    "2025.10.31 · SW중심대학사업단\n청소년의 진로 탐색을 돕기 위해 진단, 심화 질문, AI 분석, 로드맵, 퀴즈 흐름을 연결한 AI 기반 진로 설계 서비스 개발\nReact/Vite 기반 프론트 초기 구축, 로그인/회원가입, 진단 캘린더, 주관식 질문 및 5점 척도 플로우를 구현\n보호 라우팅과 AI 분석·로드맵·퀴즈 API 연동",
  ],
  [
    "직행 기업 프로젝트 우수상",
    "2025.09 · 직행\n채용 플랫폼 ‘직행’의 회원가입 전환율을 높이기 위해 온보딩, 실시간 공고 랭킹, 자소서 기반 개인화 추천, 공고 메모 기능을 결합한 개인화 채용 탐색 서비스 개발\nNext.js/React 기반 온보딩 플로우와 실시간 추천 공고 UI/API 연동\n공고별 메모 저장·조회·삭제 및 메모 모아보기 페이지 개발\n스플릿뷰 공고 이동, 인기 공고 UI, 반응형 구현",
  ],
  [
    "KT&G 상상유니브 아이디어톤 대상",
    "2024.12.14 · KT&G 상상유니브\n긴급차량의 주행 경로를 기반으로 인근 차량과 불법 주정차 차량에 사전 알림을 제공해 자연스러운 진로 양보와 골든아워 확보를 돕는 긴급차량 주행 알림 서비스\nBE 개발자 2명과 함께 긴급차량 인증, 목적지 기반 경로 연동, 500m 반경 접근 알림, CCTV 기반 불법 주정차 안내 문자 등 핵심 기능의 기술 PoC 가능성 검토\n서비스 플로우와 개발 로직 아키텍처의 정합성을 판단하는 회의에 참여해 아이디어가 실제 구현 가능한 구조로 설명되도록 기획·기술 연결 정리",
  ],
] as const;

export const education = [
  ["한국공학대학교", "2024.03 ~ 2026.02 · 컴퓨터공학부 소프트웨어전공"],
  ["공주대학교", "2020.03 ~ 2024.02 · 컴퓨터공학부 컴퓨터공학전공"],
] as const;

export const certifications = [
  ["ADSP", "2026.06 · 한국데이터산업진흥원"],
  ["SQLD", "2025.06 · 한국데이터산업진흥원"],
] as const;

export const skillGroups = [
  ["Core", ["Next.js", "React", "TypeScript", "TanStack Query", "Zustand"]],
  ["App / Platform", ["React Native", "Electron", "Tauri", "Expo"]],
  ["Testing / Architecture", ["Jest", "Vitest", "Storybook", "Monorepo"]],
  ["DevOps / Tooling", ["GitHub Actions", "Docker", "Figma"]],
] as const;
