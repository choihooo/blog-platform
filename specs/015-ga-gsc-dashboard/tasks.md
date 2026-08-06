# Tasks: GA/GSC 성과 대시보드

**Input**: Design documents from `/specs/015-ga-gsc-dashboard/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: 포함. spec의 Independent Test와 quickstart 검증 시나리오가 명시되어 있으므로 story별 test
task를 구현 전에 배치한다.

**Organization**: 사용자 story별로 독립 구현/검증 가능하도록 구성한다.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 서로 다른 파일을 수정하며 미완료 task에 의존하지 않아 병렬 가능
- **[Story]**: 사용자 story phase task에만 적용
- 모든 task는 명확한 파일 경로를 포함한다

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: 분석 대시보드 feature가 들어갈 파일 구조와 의존성 경계를 준비한다.

- [x] T001 `apps/cms/components/shell/navigation.ts`에 Analytics navigation 항목 타입과 `/analytics`
      active state 추가
- [x] T002 `apps/cms/components/shell/navigation.test.ts`에 Analytics navigation 표시 및 active
      state 검증 추가
- [x] T003 [P] `packages/analytics/src/dashboard-types.ts`에 AnalyticsConnection, AnalyticsSnapshot,
      SitePerformanceSummary, PostPerformance, SearchQueryPerformance, PublicationPerformanceWindow
      타입 정의
- [x] T004 [P] `packages/analytics/src/index.ts`에서 dashboard analytics 타입과 helper export 추가
- [x] T005 [P] `apps/cms/lib/analytics/` 디렉터리와 barrel export `apps/cms/lib/analytics/index.ts`
      생성
- [x] T006 [P] `apps/cms/components/analytics/` 디렉터리와 barrel export
      `apps/cms/components/analytics/index.ts` 생성

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: 모든 user story가 공유하는 인증, 설정, provider 정규화, cache, 매칭 기반을 만든다.

**CRITICAL**: 이 phase가 끝나기 전에는 user story 구현을 시작하지 않는다.

- [x] T007 `packages/analytics/src/performance-normalization.ts`에 기간 비교, CTR/position 정규화,
      0/데이터 없음 구분 helper 구현
- [x] T008 [P] `packages/analytics/src/performance-normalization.test.ts`에 기간 비교와 누락 지표
      정규화 test 추가
- [x] T009 `packages/analytics/src/ga4-reporting.ts`에 GA4 page performance provider contract와
      mocked response normalization 구현
- [x] T010 [P] `packages/analytics/src/ga4-reporting.test.ts`에 pageViews/activeUsers와 이전 기간
      비교 normalization test 추가
- [x] T011 `packages/analytics/src/gsc-reporting.ts`에 GSC page/query performance provider
      contract와 mocked response normalization 구현
- [x] T012 [P] `packages/analytics/src/gsc-reporting.test.ts`에 clicks/impressions/CTR/position 및
      query normalization test 추가
- [x] T013 `apps/cms/lib/analytics/google-analytics-provider.ts`에 service account 설정 검증,
      provider error mapping, GA4/GSC provider composition 구현
- [x] T014 [P] `apps/cms/lib/analytics/google-analytics-provider.test.ts`에 missing-config,
      unauthorized, quota-limited, temporary-failure 매핑 test 추가
- [ ] T015 `apps/cms/lib/analytics/analytics-match.ts`에 canonical URL/slug 기반 글 매칭 및
      unmatched/partial 상태 계산 구현
- [ ] T016 [P] `apps/cms/lib/analytics/analytics-match.test.ts`에 trailing slash, URL encoding,
      category path, unmatched URL test 추가
- [ ] T017 `apps/cms/lib/analytics/analytics-cache.ts`에 AnalyticsSnapshot read/write interface와 D1
      미설정 fallback 구현
- [ ] T018 [P] `apps/cms/lib/analytics/analytics-cache.test.ts`에 마지막 성공 snapshot fallback과
      cache miss test 추가
- [ ] T019 `apps/cms/lib/content-adapter/d1-r2-adapter.ts`에 analytics_snapshots 저장/조회 SQL
      helper 또는 migration-safe adapter method 추가
- [ ] T020 `scripts/migration/d1-schema.sql`에 analytics_snapshots 테이블과 range/generated_at index
      추가
- [x] T021 `apps/cms/lib/analytics/analytics-dashboard-loader.ts`에 site config, published posts,
      provider, cache를 조합하는 dashboard loader skeleton 구현

**Checkpoint**: provider normalization, URL matching, cache, loader skeleton이 준비되어 user story
구현을 시작할 수 있다.

---

## Phase 3: User Story 1 - 사이트 성과 요약 확인 (Priority: P1) MVP

**Goal**: 운영자가 CMS `/analytics`에서 최근 7일/28일 사이트 전체 방문/검색 성과와 연결 상태를
확인한다.

**Independent Test**: 연결된 분석 계정이 있는 상태에서 `/analytics`에 진입하면 최근 7일과 28일 요약
지표와 직전 동일 기간 대비 변화가 표시된다. 설정 누락 또는 데이터 없음 상태도 CMS 전체 실패 없이
표시된다.

### Tests for User Story 1

- [x] T022 [P] [US1] `apps/cms/lib/analytics/analytics-dashboard-loader.test.ts`에 connected,
      missing-config, empty data, last snapshot fallback loader test 추가
- [ ] T023 [P] [US1] `apps/cms/components/analytics/metric-summary.test.tsx`에 7일/28일 요약 지표와
      변화 방향 렌더링 test 추가
- [ ] T024 [P] [US1] `apps/cms/components/analytics/analytics-empty-state.test.tsx`에
      권한/설정/데이터 없음 상태 렌더링 test 추가
- [ ] T025 [P] [US1] `apps/cms/app/analytics/page.test.tsx`에 인증된 CMS analytics page shell과
      summary 표시 test 추가

### Implementation for User Story 1

- [x] T026 [US1] `apps/cms/lib/analytics/analytics-dashboard-loader.ts`에 최근 7일/28일 date range
      계산, connection 상태, SitePerformanceSummary 생성 구현
- [x] T027 [P] [US1] `apps/cms/components/analytics/metric-summary.tsx`에 pageViews, activeUsers,
      searchClicks, searchImpressions, searchCtr, averagePosition summary UI 구현
- [x] T028 [P] [US1] `apps/cms/components/analytics/analytics-empty-state.tsx`에 missing-config,
      unauthorized, error, no-data 상태 UI 구현
- [x] T029 [US1] `apps/cms/components/analytics/analytics-dashboard.tsx`에 range 선택, summary,
      connection status, external links 배치 구현
- [x] T030 [US1] `apps/cms/app/analytics/page.tsx`에 CMS 인증 guard, CmsShell, analytics dashboard
      loader 연결 구현
- [x] T031 [US1] `packages/analytics/src/console-links.ts`에 dashboard에서 사용할 GA4/GSC
      property-level 링크 생성 보강

**Checkpoint**: User Story 1은 사이트 요약 대시보드 MVP로 독립 사용 가능해야 한다.

---

## Phase 4: User Story 2 - 글별 성과 비교 (Priority: P2)

**Goal**: 운영자가 발행 글별 방문 성과와 검색 성과를 한 목록에서 비교하고 정렬/필터링한다.

**Independent Test**: 발행 글 목록이 있는 상태에서 `/analytics` 글별 성과 표가 제목, slug, 발행일,
방문/검색 지표, 매칭 상태를 표시하고 주요 지표 기준 정렬이 동작한다.

### Tests for User Story 2

- [ ] T032 [P] [US2] `apps/cms/components/analytics/post-performance-table.test.tsx`에 글별 지표,
      정렬, 0/데이터 없음 표시 test 추가
- [ ] T033 [P] [US2] `apps/cms/lib/analytics/analytics-dashboard-loader.test.ts`에 published-only
      기본 필터, archived opt-in, category/tag filter test 추가
- [ ] T034 [P] [US2] `packages/analytics/src/performance-normalization.test.ts`에 top query와 낮은
      표본 상태 normalization test 추가

### Implementation for User Story 2

- [ ] T035 [US2] `apps/cms/lib/analytics/analytics-dashboard-loader.ts`에 발행 글 목록 조회,
      canonical URL 생성, provider postPerformance 병합 구현
- [ ] T036 [US2] `apps/cms/lib/analytics/analytics-dashboard-loader.ts`에
      range/status/category/tag/sort 입력 처리와 기본 published-only 정책 구현
- [ ] T037 [P] [US2] `apps/cms/components/analytics/post-performance-table.tsx`에 제목, slug,
      발행일, 상태, 방문 수, 활성 사용자, 검색 클릭/노출, CTR, 평균 순위, matchState 표 구현
- [ ] T038 [US2] `apps/cms/components/analytics/post-performance-table.tsx`에 sort control과
      category/tag/status filter control 구현
- [ ] T039 [US2] `apps/cms/components/analytics/analytics-dashboard.tsx`에 PostPerformanceTable 통합
      및 selected post detail 영역 연결
- [ ] T040 [US2] `packages/analytics/src/gsc-reporting.ts`에 page URL 기준 대표 검색어 topQueries
      정규화 구현
- [ ] T041 [US2] `apps/cms/components/analytics/post-performance-table.tsx`에 검색 성과는 있으나
      방문 성과가 없는 글의 0/데이터 없음 표시 구분 구현
- [ ] T042 [US2] `apps/cms/components/analytics/post-performance-table.tsx`에 선택한 글의 기간별
      성과 추이와 대표 검색어 detail panel 구현

**Checkpoint**: User Story 2는 글별 GA/GSC 비교 목록으로 독립 검증 가능해야 한다.

---

## Phase 5: User Story 3 - 발행 이후 성과 추적 (Priority: P3)

**Goal**: 운영자가 최근 발행 글의 발행 후 1일/7일/28일 누적 성과와 개선 검토 후보를 확인한다.

**Independent Test**: 최근 28일 안에 발행된 글이 있는 상태에서 발행 이후 성과 섹션이
pending/complete/insufficient-data 상태와 needsReview를 표시한다.

### Tests for User Story 3

- [ ] T043 [P] [US3] `packages/analytics/src/performance-normalization.test.ts`에 발행 후
      1일/7일/28일 window 계산과 pending 상태 test 추가
- [ ] T044 [P] [US3] `apps/cms/components/analytics/publication-performance.test.tsx`에 window별
      누적 성과와 needsReview 표시 test 추가
- [ ] T045 [P] [US3] `apps/cms/lib/analytics/analytics-dashboard-loader.test.ts`에 최근 발행 글
      window와 낮은 성과 기준 test 추가

### Implementation for User Story 3

- [ ] T046 [US3] `packages/analytics/src/performance-normalization.ts`에
      PublicationPerformanceWindow 계산과 중앙값 대비 50% 낮은 성과 needsReview 규칙 구현
- [ ] T047 [US3] `apps/cms/lib/analytics/analytics-dashboard-loader.ts`에 최근 28일 발행 글 window별
      provider query 요청/결과 병합 구현
- [ ] T048 [P] [US3] `apps/cms/components/analytics/publication-performance.tsx`에 발행 후
      1일/7일/28일 window table/card UI 구현
- [ ] T049 [US3] `apps/cms/components/analytics/analytics-dashboard.tsx`에 PublicationPerformance
      섹션 통합
- [ ] T050 [US3] `apps/cms/components/analytics/publication-performance.tsx`에 아직 도달하지 않은
      window pending 표시와 insufficient-data 표시 구현

**Checkpoint**: User Story 3은 발행 이후 성과 추적 섹션으로 독립 검증 가능해야 한다.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: 전체 story를 연결한 뒤 보안, 문서, quickstart 검증을 마무리한다.

- [ ] T051 [P] `apps/cms/components/shell/navigation.test.ts`에 Dashboard, Posts, Analytics,
      Settings 전체 navigation regression test 정리
- [ ] T052 `apps/cms/lib/analytics/analytics-dashboard-loader.ts`에서 외부 provider 오류가 CMS page
      render를 중단하지 않도록 error boundary/fallback 경로 검증
- [ ] T053 [P] `packages/analytics/README.md`에 GA/GSC dashboard metric normalization과 privacy
      boundary 문서화
- [ ] T054 [P] `apps/cms/README.md`에 Analytics dashboard 환경 변수, GA4/GSC 권한 부여, D1 cache
      설정 문서화
- [ ] T055 `specs/015-ga-gsc-dashboard/quickstart.md`의 validation scenarios 기준으로 수동 smoke
      checklist 실행 결과 확인
- [ ] T056 `apps/cms/README.md`에 analytics dashboard 검증 명령(`pnpm typecheck`, analytics/cms
      tests) 안내 정리
- [x] T057 `apps/cms/lib/analytics/analytics-dashboard-loader.test.ts`에 개인 식별 데이터가 view
      model로 전달되지 않는 privacy regression test 추가
- [ ] T058 `specs/015-ga-gsc-dashboard/quickstart.md`에 운영자 사용성 체크 결과 기록 섹션 추가
- [ ] T059 `pnpm typecheck` 실행
- [ ] T060 `pnpm test` 실행

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 즉시 시작 가능
- **Foundational (Phase 2)**: Setup 완료 후 진행, 모든 user story를 block
- **User Story 1 (Phase 3)**: Foundational 완료 후 시작, MVP
- **User Story 2 (Phase 4)**: Foundational 완료 후 시작 가능하지만 UI 통합은 US1 dashboard shell을
  재사용
- **User Story 3 (Phase 5)**: Foundational 완료 후 시작 가능하지만 dashboard 통합은 US1 shell을
  재사용
- **Polish (Phase 6)**: 구현 대상 user story 완료 후 진행

### User Story Dependencies

- **US1**: Foundational만 의존. 사이트 요약 MVP로 독립 배포 가능
- **US2**: Foundational에 의존. 최종 UI 통합은 US1의 `analytics-dashboard.tsx` 구조를 재사용하므로
  순차 구현 권장
- **US3**: Foundational에 의존. 최종 UI 통합은 US1의 `analytics-dashboard.tsx` 구조를 재사용하므로
  US1 이후 권장

### Within Each User Story

- Tests 먼저 작성
- analytics package normalization before CMS loader
- loader before page/component integration
- component unit tests before page integration tests
- story checkpoint에서 quickstart 해당 scenario로 검증

### Parallel Opportunities

- T003-T006은 서로 다른 setup 파일이라 병렬 가능
- T008, T010, T012, T014, T016, T018은 foundational test 파일이라 병렬 가능
- US1의 T022-T025 test task는 병렬 가능
- US1의 T027-T028 component task는 병렬 가능
- US2의 T032-T034 test task는 병렬 가능
- US2의 T037-T038은 같은 파일이라 동시 작업은 피하고, T040은 병렬 가능
- US3의 T043-T045 test task는 병렬 가능
- US3의 T048은 T046/T047과 파일 충돌이 없어 병렬 가능
- T053-T054 문서 작업은 병렬 가능

---

## Parallel Example: User Story 1

```bash
# US1 tests can be written together:
Task: "T022 [US1] apps/cms/lib/analytics/analytics-dashboard-loader.test.ts"
Task: "T023 [US1] apps/cms/components/analytics/metric-summary.test.tsx"
Task: "T024 [US1] apps/cms/components/analytics/analytics-empty-state.test.tsx"
Task: "T025 [US1] apps/cms/app/analytics/page.test.tsx"

# US1 components can be implemented after loader contract is stable:
Task: "T027 [US1] apps/cms/components/analytics/metric-summary.tsx"
Task: "T028 [US1] apps/cms/components/analytics/analytics-empty-state.tsx"
```

## Parallel Example: User Story 2

```bash
Task: "T032 [US2] apps/cms/components/analytics/post-performance-table.test.tsx"
Task: "T033 [US2] apps/cms/lib/analytics/analytics-dashboard-loader.test.ts"
Task: "T034 [US2] packages/analytics/src/performance-normalization.test.ts"
Task: "T040 [US2] packages/analytics/src/gsc-reporting.ts"
```

## Parallel Example: User Story 3

```bash
Task: "T043 [US3] packages/analytics/src/performance-normalization.test.ts"
Task: "T044 [US3] apps/cms/components/analytics/publication-performance.test.tsx"
Task: "T045 [US3] apps/cms/lib/analytics/analytics-dashboard-loader.test.ts"
Task: "T048 [US3] apps/cms/components/analytics/publication-performance.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1 Setup 완료
2. Phase 2 Foundational 완료
3. Phase 3 US1 완료
4. `/analytics`에서 연결 상태, 7일/28일 summary, fallback/empty state 검증
5. `pnpm typecheck`, 관련 analytics/cms tests 실행

### Incremental Delivery

1. US1로 사이트 요약 대시보드 제공
2. US2로 글별 성과 비교와 검색어/매칭 상태 추가
3. US3로 발행 이후 window 추적과 개선 검토 후보 추가
4. Phase 6으로 문서, privacy regression, quickstart validation 완료

### Notes

- D1 cache는 Post-MVP analytics dashboard 안정성을 위한 fallback이다. 외부 API 실패 시 마지막 성공
  snapshot을 우선 사용한다.
- 초안은 기본 분석 대상에서 제외한다.
- 모든 dashboard output은 집계 지표만 포함해야 하며 방문자 개인 식별 데이터는 전달하지 않는다.
- Google credential 값은 repository에 커밋하지 않는다.
