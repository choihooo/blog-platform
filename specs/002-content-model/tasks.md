# Tasks: Content Model

**Input**: Design documents from `specs/002-content-model/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md),
[data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: 테스트는 plan과 quickstart에서 명시되어 있으므로 각 사용자 스토리에 test-first 작업을
포함한다.

**Organization**: 사용자 스토리별로 작업을 그룹화해 각 스토리를 독립적으로 구현하고 검증할 수 있게
한다.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 다른 파일을 수정하거나 선행 작업 의존성이 없어 병렬 처리 가능
- **[Story]**: 사용자 스토리 매핑. 예: `[US1]`, `[US2]`, `[US3]`
- 모든 task는 명확한 파일 경로를 포함한다.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Content model 구현에 필요한 package dependency와 test runner를 준비한다.

- [ ] T001 Add `zod`, `gray-matter`, `github-slugger`, `vitest`, and test script configuration in
      `packages/markdown/package.json`
- [ ] T002 Add root `test` pipeline support for workspace packages in `package.json` and
      `turbo.json`
- [ ] T003 [P] Create Vitest configuration for the markdown package in
      `packages/markdown/vitest.config.ts`
- [ ] T004 [P] Update content model implementation notes in `packages/markdown/README.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: 모든 사용자 스토리가 공유하는 타입, validation result, parser 기반을 만든다.

**CRITICAL**: 이 phase가 끝나기 전에는 사용자 스토리 구현을 시작하지 않는다.

- [ ] T005 Define shared content model types and validation issue helpers in
      `packages/markdown/src/index.ts`
- [ ] T006 [P] Add reusable test fixture builders for post, author, category, tag, and site config
      inputs in `packages/markdown/src/content-fixtures.test.ts`
- [ ] T007 Implement frontmatter parsing utilities for post and author files in
      `packages/markdown/src/index.ts`
- [ ] T008 Implement JSON parsing utilities for category, tag, and site config files in
      `packages/markdown/src/index.ts`
- [ ] T009 Export all public types and functions required by `contracts/markdown-package.md` from
      `packages/markdown/src/index.ts`

**Checkpoint**: Shared package surface is ready for story-specific tests and implementation.

---

## Phase 3: User Story 1 - 파일 기반 콘텐츠 구조 확정 (Priority: P1) MVP

**Goal**: Repository에 글, 작성자, 카테고리, 태그, 사이트 설정 파일을 계약상 위치와 형태로 제공한다.

**Independent Test**: `content/` 파일 구조가 존재하고 샘플 published post가 collection validation을
통과한다.

### Tests for User Story 1

- [ ] T010 [P] [US1] Add fixture structure validation tests for required content files in
      `packages/markdown/src/content-structure.test.ts`
- [ ] T011 [P] [US1] Add successful sample collection validation test in
      `packages/markdown/src/content-collection.test.ts`

### Implementation for User Story 1

- [ ] T012 [P] [US1] Create sample published post file at `content/posts/hello-world.mdx`
- [ ] T013 [P] [US1] Create single-operator author profile at `content/authors/ho.md`
- [ ] T014 [P] [US1] Create category registry at `content/categories.json`
- [ ] T015 [P] [US1] Create tag registry at `content/tags.json`
- [ ] T016 [P] [US1] Create site configuration at `content/site.json`
- [ ] T017 [US1] Implement author, category, tag, and site config schema validation in
      `packages/markdown/src/index.ts`
- [ ] T018 [US1] Implement `validateContentCollection` happy-path assembly for all content file
      types in `packages/markdown/src/index.ts`

**Checkpoint**: User Story 1 is independently functional when the sample `content/` collection
validates successfully.

---

## Phase 4: User Story 2 - 상태별 글 검증 (Priority: P2)

**Goal**: `draft`, `published`, `archived` 상태별 요구사항을 구분하고 공개 가능한 글만 안전하게
인정한다.

**Independent Test**: 상태별 frontmatter와 body fixture를 바꿔 valid/invalid post가 기대한 error
code로 판정되는지 확인한다.

### Tests for User Story 2

- [ ] T019 [P] [US2] Add post status schema tests for valid `draft`, `published`, and `archived`
      cases in `packages/markdown/src/post-validation.test.ts`
- [ ] T020 [P] [US2] Add negative tests for invalid status and missing published fields in
      `packages/markdown/src/post-validation.test.ts`
- [ ] T021 [P] [US2] Add published-only filtering tests in
      `packages/markdown/src/published-posts.test.ts`
- [ ] T022 [P] [US2] Add reference integrity tests for unknown author, category, tag, and
      defaultAuthor in `packages/markdown/src/content-references.test.ts`

### Implementation for User Story 2

- [ ] T023 [US2] Implement discriminated post schemas for `draft`, `published`, and `archived` in
      `packages/markdown/src/index.ts`
- [ ] T024 [US2] Implement required error codes for invalid status, missing title, missing author,
      missing publishedAt, invalid publishedAt, and empty body in `packages/markdown/src/index.ts`
- [ ] T025 [US2] Implement author, category, tag, and defaultAuthor reference checks in
      `packages/markdown/src/index.ts`
- [ ] T026 [US2] Implement `getPublishedPosts` filtering in `packages/markdown/src/index.ts`
- [ ] T027 [US2] Integrate status validation and reference validation into
      `validateContentCollection` in `packages/markdown/src/index.ts`

**Checkpoint**: User Story 2 is independently functional when state validation, reference checks,
and published-only filtering pass.

---

## Phase 5: User Story 3 - 저장 및 발행 전 slug 정책 검증 (Priority: P3)

**Goal**: 제목 기반 slug 후보를 만들고 전체 post 목록 기준 slug 충돌을 거부한다.

**Independent Test**: title-to-slug fixture, unusable title fixture, duplicate slug fixture를 검증해
기대한 success/error code를 확인한다.

### Tests for User Story 3

- [ ] T028 [P] [US3] Add slug candidate generation tests in
      `packages/markdown/src/slug-policy.test.ts`
- [ ] T029 [P] [US3] Add unusable title and duplicate slug failure tests in
      `packages/markdown/src/slug-policy.test.ts`
- [ ] T030 [P] [US3] Add collection-level duplicate published slug tests in
      `packages/markdown/src/content-collection.test.ts`

### Implementation for User Story 3

- [ ] T031 [US3] Implement `createSlugCandidate` with readable URL segment output in
      `packages/markdown/src/index.ts`
- [ ] T032 [US3] Implement `post.slug.unusable-title` validation for empty slug candidate results in
      `packages/markdown/src/index.ts`
- [ ] T033 [US3] Implement `validateUniqueSlug` with `currentPath` exclusion support in
      `packages/markdown/src/index.ts`
- [ ] T034 [US3] Integrate duplicate slug detection into `validateContentCollection` in
      `packages/markdown/src/index.ts`

**Checkpoint**: User Story 3 is independently functional when slug generation and duplicate
detection pass.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: 문서, 검증 command, 전체 workspace 품질을 정리한다.

- [ ] T035 [P] Update `packages/markdown/README.md` with public API usage and content validation
      examples
- [ ] T036 [P] Add implementation completion notes for Phase 1 Content Model in
      `docs/implementation-roadmap.md`
- [ ] T037 Run `pnpm --filter @blog-platform/markdown typecheck` and fix any issues in
      `packages/markdown/src/index.ts`
- [ ] T038 Run `pnpm --filter @blog-platform/markdown lint` and fix any issues in
      `packages/markdown/src/index.ts`
- [ ] T039 Run `pnpm --filter @blog-platform/markdown test` and fix any issues in
      `packages/markdown/src/*.test.ts`
- [ ] T040 Run `pnpm build` and fix any workspace integration issues in `package.json`,
      `turbo.json`, or `packages/markdown/package.json`
- [ ] T041 Verify quickstart scenarios and update `specs/002-content-model/quickstart.md` if the
      runnable commands changed

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies. Can start immediately.
- **Foundational (Phase 2)**: Depends on Setup. Blocks all user story phases.
- **User Story 1 (Phase 3)**: Depends on Foundational. MVP scope.
- **User Story 2 (Phase 4)**: Depends on Foundational and can be implemented after or alongside US1
  once shared schemas exist.
- **User Story 3 (Phase 5)**: Depends on Foundational and can be implemented after or alongside
  US1/US2, but collection-level duplicate checks integrate most cleanly after post validation.
- **Polish (Phase 6)**: Depends on selected user stories being complete.

### User Story Dependencies

- **US1 (P1)**: Requires Setup + Foundational only.
- **US2 (P2)**: Requires Setup + Foundational. Uses the same content collection contract as US1.
- **US3 (P3)**: Requires Setup + Foundational. Integrates with collection validation used by US1 and
  US2.

### Within Each User Story

- Test tasks come before implementation tasks and should fail before implementation.
- File content tasks can run in parallel with story-specific tests when they touch separate files.
- Implementation tasks that modify `packages/markdown/src/index.ts` should be sequenced to avoid
  conflicts.
- Checkpoint validation should run before moving to the next priority story.

### Parallel Opportunities

- T003 and T004 can run in parallel after T001/T002 are understood.
- T006 can run in parallel with T007 and T008 because it creates a separate test fixture file.
- T010 and T011 can run in parallel.
- T012 through T016 can run in parallel because they create distinct content files.
- T019 through T022 can run in parallel.
- T028 through T030 can run in parallel.
- T035 and T036 can run in parallel after story implementation.

---

## Parallel Example: User Story 1

```text
Task: "Add fixture structure validation tests for required content files in packages/markdown/src/content-structure.test.ts"
Task: "Add successful sample collection validation test in packages/markdown/src/content-collection.test.ts"
Task: "Create sample published post file at content/posts/hello-world.mdx"
Task: "Create single-operator author profile at content/authors/ho.md"
Task: "Create category registry at content/categories.json"
Task: "Create tag registry at content/tags.json"
Task: "Create site configuration at content/site.json"
```

## Parallel Example: User Story 2

```text
Task: "Add post status schema tests for valid draft, published, and archived cases in packages/markdown/src/post-validation.test.ts"
Task: "Add published-only filtering tests in packages/markdown/src/published-posts.test.ts"
Task: "Add reference integrity tests for unknown author, category, tag, and defaultAuthor in packages/markdown/src/content-references.test.ts"
```

## Parallel Example: User Story 3

```text
Task: "Add slug candidate generation tests in packages/markdown/src/slug-policy.test.ts"
Task: "Add unusable title and duplicate slug failure tests in packages/markdown/src/slug-policy.test.ts"
Task: "Add collection-level duplicate published slug tests in packages/markdown/src/content-collection.test.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 Setup.
2. Complete Phase 2 Foundational package surface.
3. Complete Phase 3 User Story 1.
4. Stop and validate the sample `content/` collection independently.

### Incremental Delivery

1. Setup + Foundational: shared API and fixtures ready.
2. US1: repository content structure and happy-path validation.
3. US2: state-specific validation and published-only filtering.
4. US3: slug generation and uniqueness policy.
5. Polish: documentation and full quickstart validation.

### Single-Agent Execution Strategy

1. Keep `packages/markdown/src/index.ts` edits sequential.
2. Create tests before implementation inside each story.
3. Run package tests at each checkpoint.
4. Commit after each story or logical phase if the repository remains clean.

## Notes

- `[P]` tasks touch separate files or have no dependency on incomplete tasks.
- `[US1]`, `[US2]`, `[US3]` labels map directly to user stories in `spec.md`.
- Avoid app-level blog/CMS UI work in this feature; those are later roadmap phases.
- Avoid database, object storage, scheduled publishing, multi-author permissions, and AI content
  generation.
