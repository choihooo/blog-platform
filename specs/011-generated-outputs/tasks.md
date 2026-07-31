# Tasks: Generated Outputs

**Input**: Design documents from `specs/011-generated-outputs/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`,
`quickstart.md`

**Tests**: 이 feature는 published-only 공개 경계, RSS/Sitemap/robots/XML contract, metadata/JSON-LD,
OG image fallback, TOC/reading time이 핵심 성공 기준이므로 user story별 테스트 task를 포함한다.

**Organization**: 사용자 스토리별로 독립 구현과 검증이 가능하도록 task를 구성한다.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 서로 다른 파일을 수정하며 선행 task에 의존하지 않아 병렬 실행 가능
- **[Story]**: user story phase task에만 사용
- 모든 task는 구현 대상 파일 경로를 포함한다

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: generated outputs 구현에 필요한 test surface와 fixture 경계를 준비한다.

<!-- prettier-ignore-start -->
- [x] T001 Verify generated output feature docs and active feature pointer in `.specify/feature.json` and `specs/011-generated-outputs/plan.md`
- [x] T002 [P] Verify `@blog-platform/seo-engine` test script and exports are ready for generated output modules in `packages/seo-engine/package.json` and `packages/seo-engine/src/index.ts`
- [x] T003 [P] Verify `@blog-platform/markdown` exports expose published filtering, TOC, heading slug, and reading time helpers in `packages/markdown/src/index.ts`
- [x] T004 [P] Verify blog app test script covers route and page integration tests in `apps/blog/package.json`
<!-- prettier-ignore-end -->

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: 모든 user story가 공유하는 subject 변환, URL 생성, fixture, public-only 입력 경계를
안정화한다.

**CRITICAL**: 이 phase가 끝나기 전에는 user story 구현을 시작하지 않는다.

<!-- prettier-ignore-start -->
- [x] T005 [P] Add or update published, draft, archived, missing-cover, long-title, duplicate-heading generated output fixtures in `packages/seo-engine/src/test-fixtures.ts`
- [x] T006 [P] Add or update blog content fixtures for published, draft, archived, category, tag, author, long title, missing cover, and repeated headings in `apps/blog/app/generated-output-routes.test.ts`
- [x] T007 Add SEO site URL normalization, public post URL, canonical URL, and OG image URL tests in `packages/seo-engine/src/subject.test.ts`
- [x] T008 Implement or tighten SEO subject URL helpers and published-safe subject creation in `packages/seo-engine/src/subject.ts`
- [x] T009 Add app adapter tests proving `PublicPost` maps author, category, tags, TOC, reading time, cover image, and status into SEO subjects in `apps/blog/lib/seo.test.ts`
- [x] T010 Implement or tighten `PublicPost` to `SeoSubject` conversion and published-only helper usage in `apps/blog/lib/seo.ts`
<!-- prettier-ignore-end -->

**Checkpoint**: Shared package와 blog app은 같은 published-only subject와 URL 규칙을 사용한다.

---

## Phase 3: User Story 1 - 발행 글 SEO 산출물 자동 제공 (Priority: P1) MVP

**Goal**: 발행 글에서 page metadata, JSON-LD, RSS, Sitemap, robots, OG image URL과 payload를 자동
생성하고 초안/보관 글을 모든 공개 산출물에서 제외한다.

**Independent Test**: 발행 상태의 샘플 글을 기준으로 공개 글 metadata, canonical 정보, Open Graph,
Twitter metadata, JSON-LD, RSS, Sitemap, robots 정책, OG image URL이 생성되고 초안/보관 글이
제외되는지 확인한다.

### Tests for User Story 1

<!-- prettier-ignore-start -->
- [x] T011 [P] [US1] Add metadata generation tests for canonical URL, Open Graph, Twitter metadata, fallback description, fallback OG image URL, and non-published rejection in `packages/seo-engine/src/metadata.test.ts`
- [x] T012 [P] [US1] Add JSON-LD tests for `BlogPosting`, `BreadcrumbList`, author, date, image, category, tags, undefined field cleanup, and non-published rejection in `packages/seo-engine/src/json-ld.test.ts`
- [x] T013 [P] [US1] Add RSS tests for XML escaping, empty channel, latest-first ordering, guid/link stability, description fallback, and draft/archived exclusion in `packages/seo-engine/src/feed.test.ts`
- [x] T014 [P] [US1] Add Sitemap tests for home URL, published post URLs, public category/tag URLs, last modified dates, duplicate URL removal, and private URL exclusion in `packages/seo-engine/src/sitemap.test.ts`
- [x] T015 [P] [US1] Add robots tests for sitemap absolute URL, public allow policy, CMS disallow, preview disallow, and stable line ordering in `packages/seo-engine/src/robots.test.ts`
- [x] T016 [P] [US1] Add OG image payload tests for title, site name, category, author, cover image, fallback state, public post URL, and non-published rejection in `packages/seo-engine/src/og-image.test.ts`
- [x] T017 [P] [US1] Add blog output route tests for `/rss.xml`, `/sitemap.xml`, `/robots.txt`, `/og/[slug]`, unknown slug 404, draft slug 404, and archived slug 404 in `apps/blog/app/generated-output-routes.test.ts`
- [x] T018 [P] [US1] Add blog post metadata tests for canonical, Open Graph, Twitter metadata, JSON-LD script output, and draft/archived 404 behavior in `apps/blog/app/public-seo-output.test.tsx`
<!-- prettier-ignore-end -->

### Implementation for User Story 1

<!-- prettier-ignore-start -->
- [x] T019 [US1] Implement or tighten generated page metadata behavior in `packages/seo-engine/src/metadata.ts`
- [x] T020 [US1] Implement or tighten `BlogPosting` and `BreadcrumbList` JSON-LD generation in `packages/seo-engine/src/json-ld.ts`
- [x] T021 [US1] Implement or tighten RSS output generation and XML serialization in `packages/seo-engine/src/feed.ts`
- [x] T022 [US1] Implement or tighten Sitemap output generation, taxonomy URL inclusion, private URL exclusion, and XML serialization in `packages/seo-engine/src/sitemap.ts`
- [x] T023 [US1] Implement or tighten robots policy generation and text serialization in `packages/seo-engine/src/robots.ts`
- [x] T024 [US1] Implement or tighten OG image payload creation and fallback payload behavior in `packages/seo-engine/src/og-image.ts`
- [x] T025 [US1] Export generated output APIs from `packages/seo-engine/src/index.ts`
- [x] T026 [US1] Wire `/rss.xml` to published-only feed output and correct response headers in `apps/blog/app/rss.xml/route.ts`
- [x] T027 [US1] Wire `/sitemap.xml` to published-only sitemap output including public category/tag URLs in `apps/blog/app/sitemap.xml/route.ts`
- [x] T028 [US1] Wire `/robots.txt` to robots policy output with sitemap URL and private surface disallow rules in `apps/blog/app/robots.txt/route.ts`
- [x] T029 [US1] Wire `/og/[slug]` to published-only post lookup, OG payload, fallback visual, long title wrapping, and private slug 404 in `apps/blog/app/og/[slug]/route.ts`
- [x] T030 [US1] Wire post detail metadata and JSON-LD generation into `apps/blog/app/posts/[slug]/page.tsx`
<!-- prettier-ignore-end -->

**Checkpoint**: User Story 1 is complete when all generated public outputs are deterministic,
route-backed, and expose only published content.

---

## Phase 4: User Story 2 - 피드와 크롤러용 사이트 산출물 제공 (Priority: P2)

**Goal**: RSS, Sitemap, robots의 site-level discovery 품질을 완성하고, 발행 글 0개와 taxonomy edge
case에서도 표준 응답을 제공한다.

**Independent Test**: 발행 글 여러 개와 카테고리/태그가 있는 상태에서 RSS에는 최신 발행 글이
들어가고, Sitemap에는 공개 표면만 들어가며, robots 정책에는 Sitemap 위치가 포함되는지 확인한다.

### Tests for User Story 2

<!-- prettier-ignore-start -->
- [x] T031 [P] [US2] Add RSS route integration tests for empty published collection, multiple published posts, latest-first order, XML content type, and no draft/archived body leakage in `apps/blog/app/generated-output-routes.test.ts`
- [x] T032 [P] [US2] Add Sitemap route integration tests for home, published posts, category URLs, tag URLs, duplicate removal, XML content type, and no CMS/preview URLs in `apps/blog/app/generated-output-routes.test.ts`
- [x] T033 [P] [US2] Add robots route integration tests for text content type, sitemap absolute URL, CMS disallow, preview disallow, and stable output in `apps/blog/app/generated-output-routes.test.ts`
- [x] T034 [P] [US2] Add taxonomy selection tests proving only categories and tags referenced by public content are exposed when required in `apps/blog/lib/seo.test.ts`
<!-- prettier-ignore-end -->

### Implementation for User Story 2

<!-- prettier-ignore-start -->
- [x] T035 [US2] Extend blog SEO adapter to provide public category and tag URL inputs for Sitemap generation in `apps/blog/lib/seo.ts`
- [x] T036 [US2] Extend Sitemap route to include public category and tag URLs without exposing empty private surfaces in `apps/blog/app/sitemap.xml/route.ts`
- [x] T037 [US2] Ensure RSS route handles zero published posts with a valid channel response in `apps/blog/app/rss.xml/route.ts`
- [x] T038 [US2] Ensure robots route serializes CMS and preview disallow rules plus absolute Sitemap URL in `apps/blog/app/robots.txt/route.ts`
- [x] T039 [US2] Update generated route tests to use explicit fixture data instead of relying on repository content order in `apps/blog/app/generated-output-routes.test.ts`
<!-- prettier-ignore-end -->

**Checkpoint**: User Story 2 is complete when feed and crawler routes remain valid across empty,
multi-post, taxonomy, and private-content edge cases.

---

## Phase 5: User Story 3 - 글 본문 보조 정보 표시 (Priority: P3)

**Goal**: 글 상세 페이지에서 Markdown/MDX 분석 결과 기반 TOC와 reading time을 표시하고, 목차 링크가
실제 heading anchor와 일치하게 한다.

**Independent Test**: heading이 여러 개 있는 발행 글 상세를 열어 목차, heading anchor, reading
time이 표시되고 본문 구조와 일치하는지 확인한다.

### Tests for User Story 3

<!-- prettier-ignore-start -->
- [x] T040 [P] [US3] Add markdown TOC tests for repeated headings, depth ordering, generated anchors, and stable labels in `packages/markdown/src/toc.test.ts`
- [x] T041 [P] [US3] Add markdown reading time tests for empty body, short body, long body, and label stability in `packages/markdown/src/reading-time.test.ts`
- [x] T042 [P] [US3] Add post page rendering tests for TOC visibility, heading anchor matching, repeated heading anchors, and reading time label in `apps/blog/app/public-seo-output.test.tsx`
<!-- prettier-ignore-end -->

### Implementation for User Story 3

<!-- prettier-ignore-start -->
- [x] T043 [US3] Tighten TOC generation and repeated heading anchor behavior in `packages/markdown/src/toc.ts` and `packages/markdown/src/headings.ts`
- [x] T044 [US3] Tighten reading time label generation and export behavior in `packages/markdown/src/reading-time.ts` and `packages/markdown/src/index.ts`
- [x] T045 [US3] Ensure content loader carries TOC and reading time from Markdown analysis into `PublicPost` in `apps/blog/lib/content.ts`
- [x] T046 [US3] Render TOC links and reading time on post detail without duplicating markdown analysis in `apps/blog/app/posts/[slug]/page.tsx`
- [x] T047 [US3] Verify TOC link targets match rendered heading IDs in post detail output in `apps/blog/app/public-seo-output.test.tsx`
<!-- prettier-ignore-end -->

**Checkpoint**: User Story 3 is complete when readers can use TOC and reading time on published post
details, and duplicate headings still navigate correctly.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: 문서, validation, scope guard를 마무리한다.

<!-- prettier-ignore-start -->
- [x] T048 [P] Update generated outputs examples and API notes in `packages/seo-engine/README.md`
- [x] T049 [P] Update Markdown TOC and reading time ownership notes in `packages/markdown/README.md`
- [x] T050 [P] Update public generated outputs notes in `apps/blog/README.md`
- [x] T051 [P] Record validation results for generated outputs in `specs/011-generated-outputs/quickstart.md`
- [x] T052 Run `pnpm --filter @blog-platform/seo-engine typecheck`, `pnpm --filter @blog-platform/seo-engine lint`, and `pnpm --filter @blog-platform/seo-engine test` and fix issues in `packages/seo-engine`
- [x] T053 Run `pnpm --filter @blog-platform/markdown typecheck`, `pnpm --filter @blog-platform/markdown lint`, and `pnpm --filter @blog-platform/markdown test` and fix issues in `packages/markdown`
- [x] T054 Run `pnpm --filter @blog-platform/blog typecheck`, `pnpm --filter @blog-platform/blog lint`, and `pnpm --filter @blog-platform/blog test` and fix issues in `apps/blog`
- [x] T055 Run `pnpm typecheck`, `pnpm lint`, and `pnpm test` from `package.json`
- [x] T056 Confirm no generated `rss.xml`, `sitemap.xml`, `robots.txt`, OG image files, analytics event work, CMS SEO panel work, GA4/Search Console API dashboard, object storage, CMS database, or AI generation was introduced in `apps/blog`, `packages/seo-engine`, and `packages/markdown`
<!-- prettier-ignore-end -->

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies. Can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion and blocks all user story phases.
- **User Story 1 (Phase 3)**: Depends on Foundational. MVP scope.
- **User Story 2 (Phase 4)**: Depends on Foundational and can use US1's shared package outputs, but
  is independently testable through route contracts.
- **User Story 3 (Phase 5)**: Depends on Foundational and existing Markdown/MDX analysis;
  independent from RSS/Sitemap/robots routes.
- **Polish (Phase 6)**: Depends on selected user stories being complete.

### User Story Dependencies

- **US1 발행 글 SEO 산출물 자동 제공**: Requires SEO subject conversion and published-only content
  selection; no dependency on US2/US3.
- **US2 피드와 크롤러용 사이트 산출물 제공**: Requires site URL normalization and published-only
  content selection; can be validated independently through public route responses.
- **US3 글 본문 보조 정보 표시**: Requires Markdown/MDX heading and reading time analysis; can be
  validated independently through post detail rendering.

### Parallel Opportunities

- T002, T003, and T004 can run in parallel because they inspect separate package/app configuration
  files.
- T005 and T006 can run in parallel because they update package and app fixtures separately.
- T011 through T018 can run in parallel as US1 tests across separate files.
- T031 through T034 can run in parallel as US2 tests and adapter coverage.
- T040 through T042 can run in parallel as US3 tests.
- T048 through T051 can run in parallel as documentation updates.

---

## Parallel Example: User Story 1

```text
Task: "Add metadata generation tests for canonical URL, Open Graph, Twitter metadata, fallback description, fallback OG image URL, and non-published rejection in packages/seo-engine/src/metadata.test.ts"
Task: "Add JSON-LD tests for BlogPosting, BreadcrumbList, author, date, image, category, tags, undefined field cleanup, and non-published rejection in packages/seo-engine/src/json-ld.test.ts"
Task: "Add RSS tests for XML escaping, empty channel, latest-first ordering, guid/link stability, description fallback, and draft/archived exclusion in packages/seo-engine/src/feed.test.ts"
Task: "Add Sitemap tests for home URL, published post URLs, public category/tag URLs, last modified dates, duplicate URL removal, and private URL exclusion in packages/seo-engine/src/sitemap.test.ts"
Task: "Add blog output route tests for /rss.xml, /sitemap.xml, /robots.txt, /og/[slug], unknown slug 404, draft slug 404, and archived slug 404 in apps/blog/app/generated-output-routes.test.ts"
```

## Parallel Example: User Story 2

```text
Task: "Add RSS route integration tests for empty published collection, multiple published posts, latest-first order, XML content type, and no draft/archived body leakage in apps/blog/app/generated-output-routes.test.ts"
Task: "Add Sitemap route integration tests for home, published posts, category URLs, tag URLs, duplicate removal, XML content type, and no CMS/preview URLs in apps/blog/app/generated-output-routes.test.ts"
Task: "Add robots route integration tests for text content type, sitemap absolute URL, CMS disallow, preview disallow, and stable output in apps/blog/app/generated-output-routes.test.ts"
Task: "Add taxonomy selection tests proving only categories and tags referenced by public content are exposed when required in apps/blog/lib/seo.test.ts"
```

## Parallel Example: User Story 3

```text
Task: "Add markdown TOC tests for repeated headings, depth ordering, generated anchors, and stable labels in packages/markdown/src/toc.test.ts"
Task: "Add markdown reading time tests for empty body, short body, long body, and label stability in packages/markdown/src/reading-time.test.ts"
Task: "Add post page rendering tests for TOC visibility, heading anchor matching, repeated heading anchors, and reading time label in apps/blog/app/public-seo-output.test.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational.
3. Complete Phase 3: User Story 1.
4. Stop and validate generated metadata, JSON-LD, RSS, Sitemap, robots, and OG image published-only
   behavior.

### Incremental Delivery

1. Complete Setup + Foundational.
2. Add User Story 1 and validate generated public outputs.
3. Add User Story 2 and validate feed/crawler route edge cases.
4. Add User Story 3 and validate post detail reading aids.
5. Run polish validation and scope guard.

### Scope Guard

- Do not implement SEO score, CMS SEO panel, GA4/GTM analytics events, external analytics console
  links, repository-committed generated files, object storage, CMS database, AI generation, or
  multi-author permissions in this feature.
- Keep generated output rules in shared packages and framework route wiring in `apps/blog`.
- Reuse `packages/markdown` for TOC, heading slug, and reading time instead of duplicating parsing
  logic.
