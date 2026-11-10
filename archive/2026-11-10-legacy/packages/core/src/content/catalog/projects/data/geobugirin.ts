import type { ProjectCaseStudy } from "../project-types.js";

export const geobugirinProject = {
  slug: "geobugirin",
  index: "09",
  name: "거부기린",
  meta: "데스크톱 앱 · 7인 팀 · 2026",
  description:
    "WebView와 자세 추론을 분리한 Tauri 데스크톱 앱을 구축하고 사용자별 자세 점수와 플랫폼별 릴리스 체계를 설계했습니다.",
  role: "Frontend Engineer (Desktop & Posture Engine)",
  period: "2026.04 ~ 2026.08",
  organization: "Side Project",
  team: "기획 2 · 디자인 2 · 프론트엔드 2 · 백엔드 1",
  evidence: [
    {
      type: "repository",
      label: "Tauri 마이그레이션 저장소",
      href: "https://github.com/choihooo/gbgr-migration",
    },
  ],
  technologies: [
    "React",
    "Tauri",
    "Rust",
    "Python",
    "MediaPipe",
    "Turborepo",
    "GitHub Actions",
    "Cloudflare R2",
  ],
  metrics: [
    { label: "베타 사용자", value: "43명", detail: "최근 한 달 · DB·PostHog 기준" },
    { label: "베타 사용 시간", value: "약 1,300시간", detail: "최근 한 달 합산" },
    { label: "창 상태별 결과 전달", value: "100%", detail: "고정 입력 · 상태별 10분 × 3회" },
  ],
  relatedPosts: [
    {
      slug: "geobugirin-10000-users-retrospective",
      title: "거부기린 - 만 명의 사용자가 내 서비스를 이용해봤다고?",
      excerpt:
        "NVIDIA 한국인 가상 페르소나 1만 건과 로컬 LLM을 활용해 서비스 가입 의향을 시나리오 검증한 과정입니다.",
    },
    {
      slug: "electron-webview-to-tauri-native-ui-migration",
      title: "Electron 웹뷰 앱을 Tauri Native UI로 마이그레이션하기 1",
      excerpt:
        "거부기린의 로딩 속도와 유지보수 구조를 개선하기 위해 Tauri 전환을 결정한 과정입니다.",
    },
  ],
  sections: [
    {
      id: "background-inference",
      eyebrow: "Case 01",
      title: "WebView 백그라운드 스로틀링과 자세 추론의 실행 경로를 분리",
      blocks: [
        {
          type: "text",
          id: "problem",
          title: "문제",
          body: [
            "기존 Electron 앱은 WebView 실행 환경에서 웹캠 프레임과 자세 추론을 처리했습니다. 사용자가 다른 작업을 위해 앱을 백그라운드로 보내거나 창을 최소화하면 브라우저 스케줄링과 렌더링 상태가 추론 주기에 영향을 줄 수 있었습니다.",
            "거부기린의 핵심 기능은 사용자가 다른 작업을 하는 동안에도 자세를 계속 측정하는 것입니다. 하지만 자세 추론이 UI runtime의 생명주기에 종속돼 창 상태와 관계없이 안정적으로 동작해야 하는 제품 요구사항과 맞지 않았습니다.",
          ],
        },
        {
          type: "text",
          id: "analysis",
          title: "원인 분석",
          body: [
            "WebView의 JavaScript 실행은 창 가시성과 브라우저의 백그라운드 스로틀링 정책에 영향을 받습니다. 웹캠 프레임 처리, Pose 추론, 점수 계산, React 상태 업데이트와 UI 렌더링이 같은 실행 환경에서 경쟁하고 있었습니다.",
            "UI 갱신 빈도를 조정하는 것만으로는 추론 자체가 WebView scheduler에 묶이는 문제를 제거할 수 없었습니다. 자세 엔진을 화면 렌더링과 다른 프로세스로 분리하고 데스크톱 앱이 lifecycle을 관리하는 구조가 필요했습니다.",
          ],
        },
        {
          type: "text",
          id: "solution",
          title: "해결",
          body: [
            "Electron 기반 구조를 Tauri로 전환하고 자세 추론을 Python sidecar 프로세스로 분리했습니다. React는 사용자 화면을 담당하고, Rust command가 sidecar lifecycle과 background worker를 관리하며, Python이 웹캠 프레임 전처리와 MediaPipe 추론을 수행하도록 책임을 나눴습니다.",
            "Python sidecar의 결과는 Tauri event를 통해 React로 전달했습니다. UI는 추론을 직접 수행하지 않고 엔진 상태와 자세 결과를 구독하도록 변경해 WebView 렌더링과 자세 엔진의 실행 경로를 분리했습니다.",
          ],
        },
        {
          type: "video",
          mp4Src: "/projects/geobugirin/background-inference.mp4",
          poster: "/projects/geobugirin/background-inference-poster.jpg",
          ariaLabel: "거부기린 메인 앱을 최소화한 뒤에도 위젯에서 자세 추론이 유지되는 과정",
          caption:
            "메인 앱을 최소화하고 Chrome에서 작업하는 동안에도 floating 위젯과 Python sidecar가 자세 추론을 유지하며, 자세가 나빠지면 위젯 상태가 즉시 경고 단계로 전환됩니다.",
          layout: "full",
          width: 1920,
          height: 810,
        },
        {
          type: "result",
          id: "result",
          title: "결과",
          body: "자세 추론을 WebView의 렌더링과 스케줄링 환경에서 분리하고 별도 프로세스에서 실행하는 Tauri 앱을 macOS와 Windows 사용자에게 배포했습니다. Apple M2 환경에서 동일한 1920×1080 영상을 사용해 foreground·background·minimized 상태를 각각 10분씩 3회 교차 측정한 결과, 세 상태 모두 추론 결과 전달률 100%를 유지했습니다. 평균 FPS 중앙값은 상태별 1.41~2.22였고, 최소화 상태의 정규화 CPU 사용률은 foreground 12.02% 대비 10.82%로 1.19%p 낮았습니다.",
        },
      ],
    },
    {
      id: "desktop-release",
      eyebrow: "Case 02",
      title: "Python 자세 엔진을 포함한 데스크톱 앱의 반복 배포가 어려움",
      blocks: [
        {
          type: "text",
          id: "problem",
          title: "문제",
          body: [
            "거부기린은 React와 Rust만 빌드해서 배포할 수 있는 일반적인 Tauri 앱이 아니었습니다. Python 3.11, MediaPipe 모델과 자세 엔진을 sidecar로 함께 패키징해야 했으며 macOS와 Windows가 서로 다른 빌드 및 서명 조건을 가지고 있었습니다.",
            "설치 파일이 생성되더라도 sidecar 위치나 CPU architecture가 맞지 않으면 자세 측정이 실행되지 않을 수 있었습니다. signing, notarization, updater artifact와 배포 경로까지 수동으로 관리하면 릴리스마다 누락 가능성이 남았습니다.",
          ],
        },
        {
          type: "text",
          id: "analysis",
          title: "원인 분석",
          body: [
            "플랫폼별 설치 파일과 Python sidecar, Tauri updater artifact가 서로 다른 도구와 산출물 규칙을 사용했습니다. macOS는 앱과 DMG signing 및 notarization이 필요했고, Windows는 Visual C++ 빌드 환경과 WiX 번들을 준비해야 했습니다.",
            "릴리스 장비는 Apple Silicon Mac mini 한 대였지만 macOS 사용자에게는 ARM64와 Intel x64 산출물이 모두 필요했습니다. Tauri 앱뿐 아니라 PyInstaller로 묶는 Python 자세 엔진까지 target architecture가 일치해야 하므로 단순한 Rust cross compile만으로는 Intel 패키지를 만들 수 없었습니다.",
            "Updater에는 설치 파일과 별도로 서명된 번들과 플랫폼별 manifest가 필요했습니다. React build, Rust build, Python 및 PyInstaller, 플랫폼 서명, 업데이트 manifest를 하나의 릴리스 단위로 검증할 절차가 없으면 일부 산출물만 배포되는 문제가 발생할 수 있었습니다.",
          ],
        },
        {
          type: "text",
          id: "solution",
          title: "해결",
          body: [
            "React/Tauri 앱과 랜딩, Admin, 디자인 시스템을 pnpm과 Turborepo 기반 모노레포로 분리하고 공통 품질 검사를 구성했습니다. 릴리스 전 Python sidecar를 PyInstaller로 빌드하고 Tauri가 요구하는 플랫폼별 위치와 이름을 검증하는 스크립트를 추가했습니다.",
            "Mac mini를 GitHub Actions self-hosted runner로 등록해 Apple Silicon용 `aarch64-apple-darwin` 빌드를 native로 실행했습니다. Intel용은 Rosetta 2에서 x86_64 Python을 선택해 sidecar를 패키징하고 `x86_64-apple-darwin` target으로 Tauri 앱을 빌드했습니다. 각 단계에서 `platform.machine()`과 sidecar architecture를 검증해 서로 다른 아키텍처가 섞인 패키지가 배포되지 않도록 했습니다.",
            "GitHub Actions에서 macOS·Windows release matrix를 실행하고 Apple signing keychain 격리, macOS notarization, updater artifact 서명과 manifest 생성을 자동화했습니다. 플랫폼별 번들과 latest.json을 배포할 수 있도록 Cloudflare R2 업로드 경로도 구성했습니다.",
          ],
        },
        {
          type: "image",
          src: "/projects/diagrams/geobugirin-release-pipeline.png",
          alt: "거부기린 Tauri 앱의 macOS와 Windows 빌드 서명 및 업데이트 배포 파이프라인",
          caption:
            "Apple Silicon Mac mini에서 ARM64는 native로, Intel x64는 Rosetta 2로 빌드한 뒤 signing, notarization과 업데이트 배포까지 연결한 릴리스 파이프라인",
          layout: "full",
          width: 4140,
          height: 1446,
        },
        {
          type: "result",
          id: "result",
          title: "결과",
          body: "Python 자세 엔진을 포함한 macOS와 Windows 설치 파일을 반복 생성하고 실제 사용자에게 배포할 수 있게 됐습니다. GitHub Releases 기반 자동 업데이트 채널도 구축해 운영했으며 현재는 배포 정책에 따라 일시 중단한 상태입니다. 수동 체크리스트에 의존하던 sidecar 패키징, signing, notarization과 updater 산출물 생성을 CI 및 검증 스크립트로 전환했습니다.",
        },
      ],
    },
    {
      id: "posture-scoring",
      eyebrow: "Case 03",
      title: "사용자마다 다른 체형과 움직임을 하나의 자세 기준으로 판단하기 어려움",
      blocks: [
        {
          type: "text",
          id: "problem",
          title: "문제",
          body: [
            "웹캠에서 관절 좌표를 추출하는 것만으로는 사용자의 자세가 좋은지 판단할 수 없었습니다. 카메라 거리와 체형, 앉은 위치가 다르고 프레임마다 landmark가 흔들려 고정된 좌표 임계값을 모든 사용자에게 적용하기 어려웠습니다.",
            "카메라 연결, 모델 초기화, 프레임 추론과 점수 계산 상태도 하나의 흐름에 섞여 있었습니다. 중간 단계가 실패하면 실제 엔진은 멈췄지만 사용자는 계속 측정 중인 것처럼 볼 수 있어 오류 원인과 자세 상태를 함께 구분해야 했습니다.",
          ],
        },
        {
          type: "text",
          id: "analysis",
          title: "원인 분석",
          body: [
            "MediaPipe Pose Landmarker는 33개의 landmark를 제공하지만 원본 좌표는 카메라 거리와 사용자의 체형에 영향을 받습니다. 단일 프레임의 값도 노이즈가 있어 경계 부근에서 자세 상태가 반복해서 바뀔 수 있었습니다.",
            "모든 사용자에게 동일한 절대 기준을 적용하기보다 개인의 바른 자세를 먼저 측정하고, 현재 자세가 그 기준에서 얼마나 벗어났는지를 시계열로 안정화할 필요가 있었습니다. 엔진 장애와 자세 분류도 서로 다른 상태로 모델링해야 했습니다.",
          ],
        },
        {
          type: "text",
          id: "solution",
          title: "해결",
          body: [
            "33개 landmark 중 귀와 어깨를 포함한 13개 핵심 지점을 사용했습니다. 귀 중앙과 어깨 중앙의 z축 차이를 3D 어깨 너비로 나눈 Posture Index를 설계해 카메라 거리와 체형 차이를 보정했습니다.",
            "사용자의 바른 자세를 calibration해 평균과 표준편차를 구하고 현재 PI를 z-score로 정규화했습니다. EMA와 이동 평균, 500ms 안정화 window를 적용해 프레임 노이즈를 줄인 뒤 자세를 6단계로 분류했습니다. 나쁜 자세 진입은 score 1.2 이상, 정상 복귀는 0.8 이하로 나눠 경계에서 상태가 반복되는 현상을 줄였습니다.",
            "카메라 stream, sidecar, 모델 초기화, 프레임 추론과 점수 상태를 분리하고 엔진 실패를 Tauri event로 UI에 전달했습니다. 사용자는 Loading, camera unavailable, detecting, warning, normal 상태에 맞는 피드백을 받도록 구성했습니다.",
          ],
        },
        {
          type: "video",
          mp4Src: "/projects/geobugirin/posture-feedback.mp4",
          poster: "/projects/geobugirin/posture-feedback-poster.jpg",
          ariaLabel:
            "거부기린이 웹캠 landmark를 분석해 자세 악화를 감지하고 정상 상태로 회복하는 과정",
          caption:
            "사용자의 자세 변화에 따라 landmark와 6단계 피드백이 정상에서 경고로 전환되고, 자세를 바로잡으면 다시 정상 상태로 회복됩니다.",
          layout: "full",
          width: 1920,
          height: 1258,
        },
        {
          type: "image",
          src: "/projects/diagrams/geobugirin-posture-pipeline.png",
          alt: "웹캠 입력부터 사용자별 자세 점수 계산과 Tauri UI 피드백까지의 자세 추론 파이프라인",
          caption:
            "Rust가 Python sidecar를 관리하고 MediaPipe 좌표를 사용자별로 보정해 6단계 자세 상태를 React에 전달하는 흐름",
          layout: "full",
          width: 2402,
          height: 1224,
        },
        {
          type: "result",
          id: "result",
          title: "결과",
          body: "사용자별 calibration을 기준으로 자세를 6단계로 분류하고 나쁜 자세의 진입과 회복 시점에 안정적인 피드백을 제공할 수 있게 됐습니다. 최근 한 달간 베타 사용자 43명이 합산 약 1,300시간 사용했으며 DB와 PostHog로 운영 지표를 확인했습니다.",
        },
      ],
    },
  ],
} satisfies ProjectCaseStudy;
