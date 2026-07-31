# Research: Analytics MVP

## Decision: Analytics event names follow the roadmap/spec list exactly

**Rationale**: 기존 `packages/analytics`에는 `page_view`, `post_read`, `heading_navigate`,
`share_attempt` 같은 임시 이벤트가 있으나, 로드맵과 명세는 `article_view`, `scroll_50`, `scroll_90`,
`code_copy`, `toc_click`, `internal_link_click`, `external_link_click`, `search`, `share`를 MVP
계약으로 정의한다. 구현은 기존 이벤트 목록을 새 계약으로 교체하거나 호환 shim 없이 명세 이름을
canonical name으로 사용해야 한다.

**Alternatives considered**: 기존 이벤트 이름 유지. 기각 이유는 CMS/문서/검증이 로드맵 이벤트와
불일치해 이후 analytics dashboard나 외부 리포트 매핑에서 drift가 생기기 때문이다.

## Decision: Provider activation is explicit and disabled by default

**Rationale**: `content/site.json`의 `analytics.provider`가 `ga4` 또는 `gtm`이어도 필요한 공개 id가
없으면 외부 전송은 disabled로 처리한다. 로컬 개발, preview, 테스트 환경에서 환경 설정 누락이 공개
페이지 실패로 이어지지 않아야 하며, secret이나 관리자 정보가 client payload에 포함되면 안 된다.

**Alternatives considered**: provider 설정만 있으면 id 없이도 이벤트 객체 생성. 기각 이유는 실제
수집이 불가능한 상태를 성공처럼 보이게 만들고 테스트가 오탐을 만들 수 있기 때문이다.

## Decision: No analytics persistence or server-side collection in MVP

**Rationale**: 헌법과 로드맵은 자체 분석 DB, 자체 대시보드, GA4/Search Console API dashboard를
MVP에서 금지한다. 이벤트는 browser analytics provider로 직접 전달하고, CMS는 외부 콘솔 URL만
제공한다.

**Alternatives considered**: 서버 route로 이벤트를 받아 나중에 처리하거나 로그로 저장. 기각 이유는
MVP 범위를 벗어나고 개인정보/보존/장애 처리 표면을 만든다.

## Decision: Scroll milestones are page-view scoped and once-only

**Rationale**: `scroll_50`과 `scroll_90`은 같은 글 표시 안에서 각각 한 번만 전송되어야 한다. 페이지
이동이나 slug 변경 시 milestone state는 새 글 context로 초기화되어야 한다.

**Alternatives considered**: 매번 threshold 통과 시 이벤트 전송. 기각 이유는 같은 독자 행동을 여러
번 집계해 분석 품질을 떨어뜨린다.

## Decision: Link classification is based on normalized public URL origin

**Rationale**: 내부/외부 링크 구분은 사이트 URL origin을 기준으로 한다. 같은 origin의
post/category/tag URL은 internal, 다른 http/https origin은 external로 분류한다. hash-only, mailto,
tel 같은 특수 URL은 별도 무시 또는 unsupported 상태로 분류해 external click 오탐을 막는다.

**Alternatives considered**: 문자열 prefix 비교. 기각 이유는 trailing slash, 상대 URL, URL encoding,
protocol 차이에서 오분류가 발생하기 쉽다.

## Decision: CMS console links are URL builders, not API integrations

**Rationale**: CMS는 공개 글 URL, GA4 페이지 성과 URL, Search Console 검색 성과 URL을 생성하되 외부
API를 조회하지 않는다. 필요한 `ga4PropertyId` 또는 `searchConsoleProperty`가 없으면 링크를
비활성화하고 이유를 표시한다.

**Alternatives considered**: GA4/Search Console API로 글별 지표를 표시. 기각 이유는 Post-MVP
Analytics API Dashboard 범위이며, 인증/쿼터/저장/캐시 정책이 추가된다.
