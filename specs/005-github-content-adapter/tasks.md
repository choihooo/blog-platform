# Tasks: GitHub Content Adapter

**Input**: Design documents from `specs/005-github-content-adapter/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`,
`quickstart.md`

**Tests**: 이 feature는 quickstart와 success criteria가 adapter 동작 검증을 요구하므로 user story별
테스트 task를 포함한다.

**Organization**: 사용자 스토리별로 독립 구현과 검증이 가능하도록 task를 구성한다.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 서로 다른 파일을 수정하며 선행 task에 의존하지 않아 병렬 실행 가능
- **[Story]**: user story phase task에만 사용
- 모든 task는 구현 대상 파일 경로를 포함한다

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: CMS adapter 구현을 위한 테스트와 파일 구조를 준비한다.

<!-- prettier-ignore-start -->
- [x] T001 Add CMS test script and Vitest dependency in `apps/cms/package.json`
- [x] T002 Create CMS Vitest configuration in `apps/cms/vitest.config.ts`
- [x] T003 Create adapter skeleton in `apps/cms/lib/content-adapter/index.ts`
- [x] T004 Update CMS lint scope to include adapter source in `apps/cms/package.json`
<!-- prettier-ignore-end -->

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: 모든 user story가 공유하는 contract type, path boundary, commit summary, error model을
구현한다.

**CRITICAL**: 이 phase가 끝나기 전에는 user story 구현을 시작하지 않는다.

<!-- prettier-ignore-start -->
- [x] T005 Define adapter result, file, request, change result, and failure state types in `apps/cms/lib/content-adapter/types.ts`
- [x] T006 [P] Add path boundary tests in `apps/cms/lib/content-adapter/paths.test.ts`
- [x] T007 Implement approved path classification and normalization in `apps/cms/lib/content-adapter/paths.ts`
- [x] T008 [P] Add commit intent summary tests in `apps/cms/lib/content-adapter/commit-intent.test.ts`
- [x] T009 Implement commit summary generation in `apps/cms/lib/content-adapter/commit-intent.ts`
- [x] T010 [P] Add repository error normalization tests in `apps/cms/lib/content-adapter/repository-error.test.ts`
- [x] T011 Implement repository error normalization helpers in `apps/cms/lib/content-adapter/repository-error.ts`
- [x] T012 Export foundational adapter types and helpers from `apps/cms/lib/content-adapter/index.ts`
<!-- prettier-ignore-end -->

**Checkpoint**: Adapter contract foundation is typed, path-safe, and independently testable.

---

## Phase 3: User Story 1 - 콘텐츠 파일 읽기 (Priority: P1) MVP

**Goal**: CMS가 repository sample content를 list/read하고 각 파일의 path, kind, content, size,
SHA-like change identifier를 받을 수 있다.

**Independent Test**: local adapter로 `content/posts/hello-world.mdx`, `content/site.json`,
`content/categories.json`, `content/tags.json`을 읽고 파일 목록과 단일 파일 read result를 확인한다.

### Tests for User Story 1

<!-- prettier-ignore-start -->
- [x] T013 [P] [US1] Add local adapter list/read tests in `apps/cms/lib/content-adapter/local-adapter.read.test.ts`
- [x] T014 [P] [US1] Add content file kind classification tests in `apps/cms/lib/content-adapter/content-kind.test.ts`
<!-- prettier-ignore-end -->

### Implementation for User Story 1

<!-- prettier-ignore-start -->
- [x] T015 [US1] Implement content kind classification in `apps/cms/lib/content-adapter/paths.ts`
- [x] T016 [US1] Implement local adapter listFiles and readFile operations in `apps/cms/lib/content-adapter/local-adapter.ts`
- [x] T017 [US1] Add local adapter factory export in `apps/cms/lib/content-adapter/index.ts`
- [x] T018 [US1] Document local read usage in `specs/005-github-content-adapter/quickstart.md`
<!-- prettier-ignore-end -->

**Checkpoint**: User Story 1 is complete when the CMS local adapter can list and read MVP sample
content without GitHub credentials.

---

## Phase 4: User Story 2 - Draft 저장 및 수정 (Priority: P2)

**Goal**: CMS가 새 draft를 생성하고 기존 draft를 expected SHA로 저장하며 성공 결과와 commit
summary를 받을 수 있다.

**Independent Test**: temp repository fixture에서 createFile과 updateFile을 실행해 새 draft 생성,
기존 draft 수정, duplicate path 거부, 새 SHA 반환을 검증한다.

### Tests for User Story 2

<!-- prettier-ignore-start -->
- [x] T019 [P] [US2] Add local adapter createFile tests in `apps/cms/lib/content-adapter/local-adapter.write.test.ts`
- [x] T020 [P] [US2] Add local adapter updateFile tests in `apps/cms/lib/content-adapter/local-adapter.update.test.ts`
- [x] T021 [P] [US2] Add GitHub adapter create/update mapping tests in `apps/cms/lib/content-adapter/github-adapter.test.ts`
<!-- prettier-ignore-end -->

### Implementation for User Story 2

<!-- prettier-ignore-start -->
- [x] T022 [US2] Implement local adapter createFile in `apps/cms/lib/content-adapter/local-adapter.ts`
- [x] T023 [US2] Implement local adapter updateFile in `apps/cms/lib/content-adapter/local-adapter.ts`
- [x] T024 [US2] Implement GitHub adapter createFile/updateFile mapping in `apps/cms/lib/content-adapter/github-adapter.ts`
- [x] T025 [US2] Add adapter write operation exports in `apps/cms/lib/content-adapter/index.ts`
- [x] T026 [US2] Document draft create/update validation in `specs/005-github-content-adapter/quickstart.md`
<!-- prettier-ignore-end -->

**Checkpoint**: User Story 2 is complete when draft create and save work through the adapter
contract and preserve repository-backed content authority.

---

## Phase 5: User Story 3 - 충돌과 실패 복구 (Priority: P3)

**Goal**: stale SHA, missing file, rate limit, unauthorized, connectivity, validation, delete, and
media failures are normalized without losing submitted content.

**Independent Test**: 오래된 SHA와 실패 fixture로 update/delete/media 작업을 실행해 overwrite가
발생하지 않고 `RepositoryFailureState`가 submitted content를 보존하는지 검증한다.

### Tests for User Story 3

<!-- prettier-ignore-start -->
- [x] T027 [P] [US3] Add stale SHA conflict tests in `apps/cms/lib/content-adapter/local-adapter.conflict.test.ts`
- [x] T028 [P] [US3] Add submitted content preservation tests in `apps/cms/lib/content-adapter/content-preservation.test.ts`
- [x] T029 [P] [US3] Add GitHub adapter error mapping tests in `apps/cms/lib/content-adapter/github-errors.test.ts`
- [x] T030 [P] [US3] Add media path commit tests in `apps/cms/lib/content-adapter/media.test.ts`
<!-- prettier-ignore-end -->

### Implementation for User Story 3

<!-- prettier-ignore-start -->
- [x] T031 [US3] Implement local adapter deleteFile in `apps/cms/lib/content-adapter/local-adapter.ts`
- [x] T032 [US3] Implement local adapter commitMedia in `apps/cms/lib/content-adapter/local-adapter.ts`
- [x] T033 [US3] Implement GitHub adapter deleteFile/commitMedia mapping in `apps/cms/lib/content-adapter/github-adapter.ts`
- [x] T034 [US3] Implement GitHub response error normalization in `apps/cms/lib/content-adapter/github-adapter.ts`
- [x] T035 [US3] Preserve submitted payloads on failed writes in `apps/cms/lib/content-adapter/local-adapter.ts`
- [x] T036 [US3] Export delete, media, and error mapping surfaces from `apps/cms/lib/content-adapter/index.ts`
- [x] T037 [US3] Document conflict, failure, and media recovery validation in `specs/005-github-content-adapter/quickstart.md`
<!-- prettier-ignore-end -->

**Checkpoint**: User Story 3 is complete when stale writes never overwrite newer content and every
failed write returns a recoverable, user-actionable failure state.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: 문서, 검증, scope review를 마무리한다.

<!-- prettier-ignore-start -->
- [x] T038 [P] Update CMS adapter implementation notes in `README.md`
- [x] T039 [P] Update Phase 4 implementation status in `docs/implementation-roadmap.md`
- [x] T040 Run `pnpm --filter @blog-platform/cms typecheck` and fix issues in `apps/cms`
- [x] T041 Run `pnpm --filter @blog-platform/cms lint` and fix issues in `apps/cms`
- [x] T042 Run `pnpm --filter @blog-platform/cms test` and fix issues in `apps/cms`
- [x] T043 Run `pnpm typecheck`, `pnpm lint`, `pnpm test`, and `pnpm build` from `package.json`
- [x] T044 Verify quickstart scenarios in `specs/005-github-content-adapter/quickstart.md`
- [x] T045 Confirm forbidden scope was not introduced in `apps/cms/lib/content-adapter` against `.specify/memory/constitution.md`
<!-- prettier-ignore-end -->

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies. Can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion and blocks all user story phases.
- **User Story 1 (Phase 3)**: Depends on Foundational. MVP scope.
- **User Story 2 (Phase 4)**: Depends on Foundational and can be implemented after US1 for simpler
  integration, but remains contract-testable independently with fixtures.
- **User Story 3 (Phase 5)**: Depends on Foundational and write surfaces from US2 for full coverage.
- **Polish (Phase 6)**: Depends on selected user stories being complete.

### User Story Dependencies

- **US1 콘텐츠 파일 읽기**: No dependency on US2 or US3 after Foundational.
- **US2 Draft 저장 및 수정**: Uses foundational path, type, summary, and error helpers; benefits
  from US1 read operations but tests can use fixtures.
- **US3 충돌과 실패 복구**: Requires write/delete/media surfaces and completes the reliability layer
  around US2 operations.

### Parallel Opportunities

- T006, T008, and T010 can be authored in parallel because they target separate test files.
- T013 and T014 can run in parallel for US1 tests.
- T019, T020, and T021 can run in parallel for US2 tests.
- T027, T028, T029, and T030 can run in parallel for US3 tests.
- T038 and T039 can run in parallel after implementation because they update different documents.

---

## Parallel Example: User Story 1

```text
Task: "Add local adapter list/read tests for posts, config, authors, and media roots in apps/cms/lib/content-adapter/local-adapter.read.test.ts"
Task: "Add content file kind classification tests using sample paths in apps/cms/lib/content-adapter/content-kind.test.ts"
```

## Parallel Example: User Story 2

```text
Task: "Add local adapter createFile tests for draft creation and duplicate path failure in apps/cms/lib/content-adapter/local-adapter.write.test.ts"
Task: "Add local adapter updateFile tests for expected SHA success and missing SHA validation in apps/cms/lib/content-adapter/local-adapter.update.test.ts"
Task: "Add GitHub adapter request mapping tests for create/update payload shape in apps/cms/lib/content-adapter/github-adapter.test.ts"
```

## Parallel Example: User Story 3

```text
Task: "Add stale SHA conflict tests for local update and delete operations in apps/cms/lib/content-adapter/local-adapter.conflict.test.ts"
Task: "Add submitted content preservation tests for failed create/update/media writes in apps/cms/lib/content-adapter/content-preservation.test.ts"
Task: "Add GitHub adapter error mapping tests for unauthorized, missing, conflict, rate-limit, validation, connectivity, and unknown failures in apps/cms/lib/content-adapter/github-errors.test.ts"
Task: "Add media path commit tests for create/update and disallowed media paths in apps/cms/lib/content-adapter/media.test.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 Setup.
2. Complete Phase 2 Foundational adapter contract.
3. Complete Phase 3 User Story 1.
4. Stop and validate local list/read behavior with sample content.

### Incremental Delivery

1. Setup + Foundational establishes the adapter API and safety helpers.
2. US1 proves CMS can read repository-backed content.
3. US2 adds create/update write behavior without changing public blog runtime.
4. US3 adds conflict, failure, delete, and media recovery behavior.
5. Polish validates package and workspace commands and updates docs.

### Scope Guardrails

- Do not add CMS authentication UI or route guards in this feature.
- Do not add rich-text editor UI in this feature.
- Do not add publish/revalidation workflow in this feature.
- Do not add CMS database, object storage, multi-author approval workflow, or public blog GitHub
  credential dependency.
- Keep shared Markdown/content validation in `packages/markdown`; do not duplicate schemas in
  `apps/cms`.

## Notes

- `[P]` tasks modify different files or can be prepared independently.
- Test tasks should be written before their implementation task and should fail before the target
  implementation exists.
- Commit after each phase or logical group.
