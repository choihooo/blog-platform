# Tasks: Blog Rendering

**Input**: Design documents from `/specs/004-blog-rendering/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: 이 feature는 quickstart와 route contract에서 app validation과 route 검증을 요구하므로
구현 후 검증 task를 포함한다. 별도 unit test-first workflow는 요청되지 않았다.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing
of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Blog Rendering에 필요한 blog app dependency와 shared package 연결을 준비한다.

- [ ] T001 Add `@blog-platform/markdown`, MDX rendering helper, `remark-gfm`, and `rehype-slug`
      dependencies in `apps/blog/package.json`
- [ ] T002 Run dependency installation and update `pnpm-lock.yaml`
- [ ] T003 [P] Confirm blog app package scripts still expose `build`, `typecheck`, `lint`, and `dev`
      in `apps/blog/package.json`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: 모든 public route가 공유하는 local content loader와 view model adapter를 만든다.

**CRITICAL**: 이 phase가 끝나기 전에는 사용자 스토리 route 작업을 시작하지 않는다.

- [ ] T004 Create local file reader for `content/posts/*.mdx`, `content/authors/*.md`,
      `content/categories.json`, `content/tags.json`, and `content/site.json` in
      `apps/blog/lib/content.ts`
- [ ] T005 Integrate `validateContentCollection` and fail-fast issue formatting in
      `apps/blog/lib/content.ts`
- [ ] T006 Implement published-only post selection using `getPublishedPosts` in
      `apps/blog/lib/content.ts`
- [ ] T007 Implement public post view adapter with resolved author, category, tags, `analyzeMdx`,
      TOC, reading time, and validated body in `apps/blog/lib/content.ts`
- [ ] T008 Export `getSiteConfig`, `getPublishedPosts`, `getPostBySlug`, `getPostsByCategory`,
      `getPostsByTag`, `getCategory`, and `getTag` helpers from `apps/blog/lib/content.ts`

**Checkpoint**: Shared local content loader can produce public-only view data without GitHub
credentials, database, object storage, or CMS session.

---

## Phase 3: User Story 1 - Published Post Discovery (Priority: P1) MVP

**Goal**: 방문자가 public home에서 published 글 목록을 최신순으로 확인하고 상세 페이지로 이동할 수
있다.

**Independent Test**: published 샘플 글이 있는 상태에서 `/`에 접속해 site name, `Hello World`,
excerpt, 발행일, author, reading time, category, tag, detail link가 보이고 draft/archived 글은
제외되는지 확인한다.

### Implementation for User Story 1

- [ ] T009 [P] [US1] Add reusable public post list component in
      `apps/blog/app/components/post-list.tsx`
- [ ] T010 [P] [US1] Add public blog typography and layout styles in `apps/blog/app/globals.css`
- [ ] T011 [US1] Import global styles and update public site metadata in `apps/blog/app/layout.tsx`
- [ ] T012 [US1] Replace initial blog shell with published post home in `apps/blog/app/page.tsx`
- [ ] T013 [US1] Verify home route contract from
      `specs/004-blog-rendering/contracts/public-blog-routes.md` against `apps/blog/app/page.tsx`

**Checkpoint**: User Story 1 is independently functional when `/` displays only published post
discovery data.

---

## Phase 4: User Story 2 - Post Reading Page (Priority: P2)

**Goal**: 방문자가 `/posts/[slug]`에서 검증된 MDX 본문, 글 metadata, reading time, TOC를 읽을 수
있다.

**Independent Test**: `/posts/hello-world`에 접속해 title, excerpt, author, published date, reading
time, taxonomy, TOC, validated body가 보이고 unknown/draft/archived slug는 not found로 처리되는지
확인한다.

### Implementation for User Story 2

- [ ] T014 [P] [US2] Create published post detail route with `generateStaticParams` in
      `apps/blog/app/posts/[slug]/page.tsx`
- [ ] T015 [US2] Implement post metadata and not-found handling in
      `apps/blog/app/posts/[slug]/page.tsx`
- [ ] T016 [US2] Render validated MDX body with allowed components and GFM support in
      `apps/blog/app/posts/[slug]/page.tsx`
- [ ] T017 [US2] Add slugged heading anchor support matching generated TOC in
      `apps/blog/app/posts/[slug]/page.tsx`
- [ ] T018 [US2] Render reading time, author, published date, category links, tag links, and TOC in
      `apps/blog/app/posts/[slug]/page.tsx`
- [ ] T019 [US2] Verify post detail route contract from
      `specs/004-blog-rendering/contracts/public-blog-routes.md` against
      `apps/blog/app/posts/[slug]/page.tsx`

**Checkpoint**: User Story 2 is independently functional when a published slug renders and all
non-public slugs avoid body exposure.

---

## Phase 5: User Story 3 - Category and Tag Browsing (Priority: P3)

**Goal**: 방문자가 registered category와 tag route에서 matching published 글만 탐색할 수 있다.

**Independent Test**: `/categories/engineering`과 `/tags/mdx`에 접속해 registered taxonomy label과
matching published 글만 보이고 unknown taxonomy slug는 not found로 처리되는지 확인한다.

### Implementation for User Story 3

- [ ] T020 [P] [US3] Create category listing route with `generateStaticParams` in
      `apps/blog/app/categories/[slug]/page.tsx`
- [ ] T021 [P] [US3] Create tag listing route with `generateStaticParams` in
      `apps/blog/app/tags/[slug]/page.tsx`
- [ ] T022 [US3] Render registered category metadata and matching published posts in
      `apps/blog/app/categories/[slug]/page.tsx`
- [ ] T023 [US3] Render registered tag metadata and matching published posts in
      `apps/blog/app/tags/[slug]/page.tsx`
- [ ] T024 [US3] Implement not-found handling for unknown category and tag slugs in
      `apps/blog/app/categories/[slug]/page.tsx` and `apps/blog/app/tags/[slug]/page.tsx`
- [ ] T025 [US3] Verify category and tag route contracts from
      `specs/004-blog-rendering/contracts/public-blog-routes.md` against
      `apps/blog/app/categories/[slug]/page.tsx` and `apps/blog/app/tags/[slug]/page.tsx`

**Checkpoint**: User Story 3 is independently functional when taxonomy routes show only matching
published posts.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: 구현된 Blog Rendering scope를 문서, 검증 command, 전체 workspace 기준으로 마무리한다.

- [ ] T026 [P] Update Blog Rendering validation notes in `specs/004-blog-rendering/quickstart.md` if
      runnable commands changed
- [ ] T027 [P] Update public blog implementation notes in `README.md`
- [ ] T028 Run `pnpm --filter @blog-platform/blog typecheck` and fix any issues in `apps/blog`
- [ ] T029 Run `pnpm --filter @blog-platform/blog lint` and fix any issues in `apps/blog`
- [ ] T030 Run `pnpm --filter @blog-platform/blog build` and fix route generation issues in
      `apps/blog`
- [ ] T031 Run `pnpm build` and fix workspace integration issues in `apps/blog/package.json`,
      `pnpm-lock.yaml`, or shared package references
- [ ] T032 Start `pnpm dev:blog` and verify `/`, `/posts/hello-world`, `/categories/engineering`,
      and `/tags/mdx` respond successfully
- [ ] T033 Confirm forbidden scope from `specs/004-blog-rendering/plan.md` was not introduced in
      `apps/blog` or `packages/markdown`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies. Can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion and blocks all user story route work.
- **User Story 1 (Phase 3)**: Depends on Foundational. MVP scope.
- **User Story 2 (Phase 4)**: Depends on Foundational and integrates cleanly after US1 layout/list
  primitives exist.
- **User Story 3 (Phase 5)**: Depends on Foundational and reuses US1 post list component.
- **Polish (Phase 6)**: Depends on selected user stories being complete.

### User Story Dependencies

- **US1 (P1)**: Requires Setup + Foundational only.
- **US2 (P2)**: Requires Setup + Foundational. Can be implemented without US3, but benefits from US1
  layout styling.
- **US3 (P3)**: Requires Setup + Foundational and reusable post list UI from US1.

### Within Each User Story

- Shared loader tasks precede all route tasks.
- Route file creation precedes contract verification for that route.
- Public-only and not-found handling must be implemented before quickstart validation.
- Story checkpoints should pass before moving to the next priority story.

### Parallel Opportunities

- T003 can run in parallel with dependency installation review after T001/T002 are understood.
- T009 and T010 touch separate files and can run in parallel.
- T014 can run in parallel with taxonomy route file creation after foundational loader completion.
- T020 and T021 touch separate taxonomy route files and can run in parallel.
- T026 and T027 are documentation tasks and can run in parallel during polish.

---

## Parallel Example: User Story 1

```bash
Task: "Add reusable public post list component in apps/blog/app/components/post-list.tsx"
Task: "Add public blog typography and layout styles in apps/blog/app/globals.css"
```

---

## Parallel Example: User Story 2

```bash
Task: "Create published post detail route with generateStaticParams in apps/blog/app/posts/[slug]/page.tsx"
Task: "Verify post detail route contract from specs/004-blog-rendering/contracts/public-blog-routes.md against apps/blog/app/posts/[slug]/page.tsx"
```

---

## Parallel Example: User Story 3

```bash
Task: "Create category listing route with generateStaticParams in apps/blog/app/categories/[slug]/page.tsx"
Task: "Create tag listing route with generateStaticParams in apps/blog/app/tags/[slug]/page.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 setup.
2. Complete Phase 2 foundational content loader.
3. Complete Phase 3 User Story 1.
4. Validate `/` independently against the home route contract.
5. Stop and confirm public post discovery before adding detail and taxonomy routes.

### Incremental Delivery

1. Setup + Foundational: blog app can load validated public content.
2. US1: home page lists published posts only.
3. US2: post detail renders validated MDX body and generated metadata.
4. US3: category and tag pages expose matching published posts only.
5. Polish: quickstart validation and contract review confirm readiness for implementation
   completion.

### Parallel Team Strategy

1. Complete Setup and Foundational together.
2. Assign US1 UI list/styling while another contributor prepares US2 route file.
3. Assign category and tag route files in parallel after shared loader is stable.
4. Sequence final edits touching shared layout or post list component to avoid conflicts.

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Avoid introducing GitHub runtime reads, CMS authentication, database, object storage, analytics
  API, RSS, sitemap, JSON-LD, OG image generation, SEO score, search, archive pagination, or
  newsletter capture in this phase
