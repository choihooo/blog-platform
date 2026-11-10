# About 스크롤 영상 검증 — 2026-11-07

대상: 현재 작업본 `http://localhost:3000/about`, `/`, `/sitemap.xml`. 관련 스킬: `seo-page`,
`impeccable`, `verification-before-completion`.

## 공개 HTML·SEO

- `/about`과 `/` HTTP 200, 각 H1 1개.
- About canonical·og:url: `https://hozorica.com/about`.
- 제목·description·og:image·Twitter summary_large_image 확인. 의도하지 않은 noindex 없음.
- ProfilePage JSON-LD와 전체 소개가 서버 HTML에 포함된다.
- `/projects`, `/resume`, 공개 이메일·GitHub가 실제 링크다. 홈 About 링크는 `/about`으로 이동한다.
- 실제 sitemap HTTP 200, About URL 1개·기존 Resume 포함(전체 125개 URL).
- 포스터 WebP HTTP 200, 57,398 bytes. MP4 Range 요청 HTTP 206 확인.

## 동작·코드

- 스크롤 범위·metadata 지연·빠른 역방향 seek·unmount 정리·작은 화면/모션 줄이기 fallback 회귀
  테스트.
- 코드 리뷰의 낮은 모바일 가로 화면 잘림 문제는 높이 540px 이하의 문서 모드로 수정했다.
- `impeccable detect` 결과 `[]`.
- 브라우저 데스크톱: 영상 muted·paused·autoplay 없음, 스크롤로 연락처 프레임(13.293초) 도달 확인.
- 전체 앱 테스트 58개 파일/448개 테스트 통과. lint·typecheck·프로덕션 build 통과.
- format:check에서 발견한 줄바꿈은 apply_patch로 수정하고 재검사 통과했다.

## 브라우저 재확인

- 데스크톱 1440×900: 영상 위치 `0 → 13.293초 → 역방향 7.121초 → 끝 15.625초` 확인.
  muted·paused·autoplay 없음, 헤더 1개, 포트폴리오 이동 후 뒤로 가기 정상.
- 첫 브라우저 세션이 모바일 검사 중 닫혀 Aside REPL의 새 세션에서 나머지를 확인했다.
- 모바일 390×844: 영상 `object-fit: contain`, 문서/뷰포트 폭 모두 390px. 연락처 장면의 영상 위치
  12.221485초, 이메일·GitHub의 전체 클릭 영역이 뷰포트 안에 있음을 확인했다.
- 빠른 역방향 장면 전환에서 이전 문구가 겹치는 문제를 수정했다. 재확인 24프레임 동안 동시에 보이는
  장면 문구의 최댓값은 1개다.
- 모션 줄이기: `data-mode=static`, 영상 `src=null`, 소개 장면 6개 모두 접근 가능.
- 모바일 가로 667×375: 일반 문서 모드, 영상 `src=null`, 폭 667px/667px, 장면 6개 모두 접근 가능.

## 범위와 한계

- 모임·촬영 원본은 무료 GPU 한도로 정지 이미지의 카메라 전환을 사용한 시안이다. 모임 내부 흔들림이
  제거된 승인 버전을 사용했다. 웹에서 새 인물 동작을 생성하지 않았다.
- 운영 사이트·실사용 Core Web Vitals·실기기 Safari는 검사하지 않았다. 로컬 검증으로 배포나 운영 측정
  완료를 주장하지 않는다.
- JS 비활성화는 서버 렌더링 테스트로 확인했으며 별도의 JS 차단 브라우저는 실행하지 않았다.
