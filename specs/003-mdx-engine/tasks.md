# Tasks: Markdown/MDX Engine

**Input**: Design documents from `specs/003-mdx-engine/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md),
[data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: 이 feature는 plan과 success criteria에서 Vitest 검증을 요구하므로 테스트 작업을 포함한다.

**Organization**: 작업은 user story별로 독립 구현과 검증이 가능하도록 구성한다.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 서로 다른 파일을 다루거나 선행 작업 완료 후 독립 실행 가능
- **[Story]**: 사용자 스토리 작업에만 표시 (`US1`, `US2`, `US3`)
- 모든 작업은 실행 대상 파일 경로를 포함한다.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: MDX engine 구현에 필요한 package dependency와 fixture 기반을 준비한다.

- [x] T001 Add MDX engine dependencies to `packages/markdown/package.json`
- [x] T002 Run dependency installation and update `pnpm-lock.yaml`
- [x] T003 [P] Add shared MDX test fixtures in `packages/markdown/src/mdx-fixtures.test.ts`
- [x] T004 [P] Document planned MDX engine public API in `packages/markdown/README.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: 모든 user story가 공유하는 type, result, AST helper 기반을 만든다.

**Critical**: 이 phase가 끝나기 전에는 user story 구현을 시작하지 않는다.

- [x] T005 Extend MDX engine public types in `packages/markdown/src/types.ts`
- [x] T006 Add reusable validation helpers for warning and issue aggregation in
      `packages/markdown/src/result.ts`
- [x] T007 [P] Create MDX AST parsing helper skeleton in `packages/markdown/src/mdx-ast.ts`
- [x] T008 [P] Create frontmatter serialization helper skeleton in
      `packages/markdown/src/frontmatter.ts`
- [x] T009 Export foundational MDX helper types from `packages/markdown/src/index.ts`

**Checkpoint**: package가 새 type과 helper skeleton을 export할 수 있고 user story 구현을 시작할 수
있다.

---

## Phase 3: User Story 1 - 같은 입력에서 일관된 글 변환 (Priority: P1) MVP

**Goal**: MDX file input을 frontmatter, body, shared analysis result로 변환하고 공개 블로그와 CMS
preview가 같은 결과를 사용할 수 있게 한다.

**Independent Test**: 유효한 MDX fixture와 깨진 frontmatter fixture에 `parseMdxDocument`,
`serializeFrontmatter`, `analyzeMdx`를 실행해 metadata/body 분리, round-trip, 실패 code를 검증한다.

### Tests for User Story 1

- [x] T010 [P] [US1] Add frontmatter parse and invalid frontmatter tests in
      `packages/markdown/src/mdx-frontmatter.test.ts`
- [x] T011 [P] [US1] Add frontmatter serialization round-trip tests in
      `packages/markdown/src/frontmatter.test.ts`
- [x] T012 [P] [US1] Add analyzeMdx consistency contract tests in
      `packages/markdown/src/mdx-analysis.test.ts`

### Implementation for User Story 1

- [x] T013 [US1] Implement `parseMdxDocument` in `packages/markdown/src/mdx.ts`
- [x] T014 [US1] Implement `serializeFrontmatter` in `packages/markdown/src/frontmatter.ts`
- [x] T015 [US1] Implement initial `analyzeMdx` orchestration in `packages/markdown/src/mdx.ts`
- [x] T016 [US1] Map frontmatter and syntax failures to required issue codes in
      `packages/markdown/src/mdx.ts`
- [x] T017 [US1] Export `parseMdxDocument`, `serializeFrontmatter`, and `analyzeMdx` from
      `packages/markdown/src/index.ts`
- [x] T018 [US1] Update `packages/markdown/README.md` with US1 usage examples and validation
      commands

**Checkpoint**: User Story 1 is independently testable with
`pnpm --filter @blog-platform/markdown test -- mdx-frontmatter mdx-analysis frontmatter`.

---

## Phase 4: User Story 2 - TOC와 reading time 생성 (Priority: P2)

**Goal**: MDX body에서 heading을 안정적으로 추출하고, TOC와 reading time을 deterministic하게
생성한다.

**Independent Test**: heading depth, duplicate heading, code block 내부 `#`, heading 없는 본문, 반복
실행 fixture로 `extractHeadings`, `generateToc`, `calculateReadingTime` 결과를 검증한다.

### Tests for User Story 2

- [x] T019 [P] [US2] Add heading extraction and duplicate slug tests in
      `packages/markdown/src/headings.test.ts`
- [x] T020 [P] [US2] Add TOC depth and empty TOC tests in `packages/markdown/src/toc.test.ts`
- [x] T021 [P] [US2] Add deterministic reading time tests in
      `packages/markdown/src/reading-time.test.ts`
- [x] T022 [P] [US2] Add analyzeMdx generated metadata integration tests in
      `packages/markdown/src/mdx-generated-metadata.test.ts`

### Implementation for User Story 2

- [x] T023 [US2] Implement `extractHeadings` with MDX AST traversal in
      `packages/markdown/src/headings.ts`
- [x] T024 [US2] Implement `generateToc` depth filtering in `packages/markdown/src/toc.ts`
- [x] T025 [US2] Implement `calculateReadingTime` in `packages/markdown/src/reading-time.ts`
- [x] T026 [US2] Integrate headings, TOC, and reading time into `analyzeMdx` in
      `packages/markdown/src/mdx.ts`
- [x] T027 [US2] Export `extractHeadings`, `generateToc`, and `calculateReadingTime` from
      `packages/markdown/src/index.ts`
- [x] T028 [US2] Update generated metadata examples in `packages/markdown/README.md`

**Checkpoint**: User Story 2 is independently testable with
`pnpm --filter @blog-platform/markdown test -- headings toc reading-time mdx-generated-metadata`.

---

## Phase 5: User Story 3 - 안전하지 않은 MDX 차단 (Priority: P3)

**Goal**: unsafe HTML, script, event handler, import/export, runtime evaluation, unsupported
component를 public/renderable 결과 전에 차단한다.

**Independent Test**: 위험 fixture별로 `validateMdxSafety`와 `analyzeMdx`가 required error code를
반환하고, 허용 Markdown fixture는 성공하는지 검증한다.

### Tests for User Story 3

- [x] T029 [P] [US3] Add script, import/export, and event handler rejection tests in
      `packages/markdown/src/mdx-safety.test.ts`
- [x] T030 [P] [US3] Add unsupported component and unsafe URL tests in
      `packages/markdown/src/mdx-components.test.ts`
- [x] T031 [P] [US3] Add code block fallback and Shiki preparation tests in
      `packages/markdown/src/code-blocks.test.ts`
- [x] T032 [P] [US3] Add analyzeMdx blocking safety integration tests in
      `packages/markdown/src/mdx-safety-integration.test.ts`

### Implementation for User Story 3

- [x] T033 [US3] Implement `validateMdxSafety` AST allowlist checks in
      `packages/markdown/src/mdx-safety.ts`
- [x] T034 [US3] Implement safe URL and HTML attribute validation in
      `packages/markdown/src/mdx-safety.ts`
- [x] T035 [US3] Implement allowed component policy helpers in
      `packages/markdown/src/mdx-components.ts`
- [x] T036 [US3] Implement code block metadata and Shiki fallback preparation in
      `packages/markdown/src/code-blocks.ts`
- [x] T037 [US3] Integrate `validateMdxSafety` and code block warnings into `analyzeMdx` in
      `packages/markdown/src/mdx.ts`
- [x] T038 [US3] Export `validateMdxSafety` and safety policy types from
      `packages/markdown/src/index.ts`
- [x] T039 [US3] Update safety policy and code block usage notes in `packages/markdown/README.md`

**Checkpoint**: User Story 3 is independently testable with
`pnpm --filter @blog-platform/markdown test -- mdx-safety mdx-components code-blocks mdx-safety-integration`.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: 모든 user story 구현 후 문서, quickstart, 전체 workspace 검증을 마무리한다.

- [x] T040 [P] Align package documentation with final API in `packages/markdown/README.md`
- [x] T041 [P] Add release-facing notes for implemented MDX engine scope in
      `specs/003-mdx-engine/quickstart.md`
- [x] T042 Run package validation commands from `specs/003-mdx-engine/quickstart.md`
- [x] T043 Run full workspace validation commands from `specs/003-mdx-engine/quickstart.md`
- [x] T044 Review implementation against `specs/003-mdx-engine/contracts/markdown-mdx-engine.md`
- [x] T045 Review implementation against `specs/003-mdx-engine/contracts/mdx-safety-policy.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Depends on Setup completion and blocks all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational completion
- **User Story 2 (Phase 4)**: Depends on Foundational completion; integrates cleanly after US1
  orchestration exists
- **User Story 3 (Phase 5)**: Depends on Foundational completion; integrates cleanly after US1
  orchestration exists
- **Polish (Phase 6)**: Depends on selected user stories being complete

### User Story Dependencies

- **US1 (P1)**: MVP scope. No dependency on US2 or US3.
- **US2 (P2)**: Can be developed after Foundational; final `analyzeMdx` integration touches
  `packages/markdown/src/mdx.ts` and should be sequenced with US1.
- **US3 (P3)**: Can be developed after Foundational; final safety integration touches
  `packages/markdown/src/mdx.ts` and should be sequenced with US1/US2.

### Within Each User Story

- Test tasks should be written first and fail before implementation.
- Types and skeletons from Foundational phase precede implementation.
- Story-specific implementation precedes exports and README updates.
- Checkpoint validation should pass before moving to the next priority story.

### Parallel Opportunities

- T003 and T004 can run in parallel after T001/T002 are understood.
- T007 and T008 can run in parallel after T005/T006.
- T010, T011, and T012 can run in parallel for US1.
- T019, T020, T021, and T022 can run in parallel for US2.
- T029, T030, T031, and T032 can run in parallel for US3.
- T040 and T041 can run in parallel during polish.

---

## Parallel Example: User Story 1

```bash
Task: "T010 [P] [US1] Add frontmatter parse and invalid frontmatter tests in packages/markdown/src/mdx-frontmatter.test.ts"
Task: "T011 [P] [US1] Add frontmatter serialization round-trip tests in packages/markdown/src/frontmatter.test.ts"
Task: "T012 [P] [US1] Add analyzeMdx consistency contract tests in packages/markdown/src/mdx-analysis.test.ts"
```

## Parallel Example: User Story 2

```bash
Task: "T019 [P] [US2] Add heading extraction and duplicate slug tests in packages/markdown/src/headings.test.ts"
Task: "T020 [P] [US2] Add TOC depth and empty TOC tests in packages/markdown/src/toc.test.ts"
Task: "T021 [P] [US2] Add deterministic reading time tests in packages/markdown/src/reading-time.test.ts"
```

## Parallel Example: User Story 3

```bash
Task: "T029 [P] [US3] Add script, import/export, and event handler rejection tests in packages/markdown/src/mdx-safety.test.ts"
Task: "T030 [P] [US3] Add unsupported component and unsafe URL tests in packages/markdown/src/mdx-components.test.ts"
Task: "T031 [P] [US3] Add code block fallback and Shiki preparation tests in packages/markdown/src/code-blocks.test.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 setup.
2. Complete Phase 2 foundational type/helper skeletons.
3. Complete Phase 3 User Story 1.
4. Validate `parseMdxDocument`, `serializeFrontmatter`, and initial `analyzeMdx` independently.
5. Stop and confirm the shared package contract before adding generated metadata and safety policy.

### Incremental Delivery

1. Setup + Foundational: package can compile with planned MDX API surface.
2. US1: same MDX input produces stable frontmatter/body analysis for blog and CMS preview.
3. US2: generated metadata adds heading, TOC, and reading time.
4. US3: safety policy blocks unsafe MDX and unsupported components.
5. Polish: quickstart validation and contract review confirm readiness for implementation
   completion.

### Parallel Team Strategy

1. Complete Setup and Foundational together.
2. Assign US2 heading/TOC/reading-time tests while US1 implementation stabilizes `analyzeMdx`.
3. Assign US3 safety fixtures and policy tests in parallel.
4. Sequence final edits to `packages/markdown/src/mdx.ts` to avoid merge conflicts.

## Notes

- `[P]` tasks use different files or can run after their explicit prerequisites without blocking
  each other.
- All story tasks include `[US1]`, `[US2]`, or `[US3]` labels for traceability.
- Keep `apps/blog` and `apps/cms` out of this feature unless a later task explicitly changes the
  scope.
- Do not expose MDX runtime evaluation APIs from `packages/markdown`.
