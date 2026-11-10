# Quickstart: GA/GSC 성과 대시보드

## Prerequisites

- CMS 관리자 인증이 설정되어 있어야 한다.
- `content/site.json`에 사이트 URL, GA4 property ID, Search Console property가 설정되어 있어야 한다.
- GA4와 Google Search Console에서 서버 측 credential이 해당 property를 읽을 수 있어야 한다.
- D1 cache를 사용할 경우 analytics snapshot 저장소가 준비되어 있어야 한다.

## Validation Scenarios

### 1. 연결 상태 확인

```bash
pnpm typecheck
pnpm test --filter @blog-platform/analytics
pnpm test --filter @blog-platform/cms
```

Expected:

- analytics provider unit tests pass.
- CMS analytics page tests pass.
- 설정 누락 상태에서는 빈 상태와 외부 콘솔 링크가 표시된다.

### 2. 요약 지표 표시

1. CMS에 로그인한다.
2. `/analytics`로 이동한다.
3. 기간을 최근 7일과 28일로 각각 전환한다.

Expected:

- 방문 수, 활성 사용자 수, 검색 클릭 수, 검색 노출 수, CTR, 평균 게재 순위가 표시된다.
- 직전 동일 기간 대비 변화 방향이 표시된다.
- 마지막 데이터 기준 날짜가 표시된다.

### 3. 글별 성과 비교

1. `/analytics`의 글별 성과 목록을 연다.
2. `searchClicks`, `pageViews`, `averagePosition`으로 정렬한다.
3. 특정 글을 선택한다.

Expected:

- 발행 글마다 GA/GSC 지표가 함께 표시된다.
- 대표 검색어가 있는 글은 query 성과가 표시된다.
- 매칭되지 않은 URL은 경고 상태로 구분된다.

### 4. 발행 이후 성과 추적

1. 최근 28일 안에 발행된 글이 있는 상태에서 `/analytics`를 연다.
2. 발행 이후 성과 섹션을 확인한다.

Expected:

- 발행 후 1일, 7일, 28일 window가 표시된다.
- 아직 도달하지 않은 window는 pending으로 표시된다.
- 낮은 성과 기준에 해당하는 글은 개선 검토 후보로 표시된다.

### 5. 오류와 fallback

1. 분석 credential을 비활성화하거나 권한이 없는 property로 설정한다.
2. `/analytics`를 다시 연다.

Expected:

- CMS 전체가 실패하지 않는다.
- 권한 또는 설정 문제를 설명하는 상태가 표시된다.
- 마지막 성공 snapshot이 있으면 해당 데이터가 fallback으로 표시된다.

## Out of Scope for This Feature

- 실시간 방문자 수
- 방문자 개인별 상세 이벤트 조회
- 다중 사이트 또는 다중 운영자 권한 분리
- Search Console URL Inspection 또는 indexing action
- 장기 historical warehouse 구축
