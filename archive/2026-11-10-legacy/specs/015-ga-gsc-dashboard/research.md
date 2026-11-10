# Research: GA/GSC 성과 대시보드

## Decision: GA4 방문 성과는 GA4 Data API의 report 조회를 기준으로 한다

**Rationale**: GA4 Data API는 GA4 property의 dimensions/metrics를 조회하는 공식 reporting
interface이며, `runReport` 계열로 기간, page path, 사용자/방문 지표를 가져올 수 있다. 공식 문서는
Data API가 지원 dimensions/metrics schema를 제공한다고 안내한다.

**Alternatives considered**:

- GA4 UI 링크만 제공: 실제 CMS 내 비교와 발행 후 추적 요구사항을 충족하지 못한다.
- 클라이언트 이벤트 로그를 자체 저장: 방문자 데이터 저장 범위가 커지고 MVP analytics event emission
  원칙과 충돌한다.

**Source**: https://developers.google.com/analytics/devguides/reporting/data/v1

## Decision: 검색 성과는 Search Console Search Analytics query를 기준으로 한다

**Rationale**: Search Console API는 Search Analytics report를 programmatic하게 조회할 수 있고, query
endpoint는 clicks, impressions 등 검색 성과 지표 계산 기준과 연결된다. 글별 검색 성과는 page URL
기준으로 조회하고 대표 검색어는 query dimension으로 조회한다.

**Alternatives considered**:

- Search Console UI 링크만 제공: 검색어/글별 비교를 CMS 안에서 제공할 수 없다.
- Sitemap 또는 색인 상태만 조회: 검색 성과 지표 요구사항과 맞지 않는다.

**Source**: https://developers.google.com/webmaster-tools/v1/searchanalytics/query

## Decision: 인증 방식은 서버 측 service account를 기본으로 하고 운영자 OAuth는 후속 옵션으로 둔다

**Rationale**: 단일 운영자 CMS에서 정기 조회와 cache snapshot을 만들려면 서버 측 credential이 더
단순하다. 운영자는 GA4 property와 Search Console property에 service account 접근 권한을 부여한다.
OAuth 사용자 동의 방식은 재동의, token refresh, 계정 전환 UX가 필요하므로 v1 범위를 키운다.

**Alternatives considered**:

- 운영자 OAuth만 사용: 사용자 계정 token lifecycle을 CMS에서 관리해야 한다.
- 수동 CSV 업로드: 자동 대시보드 요구사항과 맞지 않는다.

## Decision: 캐시는 D1 analytics snapshot으로 선택 적용한다

**Rationale**: GA4 Data API와 Search Console API 모두 quota/usage limits가 있으며, 화면 진입마다
원본 API를 반복 호출하면 quota와 지연에 취약하다. 최근 7일/28일 요약과 글별 성과는 짧은 TTL의
snapshot으로 저장하고, API 실패 시 마지막 성공 snapshot을 표시한다.

**Alternatives considered**:

- 캐시 없음: 구현은 단순하지만 오류와 quota에 취약하다.
- 파일 캐시: 배포 환경에서 쓰기 가능성과 동시성 보장이 낮다.

**Sources**:

- https://developers.google.com/analytics/devguides/reporting/data/v1/quotas
- https://developers.google.com/webmaster-tools/limits

## Decision: URL 매칭은 canonical URL 우선, slug path 보조 방식으로 한다

**Rationale**: GA/GSC 데이터는 URL/path 단위로 오므로 글 slug와 siteUrl을 조합한 canonical URL이
가장 안정적인 매칭 키다. 카테고리 경로, trailing slash, URL encoding 차이는 normalization으로
흡수하고, 매칭 실패는 숨기지 않고 대시보드에서 보여준다.

**Alternatives considered**:

- 제목 기반 매칭: 제목 변경과 중복 제목에 취약하다.
- 외부 데이터의 URL을 그대로 표시: CMS 글 목록과 성과 비교가 어렵다.

## Decision: 지표는 집계 데이터만 표시하고 개인 식별 데이터는 저장하지 않는다

**Rationale**: feature 목적은 콘텐츠 성과 판단이지 방문자 분석이 아니다. 집계 지표만 다루면
보안/프라이버시 위험을 줄이고 헌법의 안전한 발행 경계를 유지할 수 있다.

**Alternatives considered**:

- 사용자 단위 세션/이벤트 표시: 범위가 커지고 개인정보 위험이 생긴다.
- IP, device, location 상세 저장: 단일 운영자 블로그 성과 판단에 불필요하다.
