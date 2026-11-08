# About scroll video implementation plan

**Goal:** 승인된 자연 배경 영상으로 `/about`을 만들고 스크롤에 따라 앞뒤로 탐색한다.

**Architecture:** App Router는 메타데이터와 공개 연락처를 조립한다. `features/about`은 콘텐츠,
스크롤 계산, 영상 seek 제어, 표현을 분리한다. 기존 `/resume`은 유지한다.

**Scope:** 사용자가 승인한 영상과 장면 구성을 그대로 사용한다. 새 의존성·원격 데이터 변경·배포는
없다.

- [x] 스크롤 범위, 영상 끝 프레임, metadata 지연, 빠른 역방향 탐색, unmount를 테스트한다.
- [x] 짧은 GOP 영상·포스터를 앱에 저장하고 sticky 영상과 장면별 실제 링크를 구현한다.
- [x] JS 없음·모션 줄이기·영상 오류에서 일반 문서와 링크를 유지한다.
- [x] About 목적지를 `/about`으로 연결하고 sitemap·라우트 계약·README를 갱신한다.
- [x] 앱 필수 검사와 로컬 데스크톱·모바일·앞뒤 탐색·SEO 검사를 수행한다. 상세 결과와 미검증 범위는
      `docs/audits/2026-11-07-about-scroll.md`에 기록했다.

**Review focus:** seek 중 새 스크롤 요청 유실, reduced motion의 자동 로드, 작은 화면에서 잘리는
영상, 숨겨진 링크의 포커스, 서버 HTML의 소개/메타데이터, 기존 작업 diff 보존.
