# Tasks: Analytics MVP

**Input**: Design documents from `specs/012-analytics-mvp/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md),
[data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: 이 feature는 provider/event/link contract와 public interaction 동작이 핵심이므로 테스트 작업을
각 사용자 스토리 구현보다 먼저 배치한다.

**Organization**: 사용자 스토리별로 독립 구현 및 검증이 가능하도록 구성한다.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 서로 다른 파일 또는 선행 작업에 의존하지 않아 병렬 처리 가능
- **[Story]**: 사용자 스토리 단계의 작업에만 부여
- 모든 작업은 구체적인 파일 경로를 포함

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: 기존 analytics 표면과 문서 계약을 새 Analytics MVP 범위에 맞춰 정렬

- [ ] T001 Update Analytics MVP event scope in `packages/analytics/README.md`
- [ ] T002 [P] Add shared Analytics MVP fixtures in `packages/analytics/src/test-fixtures.ts`
- [ ] T003 [P] Review and document site analytics config fields in `content/site.json`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: 모든 사용자 스토리가 의존하는 canonical 타입, provider, helper 계약 정비

**CRITICAL**: 이 단계가 끝나기 전에는 user story 구현을 시작하지 않는다.

- [ ] T004 Replace legacy event names with Analytics MVP canonical names in `packages/analytics/src/types.ts`
- [ ] T005 Add article analytics context and event target fields in `packages/analytics/src/types.ts`
- [ ] T006 Update provider initialization result types for GA4/GTM/disabled states in `packages/analytics/src/types.ts`
- [ ] T007 Implement disabled-by-default provider normalization in `packages/analytics/src/provider.ts`
- [ ] T008 [P] Export new analytics contracts from `packages/analytics/src/index.ts`
- [ ] T009 [P] Add provider contract tests for GA4, GTM, unknown provider, and missing id cases in `packages/analytics/src/provider.test.ts`

**Checkpoint**: canonical event/provider 타입이 준비되어 user story 구현을 시작할 수 있다.

---

## Phase 3: User Story 1 - 공개 블로그 이벤트 발행 (Priority: P1) MVP

**Goal**: 공개 글 상세와 주요 독자 상호작용이 canonical Analytics MVP 이벤트 9종으로 전송된다.

**Independent Test**: 분석 provider가 설정된 공개 글에서 `article_view`, `scroll_50`, `scroll_90`,
`code_copy`, `toc_click`, `internal_link_click`, `external_link_click`, `search`, `share`가 글 맥락과 함께
한 번 또는 해당 상호작용마다 전송되는지 검증한다.

### Tests for User Story 1

- [ ] T010 [P] [US1] Add canonical event payload tests in `packages/analytics/src/events.test.ts`
- [ ] T011 [P] [US1] Add scroll milestone once-only tests in `packages/analytics/src/scroll-milestones.test.ts`
- [ ] T012 [P] [US1] Add link classification tests for internal, external, and ignored hrefs in `packages/analytics/src/link-classification.test.ts`
- [ ] T013 [P] [US1] Add public blog analytics helper tests in `apps/blog/lib/analytics.test.ts`
- [ ] T014 [P] [US1] Add public interaction binding tests in `apps/blog/app/components/post-analytics-events.test.tsx`
- [ ] T015 [P] [US1] Add code copy analytics tests in `apps/blog/app/components/code-copy-button.test.tsx`

### Implementation for User Story 1

- [ ] T016 [US1] Implement canonical blog event creation and provider payload mapping in `packages/analytics/src/events.ts`
- [ ] T017 [P] [US1] Implement page-view-scoped scroll milestone helper in `packages/analytics/src/scroll-milestones.ts`
- [ ] T018 [P] [US1] Implement normalized URL link classification helper in `packages/analytics/src/link-classification.ts`
- [ ] T019 [US1] Update public blog analytics config and event helper in `apps/blog/lib/analytics.ts`
- [ ] T020 [US1] Add client analytics provider boundary for GA4/GTM/disabled payload delivery in `apps/blog/app/components/analytics-provider.tsx`
- [ ] T021 [US1] Add public post interaction binding for article view, scroll, toc, link, search, and share events in `apps/blog/app/components/post-analytics-events.tsx`
- [ ] T022 [US1] Add code copy button event emission for successful copy actions in `apps/blog/app/components/code-copy-button.tsx`
- [ ] T023 [US1] Integrate public post analytics binding into published post detail page in `apps/blog/app/posts/[slug]/page.tsx`

**Checkpoint**: User Story 1은 provider 설정이 있는 공개 글에서 독립적으로 검증 가능하다.

---

## Phase 4: User Story 2 - 분석 provider 조건부 활성화 (Priority: P2)

**Goal**: GA4/GTM provider가 설정된 경우에만 외부 수집이 활성화되고, 설정이 없거나 불완전해도 공개 페이지가 정상 동작한다.

**Independent Test**: GA4, GTM, disabled, missing id 환경을 각각 구성해 public rendering과 interaction이 실패하지 않고 올바른 provider 상태로 정규화되는지 검증한다.

### Tests for User Story 2

- [ ] T024 [P] [US2] Add blog analytics config tests for GA4, GTM, disabled, and missing environment ids in `apps/blog/lib/analytics.test.ts`
- [ ] T025 [P] [US2] Add analytics provider rendering tests for configured and disabled states in `apps/blog/app/components/analytics-provider.test.tsx`
- [ ] T026 [P] [US2] Add scope guard tests ensuring disabled provider does not throw during interactions in `apps/blog/app/components/post-analytics-events.test.tsx`

### Implementation for User Story 2

- [ ] T027 [US2] Extend blog analytics config to read GA4/GTM public ids and disabled reasons in `apps/blog/lib/analytics.ts`
- [ ] T028 [US2] Render GA4/GTM initialization only for valid provider init states in `apps/blog/app/components/analytics-provider.tsx`
- [ ] T029 [US2] Connect analytics provider boundary from blog layout without exposing secrets in `apps/blog/app/layout.tsx`
- [ ] T030 [US2] Ensure public interaction binding no-ops safely when provider is disabled in `apps/blog/app/components/post-analytics-events.tsx`

**Checkpoint**: User Story 2는 provider 설정 조합만 바꿔 독립 검증 가능하다.

---

## Phase 5: User Story 3 - CMS 외부 분석 콘솔 이동 (Priority: P3)

**Goal**: CMS editor에서 발행 글에 대해 공개 글, GA4 페이지 성과, Search Console 검색 성과 외부 링크를 제공하고 비공개 글에는 잘못된 링크를 표시하지 않는다.

**Independent Test**: draft, published, archived, slug 없음, site URL 없음, GA4/Search Console 설정 누락 상태별로 CMS link helper와 editor UI가 올바른 URL 또는 비활성 이유를 제공하는지 검증한다.

### Tests for User Story 3

- [ ] T031 [P] [US3] Add external console link contract tests for published and disabled states in `packages/analytics/src/console-links.test.ts`
- [ ] T032 [P] [US3] Add CMS analytics link helper tests for draft, archived, missing slug, and configured console ids in `apps/cms/lib/editor/analytics-links.test.ts`
- [ ] T033 [P] [US3] Add editor screen external analytics link rendering tests in `apps/cms/components/editor/editor-screen.test.tsx`

### Implementation for User Story 3

- [ ] T034 [US3] Extend external console link builder with published status, GA4 property, and Search Console property rules in `packages/analytics/src/console-links.ts`
- [ ] T035 [US3] Update CMS analytics link helper to use site URL and analytics config instead of hardcoded localhost in `apps/cms/lib/editor/analytics-links.ts`
- [ ] T036 [US3] Render public post, GA4, and Search Console external link actions with disabled states in `apps/cms/components/editor/editor-screen.tsx`
- [ ] T037 [US3] Thread site analytics settings into editor screen loading flow in `apps/cms/lib/editor/editor-loader.ts`

**Checkpoint**: User Story 3은 CMS editor의 발행 글 링크 표시만으로 독립 검증 가능하다.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: 문서, 검증, scope guard를 마무리

- [ ] T038 [P] Update analytics package documentation and validation commands in `packages/analytics/README.md`
- [ ] T039 [P] Add Analytics MVP completion notes to `specs/012-analytics-mvp/quickstart.md`
- [ ] T040 Run `pnpm --filter @blog-platform/analytics typecheck` and record result in `specs/012-analytics-mvp/quickstart.md`
- [ ] T041 Run `pnpm --filter @blog-platform/analytics lint` and record result in `specs/012-analytics-mvp/quickstart.md`
- [ ] T042 Run `pnpm --filter @blog-platform/analytics test` and record result in `specs/012-analytics-mvp/quickstart.md`
- [ ] T043 Run `pnpm --filter @blog-platform/blog typecheck` and record result in `specs/012-analytics-mvp/quickstart.md`
- [ ] T044 Run `pnpm --filter @blog-platform/blog lint` and record result in `specs/012-analytics-mvp/quickstart.md`
- [ ] T045 Run `pnpm --filter @blog-platform/blog test` and record result in `specs/012-analytics-mvp/quickstart.md`
- [ ] T046 Run `pnpm --filter @blog-platform/cms typecheck` and record result in `specs/012-analytics-mvp/quickstart.md`
- [ ] T047 Run `pnpm --filter @blog-platform/cms lint` and record result in `specs/012-analytics-mvp/quickstart.md`
- [ ] T048 Run `pnpm --filter @blog-platform/cms test` and record result in `specs/012-analytics-mvp/quickstart.md`
- [ ] T049 Verify no analytics database, dashboard, GA4/Search Console API query, or server collection route was added across `packages/analytics`, `apps/blog`, and `apps/cms`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 즉시 시작 가능
- **Foundational (Phase 2)**: Setup 이후 진행하며 모든 사용자 스토리를 block
- **User Story 1 (Phase 3)**: Foundational 이후 시작, MVP scope
- **User Story 2 (Phase 4)**: Foundational 이후 시작 가능하나 provider boundary는 US1 component와 같은 파일을 공유하므로 순차 진행 권장
- **User Story 3 (Phase 5)**: Foundational 이후 시작 가능하며 public blog binding과 독립적
- **Polish (Phase 6)**: 선택한 user story 구현 완료 후 진행

### User Story Dependencies

- **User Story 1 (P1)**: Foundational 완료 후 독립 구현 가능
- **User Story 2 (P2)**: Foundational 완료 후 독립 검증 가능, 실제 파일 충돌을 줄이려면 US1 이후 진행
- **User Story 3 (P3)**: Foundational 완료 후 독립 구현 가능, CMS link UI는 US1/US2와 런타임 의존 없음

### Within Each User Story

- 테스트 작업을 먼저 작성하고 실패를 확인한다.
- `packages/analytics` contract 구현을 먼저 완료한다.
- 앱별 helper와 component binding을 그 다음 연결한다.
- 각 user story checkpoint에서 독립 검증을 수행한다.

### Parallel Opportunities

- T002, T003은 서로 다른 파일이라 병렬 가능
- T008, T009는 타입 정의가 완료된 뒤 서로 병렬 가능
- US1의 T010-T015 테스트 작업은 서로 다른 파일 중심이라 병렬 가능
- US1의 T017, T018은 서로 독립 helper라 병렬 가능
- US2의 T024-T026 테스트 작업은 병렬 가능
- US3의 T031-T033 테스트 작업은 병렬 가능
- T038, T039는 문서 파일이 달라 병렬 가능

---

## Parallel Example: User Story 1

```bash
Task: "T010 [P] [US1] Add canonical event payload tests in packages/analytics/src/events.test.ts"
Task: "T011 [P] [US1] Add scroll milestone once-only tests in packages/analytics/src/scroll-milestones.test.ts"
Task: "T012 [P] [US1] Add link classification tests for internal, external, and ignored hrefs in packages/analytics/src/link-classification.test.ts"
Task: "T013 [P] [US1] Add public blog analytics helper tests in apps/blog/lib/analytics.test.ts"
```

## Parallel Example: User Story 3

```bash
Task: "T031 [P] [US3] Add external console link contract tests for published and disabled states in packages/analytics/src/console-links.test.ts"
Task: "T032 [P] [US3] Add CMS analytics link helper tests for draft, archived, missing slug, and configured console ids in apps/cms/lib/editor/analytics-links.test.ts"
Task: "T033 [P] [US3] Add editor screen external analytics link rendering tests in apps/cms/components/editor/editor-screen.test.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Validate `article_view`, scroll milestone, copy, toc, link, search, share event emission independently

### Incremental Delivery

1. Setup + Foundational으로 canonical analytics contract 정렬
2. US1로 public blog event emission 완성
3. US2로 provider activation과 disabled safety 강화
4. US3로 CMS external console links 완성
5. Polish phase에서 package별 validation과 scope guard 확인

### Scope Guard

- 자체 분석 저장소를 만들지 않는다.
- 자체 분석 대시보드를 만들지 않는다.
- GA4 Data API 또는 Search Console API 조회를 추가하지 않는다.
- 서버 측 이벤트 수집 route를 추가하지 않는다.
- public analytics payload에 secret, GitHub token, CMS session, 관리자 identity를 포함하지 않는다.
