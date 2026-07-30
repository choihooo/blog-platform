# Tasks: SEO 자동화

**Input**: Design documents from `specs/010-seo-automation/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`,
`quickstart.md`

**Tests**: 이 feature는 SEO 산출물 정확성, published-only 경계, CMS report 품질, analytics privacy가 핵심
성공 기준이므로 user story별 테스트 task를 포함한다.

**Organization**: 사용자 스토리별로 독립 구현과 검증이 가능하도록 task를 구성한다.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 서로 다른 파일을 수정하며 선행 task에 의존하지 않아 병렬 실행 가능
- **[Story]**: user story phase task에만 사용
- 모든 task는 구현 대상 파일 경로를 포함한다

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: SEO/analytics shared package test surface와 blog/CMS 연결 파일을 준비한다.

<!-- prettier-ignore-start -->
- [ ] T001 Add Vitest `test` scripts and needed test devDependencies for `@blog-platform/seo-engine` and `@blog-platform/analytics` in `packages/seo-engine/package.json`, `packages/analytics/package.json`, and root `package.json`
- [ ] T002 [P] Add Vitest configuration for SEO engine package in `packages/seo-engine/vitest.config.ts`
- [ ] T003 [P] Add Vitest configuration for analytics package in `packages/analytics/vitest.config.ts`
- [ ] T004 [P] Add blog route contract test script support in `apps/blog/package.json`
- [ ] T005 [P] Create SEO engine module placeholders and exports in `packages/seo-engine/src/types.ts`, `packages/seo-engine/src/metadata.ts`, `packages/seo-engine/src/json-ld.ts`, `packages/seo-engine/src/feed.ts`, `packages/seo-engine/src/sitemap.ts`, `packages/seo-engine/src/robots.ts`, `packages/seo-engine/src/og-image.ts`, `packages/seo-engine/src/score.ts`, `packages/seo-engine/src/report.ts`, and `packages/seo-engine/src/index.ts`
- [ ] T006 [P] Create analytics module placeholders and exports in `packages/analytics/src/types.ts`, `packages/analytics/src/events.ts`, `packages/analytics/src/provider.ts`, `packages/analytics/src/console-links.ts`, and `packages/analytics/src/index.ts`
- [ ] T007 [P] Create app integration placeholders in `apps/blog/lib/seo.ts`, `apps/blog/lib/analytics.ts`, `apps/cms/lib/editor/seo-report.ts`, and `apps/cms/lib/editor/analytics-links.ts`
<!-- prettier-ignore-end -->

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: 모든 story가 공유하는 타입, fixture, content-to-subject 변환 경계를 구현한다.

**CRITICAL**: 이 phase가 끝나기 전에는 user story 구현을 시작하지 않는다.

<!-- prettier-ignore-start -->
- [ ] T008 [P] Add SEO subject fixture builders for published, draft, archived, complete, and invalid posts in `packages/seo-engine/src/test-fixtures.ts`
- [ ] T009 [P] Add analytics event and site fixture builders for GA4, GTM, disabled, and missing-config cases in `packages/analytics/src/test-fixtures.ts`
- [ ] T010 Implement SEO engine shared data types for subject, report, generated output, issue, preview, and result shapes in `packages/seo-engine/src/types.ts`
- [ ] T011 Implement analytics shared data types for event, provider config, provider payload, disabled result, and external console links in `packages/analytics/src/types.ts`
- [ ] T012 [P] Add markdown analysis adapter tests for image alt, internal link, canonical, taxonomy, author, TOC, and reading time mapping in `packages/seo-engine/src/subject.test.ts`
- [ ] T013 Implement `createSeoSubject` and shared URL helpers for site URL, public post URL, canonical URL, and OG image URL in `packages/seo-engine/src/subject.ts`
- [ ] T014 Export `createSeoSubject` and SEO subject helpers from `packages/seo-engine/src/index.ts`
- [ ] T015 [P] Add app SEO adapter tests for converting `PublicPost` and content collection data into SEO subjects in `apps/blog/lib/seo.test.ts`
- [ ] T016 Implement published post to SEO subject conversion helpers in `apps/blog/lib/seo.ts`
<!-- prettier-ignore-end -->

**Checkpoint**: Shared package tests can construct deterministic SEO subjects and analytics fixtures, and app code can adapt existing content without duplicating markdown validation.

---

## Phase 3: User Story 1 - 발행 글 SEO 산출물 자동 생성 (Priority: P1) MVP

**Goal**: 발행 글에서 page metadata, JSON-LD, RSS, Sitemap, robots, OG image payload를 자동 생성하고 초안/보관 글을 모든 공개 산출물에서 제외한다.

**Independent Test**: 발행 상태의 샘플 글을 기준으로 공개 글 metadata, canonical 정보, Open Graph 정보, JSON-LD, RSS, Sitemap, robots 정책, OG 이미지가 생성되고 초안과 보관 글이 제외되는지 확인한다.

### Tests for User Story 1

<!-- prettier-ignore-start -->
- [ ] T017 [P] [US1] Add page metadata generation tests for title, description fallback, canonical URL, Open Graph, Twitter metadata, and OG image URL in `packages/seo-engine/src/metadata.test.ts`
- [ ] T018 [P] [US1] Add JSON-LD generation tests for `BlogPosting`, `BreadcrumbList`, author, date, category, tag, and non-published rejection in `packages/seo-engine/src/json-ld.test.ts`
- [ ] T019 [P] [US1] Add RSS feed output tests for XML-safe fields, empty feed, sorted published items, guid/link, and draft/archived exclusion in `packages/seo-engine/src/feed.test.ts`
- [ ] T020 [P] [US1] Add Sitemap output tests for home, post, category, tag, last modified, duplicate removal, and draft/archived exclusion in `packages/seo-engine/src/sitemap.test.ts`
- [ ] T021 [P] [US1] Add robots policy tests for sitemap URL, public allow policy, CMS disallow, and preview route disallow in `packages/seo-engine/src/robots.test.ts`
- [ ] T022 [P] [US1] Add OG image payload tests for 1200x630 dimensions, long title wrapping metadata, category, author, cover image, and fallback state in `packages/seo-engine/src/og-image.test.ts`
- [ ] T023 [P] [US1] Add blog generated output route tests for SEO engine-backed RSS, Sitemap, robots, OG image success, unknown slug 404, and non-public slug 404 in `apps/blog/app/generated-output-routes.test.ts`
- [ ] T024 [P] [US1] Add blog page metadata tests for post, category, tag, canonical, Open Graph, Twitter metadata, and JSON-LD script output in `apps/blog/app/public-seo-output.test.tsx`
<!-- prettier-ignore-end -->

### Implementation for User Story 1

<!-- prettier-ignore-start -->
- [ ] T025 [US1] Implement page metadata generation in `packages/seo-engine/src/metadata.ts`
- [ ] T026 [US1] Implement `BlogPosting` and `BreadcrumbList` JSON-LD generation in `packages/seo-engine/src/json-ld.ts`
- [ ] T027 [US1] Implement RSS channel and item generation with XML escaping in `packages/seo-engine/src/feed.ts`
- [ ] T028 [US1] Implement Sitemap entry generation and published taxonomy selection in `packages/seo-engine/src/sitemap.ts`
- [ ] T029 [US1] Implement robots policy generation in `packages/seo-engine/src/robots.ts`
- [ ] T030 [US1] Implement OG image payload generation and fallback layout data in `packages/seo-engine/src/og-image.ts`
- [ ] T031 [US1] Export metadata, JSON-LD, feed, sitemap, robots, and OG image APIs from `packages/seo-engine/src/index.ts`
- [ ] T032 [US1] Wire RSS route to SEO engine feed serialization in `apps/blog/app/rss.xml/route.ts`
- [ ] T033 [US1] Wire Sitemap route to SEO engine sitemap serialization in `apps/blog/app/sitemap.xml/route.ts`
- [ ] T034 [US1] Wire robots route to SEO engine robots policy in `apps/blog/app/robots.txt/route.ts`
- [ ] T035 [US1] Wire OG image route to SEO engine payload and 1200x630 image response in `apps/blog/app/og/[slug]/route.ts`
- [ ] T036 [US1] Add post page metadata and JSON-LD integration in `apps/blog/app/posts/[slug]/page.tsx`
- [ ] T037 [P] [US1] Add category page metadata integration in `apps/blog/app/categories/[slug]/page.tsx`
- [ ] T038 [P] [US1] Add tag page metadata integration in `apps/blog/app/tags/[slug]/page.tsx`
- [ ] T039 [US1] Ensure SEO generated output uses only `getPublishedPosts` public content selection in `apps/blog/lib/seo.ts`
<!-- prettier-ignore-end -->

**Checkpoint**: User Story 1 is complete when generated public outputs and public page metadata are deterministic, route-backed, and expose only published content.

---

## Phase 4: User Story 2 - CMS에서 SEO 상태 점검 (Priority: P2)

**Goal**: CMS editor에서 현재 글의 0-100 SEO score, 차단 오류, 경고, 통과 항목, 검색/공유 미리보기, JSON-LD preview를 표시한다.

**Independent Test**: SEO metadata가 완성된 글과 결함이 있는 글을 각각 CMS에서 열어 점수, 차단 오류, 경고, 미리보기 정보가 예상대로 표시되는지 확인한다.

### Tests for User Story 2

<!-- prettier-ignore-start -->
- [ ] T040 [P] [US2] Add SEO score tests for H1, H2 count, meta description, Open Graph, canonical, title length, image alt, internal link, and total 100-point calculation in `packages/seo-engine/src/score.test.ts`
- [ ] T041 [P] [US2] Add SEO report tests for blocking, warning, pass, deterministic output, preview generation, and JSON-LD preview in `packages/seo-engine/src/report.test.ts`
- [ ] T042 [P] [US2] Add CMS SEO report adapter tests for editor document serialization, MDX analysis failure, missing metadata, complete metadata, and published URL generation in `apps/cms/lib/editor/seo-report.test.ts`
- [ ] T043 [P] [US2] Add CMS SEO panel UI tests for blocking, warning, pass, search preview, social preview, JSON-LD preview, and no analytics metric display in `apps/cms/components/editor/seo-panel.test.tsx`
- [ ] T044 [P] [US2] Add editor screen integration tests proving SEO report updates when title, excerpt, cover image, body headings, image alt, and links change in `apps/cms/components/editor/editor-seo-flow.test.tsx`
<!-- prettier-ignore-end -->

### Implementation for User Story 2

<!-- prettier-ignore-start -->
- [ ] T045 [US2] Implement rule-based SEO score calculation and issue weighting in `packages/seo-engine/src/score.ts`
- [ ] T046 [US2] Implement SEO report aggregation, blocking/warning/pass status, search preview, social preview, and JSON-LD preview in `packages/seo-engine/src/report.ts`
- [ ] T047 [US2] Export score and report APIs from `packages/seo-engine/src/index.ts`
- [ ] T048 [US2] Implement editor document to SEO report adapter using editor MDX serialization and markdown analysis in `apps/cms/lib/editor/seo-report.ts`
- [ ] T049 [P] [US2] Implement SEO panel blocking, warning, pass, preview, and JSON-LD display in `apps/cms/components/editor/seo-panel.tsx`
- [ ] T050 [US2] Integrate SEO panel into editor screen state and update flow in `apps/cms/components/editor/editor-screen.tsx`
- [ ] T051 [US2] Add SEO report blocking issue awareness to publish validation messaging in `apps/cms/lib/editor/publish-workflow.ts`
- [ ] T052 [US2] Export SEO panel component from `apps/cms/components/editor/index.ts`
<!-- prettier-ignore-end -->

**Checkpoint**: User Story 2 is complete when CMS shows deterministic SEO scoring and actionable issue groups for the current editor document without storing analytics or generated output files.

---

## Phase 5: User Story 3 - 분석 이벤트와 외부 콘솔 연결 (Priority: P3)

**Goal**: 공개 블로그가 GA4/GTM-compatible 독자 행동 이벤트를 전송하고, CMS가 발행 글별 공개 글/GA4/Search Console 외부 링크를 제공한다.

**Independent Test**: 공개 블로그에서 페이지 조회, 글 읽기, 공유 같은 합의된 이벤트가 설정된 분석 provider로 전송되고, CMS가 글별 공개 URL과 외부 콘솔 링크를 제공하는지 확인한다.

### Tests for User Story 3

<!-- prettier-ignore-start -->
- [ ] T053 [P] [US3] Add analytics event mapping tests for `page_view`, `post_read`, `heading_navigate`, `external_link_click`, `share_attempt`, GA4 payload, GTM payload, disabled provider, and missing config in `packages/analytics/src/events.test.ts`
- [ ] T054 [P] [US3] Add analytics privacy tests proving GitHub login, immutable user id, CMS session, email, IP address, and raw user agent are rejected or omitted in `packages/analytics/src/events.test.ts`
- [ ] T055 [P] [US3] Add provider initialization tests for GA4, GTM, disabled, and missing measurement/container values in `packages/analytics/src/provider.test.ts`
- [ ] T056 [P] [US3] Add external console link tests for public post URL, GA4 URL, Search Console URL, disabled reasons, invalid site URL, and no API credential requirement in `packages/analytics/src/console-links.test.ts`
- [ ] T057 [P] [US3] Add blog analytics integration tests for script payload, published-only event creation, disabled state, and no draft/archived/preview events in `apps/blog/lib/analytics.test.ts`
- [ ] T058 [P] [US3] Add CMS analytics link adapter tests for published post links, draft disabled state, GA4 disabled reason, and Search Console disabled reason in `apps/cms/lib/editor/analytics-links.test.ts`
- [ ] T059 [P] [US3] Add CMS SEO panel analytics link UI tests for public post, GA4, Search Console, disabled reasons, and one-click link rendering in `apps/cms/components/editor/seo-panel.test.tsx`
<!-- prettier-ignore-end -->

### Implementation for User Story 3

<!-- prettier-ignore-start -->
- [ ] T060 [US3] Implement analytics event validation, privacy filtering, provider payload mapping, and disabled results in `packages/analytics/src/events.ts`
- [ ] T061 [US3] Implement GA4/GTM provider initialization helpers and disabled state handling in `packages/analytics/src/provider.ts`
- [ ] T062 [US3] Implement external console link generation for public post, GA4, and Search Console in `packages/analytics/src/console-links.ts`
- [ ] T063 [US3] Export analytics event, provider, and console link APIs from `packages/analytics/src/index.ts`
- [ ] T064 [US3] Implement public blog analytics configuration and published-only event helpers in `apps/blog/lib/analytics.ts`
- [ ] T065 [US3] Integrate analytics provider script or data layer initialization in `apps/blog/app/layout.tsx`
- [ ] T066 [US3] Add post page analytics event hooks for page view, post read, heading navigation, external link click, and share attempt in `apps/blog/app/posts/[slug]/page.tsx`
- [ ] T067 [US3] Implement CMS analytics link adapter for editor documents and published posts in `apps/cms/lib/editor/analytics-links.ts`
- [ ] T068 [US3] Integrate analytics link group into CMS SEO panel in `apps/cms/components/editor/seo-panel.tsx`
<!-- prettier-ignore-end -->

**Checkpoint**: User Story 3 is complete when public blog emits only privacy-safe events for published content and CMS shows external links without querying GA4/Search Console APIs.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: 문서, 검증, scope review를 마무리한다.

<!-- prettier-ignore-start -->
- [ ] T069 [P] Update SEO engine package documentation and examples in `packages/seo-engine/README.md`
- [ ] T070 [P] Update analytics package documentation and examples in `packages/analytics/README.md`
- [ ] T071 [P] Update public blog generated output and analytics notes in `apps/blog/README.md`
- [ ] T072 [P] Update CMS SEO panel and analytics link notes in `apps/cms/README.md`
- [ ] T073 [P] Update quickstart validation status for SEO automation in `specs/010-seo-automation/quickstart.md`
- [ ] T074 Run `pnpm --filter @blog-platform/seo-engine typecheck`, `pnpm --filter @blog-platform/seo-engine lint`, and `pnpm --filter @blog-platform/seo-engine test` and fix issues in `packages/seo-engine`
- [ ] T075 Run `pnpm --filter @blog-platform/analytics typecheck`, `pnpm --filter @blog-platform/analytics lint`, and `pnpm --filter @blog-platform/analytics test` and fix issues in `packages/analytics`
- [ ] T076 Run `pnpm --filter @blog-platform/blog typecheck`, `pnpm --filter @blog-platform/blog lint`, `pnpm --filter @blog-platform/blog test`, and `pnpm --filter @blog-platform/blog build` and fix issues in `apps/blog`
- [ ] T077 Run `pnpm --filter @blog-platform/cms typecheck`, `pnpm --filter @blog-platform/cms lint`, and `pnpm --filter @blog-platform/cms test` and fix issues in `apps/cms`
- [ ] T078 Run `pnpm typecheck`, `pnpm lint`, `pnpm test`, and `pnpm build` from `package.json`
- [ ] T079 Verify quickstart scenarios in `specs/010-seo-automation/quickstart.md`
- [ ] T080 Confirm no forbidden scope was introduced against `.specify/memory/constitution.md`
- [ ] T081 Confirm no generated RSS/Sitemap/robots/OG files, GA4/Search Console API dashboard, analytics database/cache, AI SEO generation, internal link automatic recommendation, object storage, CMS database, or multi-author permission workflow was introduced in `apps/blog`, `apps/cms`, `packages/seo-engine`, `packages/analytics`, and `packages/markdown`
<!-- prettier-ignore-end -->

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies. Can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion and blocks all user story phases.
- **User Story 1 (Phase 3)**: Depends on Foundational. MVP scope.
- **User Story 2 (Phase 4)**: Depends on Foundational and can be implemented after SEO subject/report types exist. It can reuse US1 metadata/JSON-LD output for previews.
- **User Story 3 (Phase 5)**: Depends on Foundational. It can proceed independently from US1/US2 except for optional CMS panel placement.
- **Polish (Phase 6)**: Depends on selected user stories being complete.

### User Story Dependencies

- **US1 발행 글 SEO 산출물 자동 생성**: Requires SEO subject conversion and published-only selection; no dependency on CMS SEO panel or analytics events.
- **US2 CMS에서 SEO 상태 점검**: Requires SEO subject conversion and report/score APIs; can be independently tested with editor document fixtures.
- **US3 분석 이벤트와 외부 콘솔 연결**: Requires analytics types and fixtures; public event helpers must use published-only content and CMS links must avoid API calls.

### Parallel Opportunities

- T002, T003, T004, T005, T006, and T007 can run in parallel because they update separate package/app files.
- T008, T009, T012, and T015 can run in parallel as fixture and adapter test work.
- T017, T018, T019, T020, T021, T022, T023, and T024 can run in parallel for US1 tests.
- T037 and T038 can run in parallel after metadata generation contracts are stable.
- T040, T041, T042, T043, and T044 can run in parallel for US2 tests.
- T049 can run in parallel with T048 after report shape is agreed.
- T053, T054, T055, T056, T057, T058, and T059 can run in parallel for US3 tests.
- T069, T070, T071, T072, and T073 can run in parallel after implementation.

---

## Parallel Example: User Story 1

```text
Task: "Add page metadata generation tests for title, description fallback, canonical URL, Open Graph, Twitter metadata, and OG image URL in packages/seo-engine/src/metadata.test.ts"
Task: "Add JSON-LD generation tests for BlogPosting, BreadcrumbList, author, date, category, tag, and non-published rejection in packages/seo-engine/src/json-ld.test.ts"
Task: "Add RSS feed output tests for XML-safe fields, empty feed, sorted published items, guid/link, and draft/archived exclusion in packages/seo-engine/src/feed.test.ts"
Task: "Add Sitemap output tests for home, post, category, tag, last modified, duplicate removal, and draft/archived exclusion in packages/seo-engine/src/sitemap.test.ts"
Task: "Add blog generated output route tests for SEO engine-backed RSS, Sitemap, robots, OG image success, unknown slug 404, and non-public slug 404 in apps/blog/app/generated-output-routes.test.ts"
```

## Parallel Example: User Story 2

```text
Task: "Add SEO score tests for H1, H2 count, meta description, Open Graph, canonical, title length, image alt, internal link, and total 100-point calculation in packages/seo-engine/src/score.test.ts"
Task: "Add SEO report tests for blocking, warning, pass, deterministic output, preview generation, and JSON-LD preview in packages/seo-engine/src/report.test.ts"
Task: "Add CMS SEO report adapter tests for editor document serialization, MDX analysis failure, missing metadata, complete metadata, and published URL generation in apps/cms/lib/editor/seo-report.test.ts"
Task: "Add CMS SEO panel UI tests for blocking, warning, pass, search preview, social preview, JSON-LD preview, and no analytics metric display in apps/cms/components/editor/seo-panel.test.tsx"
Task: "Add editor screen integration tests proving SEO report updates when title, excerpt, cover image, body headings, image alt, and links change in apps/cms/components/editor/editor-seo-flow.test.tsx"
```

## Parallel Example: User Story 3

```text
Task: "Add analytics event mapping tests for page_view, post_read, heading_navigate, external_link_click, share_attempt, GA4 payload, GTM payload, disabled provider, and missing config in packages/analytics/src/events.test.ts"
Task: "Add provider initialization tests for GA4, GTM, disabled, and missing measurement/container values in packages/analytics/src/provider.test.ts"
Task: "Add external console link tests for public post URL, GA4 URL, Search Console URL, disabled reasons, invalid site URL, and no API credential requirement in packages/analytics/src/console-links.test.ts"
Task: "Add blog analytics integration tests for script payload, published-only event creation, disabled state, and no draft/archived/preview events in apps/blog/lib/analytics.test.ts"
Task: "Add CMS analytics link adapter tests for published post links, draft disabled state, GA4 disabled reason, and Search Console disabled reason in apps/cms/lib/editor/analytics-links.test.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Stop and validate generated output routes and public page metadata independently
5. Commit and demo public SEO output before CMS scoring or analytics work

### Incremental Delivery

1. Complete Setup + Foundational to establish package contracts
2. Add User Story 1 for public SEO generated outputs
3. Add User Story 2 for CMS SEO report and panel
4. Add User Story 3 for analytics events and external links
5. Run full quickstart and scope guard checks

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 generated public SEO outputs
   - Developer B: User Story 2 CMS SEO report and panel
   - Developer C: User Story 3 analytics package and app links
3. Stories complete and integrate through shared package exports

---

## Notes

- [P] tasks = different files, no dependency on incomplete tasks
- [US1], [US2], [US3] labels map to the prioritized user stories in `spec.md`
- Tests should be written before implementation tasks in each story phase
- Avoid generated output file commits for RSS, Sitemap, robots, and OG image artifacts
- Avoid GA4/Search Console API data fetching, analytics databases, AI SEO generation, and internal link automatic recommendation
