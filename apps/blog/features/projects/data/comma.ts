import type { ProjectCaseStudy } from "../project-types";

export const commaProject = {
  slug: "comma",
  index: "08",
  name: "Comma",
  meta: "휴식 추천 서비스 · 5인 팀",
  description:
    "휴식 추천 서비스의 핵심 질문 표시 시간을 단축하고 React Web과 Native 기능을 연결하는 typed Bridge를 구축했습니다.",
  role: "Frontend Engineer (Web & React Native)",
  period: "2026.06 ~ 2026.08",
  organization: "Side Project",
  team: "기획 1 · 디자인 1 · 프론트엔드 2 · 백엔드 1",
  technologies: ["React", "React Query", "React Native", "Expo", "WebView Bridge", "Playwright"],
  metrics: [
    {
      label: "주요 경로 질문 표시",
      value: "−55.2%",
      detail: "2,333.2ms → 1,045.3ms · Feed prefetch 경로",
    },
    {
      label: "직접 진입 질문 표시",
      value: "−41.1%",
      detail: "2,333.2ms → 1,373.6ms",
    },
  ],
  sections: [
    {
      id: "checklist-performance",
      eyebrow: "Case 01",
      title: "초기 화면은 표시되지만 핵심 질문은 2초 이상 비어 있음",
      blocks: [
        {
          type: "text",
          id: "problem",
          title: "문제",
          body: [
            "휴식 체크리스트 화면은 사용자가 현재 기분과 사용할 수 있는 시간을 선택해 추천 활동으로 진입하는 핵심 화면입니다. 배경과 로고, 하단 내비게이션은 빠르게 표시됐지만 정작 사용자가 선택해야 하는 질문과 옵션은 API 응답 전까지 비어 있었습니다.",
            "FCP는 307.2ms였지만 질문이 실제로 표시되는 평균 시점은 2,333.2ms였습니다. 브라우저 지표상 첫 화면은 빠르게 렌더링됐지만 사용자는 약 2초 동안 무엇을 선택해야 하는지 알 수 없어 화면이 멈춘 것처럼 느낄 수 있었습니다.",
          ],
        },
        {
          type: "text",
          id: "analysis",
          title: "원인 분석",
          body: [
            "기존 구현은 체크리스트 화면이 mount된 이후 useEffect에서 API를 요청하고 응답을 local state에 저장했습니다. 로딩 중에는 질문 영역에 별도의 placeholder가 없었습니다.",
            "FCP만으로는 핵심 콘텐츠의 체감 지연을 설명할 수 없어 질문 텍스트가 실제로 보이는 시점을 별도 지표로 정의했습니다. 1초 지연 mock API와 430×932 모바일 viewport에서 개선 전후를 각각 5회 측정한 결과, 초기 렌더링이 아니라 데이터 요청과 질문 상태 반영 구간이 병목임을 확인했습니다.",
          ],
        },
        {
          type: "text",
          id: "solution",
          title: "해결",
          body: [
            "수동 useEffect 요청을 React Query useQuery로 전환하고 체크리스트 query key와 응답 검증 함수를 공통화했습니다. 자주 변경되지 않는 문항 특성을 반영해 staleTime을 10분으로 설정했습니다.",
            "데이터 수신 전에는 빈 영역 대신 실제 질문 UI의 진행 바, 제목과 선택지 위치를 반영한 Skeleton을 표시했습니다. 사용자가 주로 휴식 흐름을 시작하는 Feed 화면에서는 체크리스트 데이터를 미리 prefetch해 화면 진입 전에 캐시를 준비했습니다.",
          ],
        },
        {
          type: "video-comparison",
          beforeLabel: "개선 전",
          afterLabel: "개선 후",
          ariaLabel:
            "질문 영역이 비어 있는 개선 전 화면과 Skeleton이 즉시 표시되는 개선 후 화면 비교",
          beforeMp4Src: "/projects/comma/checklist-loading-before.mp4",
          beforeWebmSrc: "/projects/comma/checklist-loading-before.webm",
          beforePoster: "/projects/comma/checklist-loading-before-poster.jpg",
          afterMp4Src: "/projects/comma/checklist-loading-after.mp4",
          afterWebmSrc: "/projects/comma/checklist-loading-after.webm",
          afterPoster: "/projects/comma/checklist-loading-after-poster.jpg",
          caption:
            "동일한 430×932 화면과 4.62초 재생 구간. 개선 전에는 질문 영역이 비어 있지만 개선 후에는 실제 질문 구조를 반영한 Skeleton이 즉시 표시됩니다.",
          layout: "compact",
          width: 430,
          height: 1028,
        },
        {
          type: "result",
          id: "result",
          title: "결과",
          body: "직접 진입 시 질문 표시 평균 시간을 2,333.2ms에서 1,373.6ms로 41.1% 단축했습니다. 실제 주요 사용 흐름인 Feed prefetch 경로에서는 1,045.3ms까지 줄여 55.2% 개선했습니다. Skeleton을 통해 데이터 대기 중에도 질문 화면이 준비되고 있음을 전달했습니다.",
        },
      ],
    },
    {
      id: "typed-native-bridge",
      eyebrow: "Case 02",
      title: "WebView의 React 화면에서 Native 기능을 직접 사용할 수 없음",
      blocks: [
        {
          type: "text",
          id: "problem",
          title: "문제",
          body: [
            "Comma는 React 웹 화면을 Expo React Native 앱의 WebView 안에서 실행하는 구조였습니다. 웹 화면만으로는 Native 갤러리와 카메라, 보안 저장소, 하드웨어 뒤로가기처럼 앱 환경의 기능을 직접 사용할 수 없었습니다.",
            "특히 휴식 활동을 완료한 사용자가 사진과 리뷰를 피드에 게시하려면 Native 갤러리에서 사진을 가져와 업로드 가능한 파일로 변환하고, 웹에서 입력한 리뷰와 함께 서버로 전송해야 했습니다. Web과 Native가 임의의 메시지 형식으로 통신하면 기능이 늘어날수록 payload 불일치와 예외 처리 누락 위험도 커질 수 있었습니다.",
          ],
        },
        {
          type: "text",
          id: "analysis",
          title: "원인 분석",
          body: [
            "React 웹과 React Native shell은 서로 다른 실행 환경을 사용했습니다. 웹은 UI와 사용자 입력을 관리했지만 Native 파일 URI와 미디어 권한, SecureStore, 하드웨어 이벤트에는 접근할 수 없었습니다.",
            "갤러리에서 전달되는 asset URI는 플랫폼마다 형태가 다르고 iOS의 ph:// URI처럼 서버에 바로 업로드할 수 없는 값도 있었습니다. 웹과 Native 양쪽에 기능별 통신 코드를 따로 추가하면 메서드 이름과 요청·응답 타입을 동기화하기 어려워 공통 계약이 필요했습니다.",
          ],
        },
        {
          type: "text",
          id: "solution",
          title: "해결",
          body: [
            "packages/bridge에 AppBridge 인터페이스와 메시지 schema를 정의하고 @webview-bridge/web과 @webview-bridge/react-native를 이용해 typed Bridge를 구성했습니다. 웹은 typed client만 호출하고 Native shell이 갤러리, 카메라, 인증, 뒤로가기와 실제 API 요청을 구현하도록 책임을 분리했습니다.",
            "피드 업로드에서는 Native가 미디어 권한을 요청하고 갤러리 사진을 조회한 뒤 선택한 asset을 업로드 가능한 로컬 URI로 준비했습니다. 웹에서 받은 리뷰, 해시태그, 공개 여부와 사진을 multipart 요청으로 조합해 Native에서 서버로 전송했습니다.",
            "이후 인증 토큰을 Native SecureStore로 이전하고, Native SDK 로그인과 인증 API 요청을 Bridge에 연결했습니다. 사진 촬영과 임시 파일 수명 관리, WebView 화면별 뒤로가기 처리도 같은 공통 계약을 확장하는 방식으로 추가했습니다.",
          ],
        },
        {
          type: "image",
          src: "/projects/diagrams/comma-native-bridge.png",
          alt: "React WebView와 Native Shell을 타입이 정의된 AppBridge 계약으로 연결한 구조",
          caption:
            "웹은 typed client만 호출하고 Native Shell이 갤러리, 인증, 뒤로가기와 multipart 업로드를 담당하는 Bridge 구조",
          layout: "full",
          width: 3708,
          height: 564,
        },
        {
          type: "video",
          ariaLabel:
            "휴식 체크리스트에서 추천 활동을 선택하고 Native 갤러리 사진으로 피드를 등록하는 전체 흐름",
          mp4Src: "/projects/comma/native-gallery-feed-flow.mp4",
          poster: "/projects/comma/native-gallery-feed-flow-poster.jpg",
          caption:
            "체크리스트 선택부터 추천 활동, Native 갤러리 사진 선택, 리뷰 작성과 공개 피드 등록까지 이어지는 실제 Android 앱 흐름 · 15초 하이라이트",
          layout: "portrait",
          width: 1080,
          height: 2400,
        },
        {
          type: "result",
          id: "result",
          title: "결과",
          body: "React로 구현한 화면을 유지하면서 휴식 활동 완료, Native 갤러리 또는 카메라에서 사진 선택, 리뷰와 해시태그 작성, multipart 업로드, 피드 게시로 이어지는 흐름을 연결했습니다. Web과 Native의 메서드 및 payload를 공통 TypeScript 계약으로 관리해 기능 추가 시 양쪽 구현의 불일치를 컴파일 단계에서 확인할 수 있게 했습니다. 동일한 Bridge 구조를 SecureStore 인증과 Native 로그인, 하드웨어 뒤로가기까지 확장해 하이브리드 앱의 플랫폼 기능을 일관된 방식으로 연결했습니다.",
        },
      ],
    },
  ],
} satisfies ProjectCaseStudy;
