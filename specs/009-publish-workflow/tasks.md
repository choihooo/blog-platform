# Tasks: Publish Workflow

**Input**: Design documents from `specs/009-publish-workflow/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`,
`quickstart.md`

**Tests**: 이 feature는 발행 상태 전환, published 검증, slug 중복 차단, public refresh 실패 분리가
핵심 성공 기준이므로 user story별 테스트 task를 포함한다.

**Organization**: 사용자 스토리별로 독립 구현과 검증이 가능하도록 task를 구성한다.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 서로 다른 파일을 수정하며 선행 task에 의존하지 않아 병렬 실행 가능
- **[Story]**: user story phase task에만 사용
- 모든 task는 구현 대상 파일 경로를 포함한다

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: publish workflow 구현에 필요한 module surface, public route placeholder, test fixture
기반을 준비한다.

<!-- prettier-ignore-start -->
- [ ] T001 Add publish workflow helper exports placeholder to `apps/cms/lib/editor/index.ts`
- [ ] T002 [P] Add publish action exports placeholder beside existing editor actions in `apps/cms/app/actions/editor-actions.ts`
- [ ] T003 [P] Add publish control placeholder exports to `apps/cms/components/editor/index.ts`
- [ ] T004 [P] Ensure public generated-output route files exist for RSS, Sitemap, robots, and OG image in `apps/blog/app/rss.xml/route.ts`, `apps/blog/app/sitemap.xml/route.ts`, `apps/blog/app/robots.txt/route.ts`, and `apps/blog/app/og/[slug]/route.ts`
- [ ] T005 [P] Add publish workflow fixture builders for editor documents, adapter results, and public refresh targets in `apps/cms/lib/editor/publish-workflow.test.ts`
<!-- prettier-ignore-end -->

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: 모든 user story가 공유하는 발행 상태 모델, slug/published 검증, public refresh target
계산, action result mapping을 구현한다.

**CRITICAL**: 이 phase가 끝나기 전에는 user story 구현을 시작하지 않는다.

<!-- prettier-ignore-start -->
- [ ] T006 [P] Add slug policy tests for title-based slug generation, empty title rejection, self-exclusion, and duplicate slug detection in `packages/markdown/src/slug-policy.test.ts`
- [ ] T007 Implement shared slug policy helpers for publish workflow in `packages/markdown/src/slug-policy.ts`
- [ ] T008 Export slug policy helpers from `packages/markdown/src/index.ts`
- [ ] T009 [P] Add publish workflow unit tests for publish/unpublish/archive state transitions, publishedAt preservation, MDX serialization failure, and repository intent selection in `apps/cms/lib/editor/publish-workflow.test.ts`
- [ ] T010 Implement publish workflow types, state transition helpers, repository intent mapping, and common result shapes in `apps/cms/lib/editor/publish-workflow.ts`
- [ ] T011 [P] Add public refresh target tests for previous/next slug, category, tag, default routes, duplicate removal, and save-draft exclusion in `apps/cms/lib/editor/public-refresh.test.ts`
- [ ] T012 Implement public refresh target expansion, retry token creation, and refresh result mapping in `apps/cms/lib/editor/public-refresh.ts`
- [ ] T013 [P] Add protected publish action auth mapping tests for auth-required, forbidden, session-expired, stale-file, and temporary-connectivity states in `apps/cms/app/actions/editor-actions.test.ts`
- [ ] T014 Extend protected editor action adapter wrappers for create/update access reuse across save, publish, unpublish, and archive in `apps/cms/app/actions/editor-actions.ts`
- [ ] T015 [P] Add generated output route tests for published-only RSS, Sitemap, robots, and OG behavior in `apps/blog/app/generated-output-routes.test.ts`
- [ ] T016 Implement minimal generated output route handlers backed by published-only content selection in `apps/blog/app/rss.xml/route.ts`, `apps/blog/app/sitemap.xml/route.ts`, `apps/blog/app/robots.txt/route.ts`, and `apps/blog/app/og/[slug]/route.ts`
<!-- prettier-ignore-end -->

**Checkpoint**: Publish workflow core validation, repository intent mapping, public refresh target
calculation, auth failure mapping, and generated public route boundaries are typed, tested, and
available for user story implementation.

---

## Phase 3: User Story 1 - 글 저장과 발행 (Priority: P1) MVP

**Goal**: 인증된 관리자가 CMS editor에서 글을 저장하고 Publish 버튼으로 공개 상태로 전환한 뒤 공개
블로그에서 확인할 수 있다.

**Independent Test**: 관리자 계정으로 초안을 열고 저장 후 발행을 실행한다. 발행 성공 후 글 상태,
발행일, slug, 공개 목록 및 상세 페이지 노출이 기대대로 바뀌는지 확인한다.

### Tests for User Story 1

<!-- prettier-ignore-start -->
- [ ] T017 [P] [US1] Add publish action success tests for slug generation, publishedAt auto-fill, existing publishedAt preservation, `prepare-publish` intent, and public refresh success in `apps/cms/app/actions/editor-actions.test.ts`
- [ ] T018 [P] [US1] Add publish workflow validation tests for missing title, missing author, empty body, unsupported MDX, and duplicate slug blocking in `apps/cms/lib/editor/publish-workflow.test.ts`
- [ ] T019 [P] [US1] Add editor toolbar tests for visible Save and Publish controls, disabled publish when title is missing, and pending publish state in `apps/cms/components/editor/editor-toolbar.test.tsx`
- [ ] T020 [P] [US1] Add editor screen publish flow tests proving status update, backup clearing, success messaging, and public refresh success display in `apps/cms/components/editor/editor-publish-flow.test.tsx`
- [ ] T021 [P] [US1] Add public blog smoke tests proving a newly published post appears on home and detail routes while draft posts remain hidden in `apps/blog/app/public-publish-flow.test.tsx`
<!-- prettier-ignore-end -->

### Implementation for User Story 1

<!-- prettier-ignore-start -->
- [ ] T022 [US1] Implement publish document preparation with status, slug, publishedAt, updatedAt, and published validation in `apps/cms/lib/editor/publish-workflow.ts`
- [ ] T023 [US1] Implement duplicate slug lookup using repository post files and markdown slug policy helpers in `apps/cms/lib/editor/publish-workflow.ts`
- [ ] T024 [US1] Implement `publishPostAction` with protected adapter access, `prepare-publish` update/create behavior, and public refresh invocation in `apps/cms/app/actions/editor-actions.ts`
- [ ] T025 [P] [US1] Implement publish status display states for pending, published, validation failure, and refresh success in `apps/cms/components/editor/save-status.tsx`
- [ ] T026 [US1] Add Publish button wiring and accessible pending state to the editor toolbar in `apps/cms/components/editor/editor-toolbar.tsx`
- [ ] T027 [US1] Integrate publish action result handling, document state update, local backup clearing, and success messaging in `apps/cms/components/editor/editor-screen.tsx`
- [ ] T028 [US1] Ensure published-only public blog content selection reflects newly published local content in `apps/blog/lib/content.ts`
<!-- prettier-ignore-end -->

**Checkpoint**: User Story 1 is complete when an authorized admin can save a draft, publish it with
generated slug and `publishedAt`, see repository/public refresh success, and view the post on public
home and detail routes.

---

## Phase 4: User Story 2 - 발행 취소와 보관 (Priority: P2)

**Goal**: 인증된 관리자가 발행된 글을 Unpublish 또는 Archive로 공개 노출에서 제거하고, 공개 목록과
자동 공개 산출물에서 제외되는 것을 확인할 수 있다.

**Independent Test**: 발행된 글에 대해 Unpublish와 Archive를 각각 실행하고, 공개 목록, 상세 페이지,
RSS, Sitemap에서 제외되는지 확인한다.

### Tests for User Story 2

<!-- prettier-ignore-start -->
- [ ] T029 [P] [US2] Add unpublish action tests for `prepare-unpublish` intent, draft status result, publishedAt preservation, and public refresh target calculation in `apps/cms/app/actions/editor-actions.test.ts`
- [ ] T030 [P] [US2] Add archive action tests for `prepare-archive` intent, archived status result, repository file preservation, and public refresh target calculation in `apps/cms/app/actions/editor-actions.test.ts`
- [ ] T031 [P] [US2] Add publish workflow transition tests for published-to-draft, published-to-archived, archived-to-published revalidation requirements, and invalid state guards in `apps/cms/lib/editor/publish-workflow.test.ts`
- [ ] T032 [P] [US2] Add editor screen unpublish/archive flow tests proving controls, confirmation messaging, state updates, and public removal status in `apps/cms/components/editor/editor-publication-state-flow.test.tsx`
- [ ] T033 [P] [US2] Add public generated output removal tests proving unpublished and archived posts disappear from RSS, Sitemap, home, detail, category, and tag surfaces in `apps/blog/app/generated-output-routes.test.ts`
<!-- prettier-ignore-end -->

### Implementation for User Story 2

<!-- prettier-ignore-start -->
- [ ] T034 [US2] Implement unpublish document preparation and `prepare-unpublish` repository update behavior in `apps/cms/lib/editor/publish-workflow.ts`
- [ ] T035 [US2] Implement archive document preparation and `prepare-archive` repository update behavior in `apps/cms/lib/editor/publish-workflow.ts`
- [ ] T036 [US2] Implement `unpublishPostAction` and `archivePostAction` with protected adapter access and public refresh invocation in `apps/cms/app/actions/editor-actions.ts`
- [ ] T037 [P] [US2] Add Unpublish and Archive controls with state-aware disabling to `apps/cms/components/editor/editor-toolbar.tsx`
- [ ] T038 [US2] Integrate unpublish/archive action result handling, document state update, public removal messaging, and backup behavior in `apps/cms/components/editor/editor-screen.tsx`
- [ ] T039 [US2] Ensure public blog home, detail, category, tag, RSS, Sitemap, robots, and OG routes exclude `draft` and `archived` content in `apps/blog/lib/content.ts` and `apps/blog/app/generated-output-routes.test.ts`
<!-- prettier-ignore-end -->

**Checkpoint**: User Story 2 is complete when an authorized admin can unpublish or archive a
published post, keep the repository file, and verify the post disappears from public routes and
generated public outputs.

---

## Phase 5: User Story 3 - 실패 분리와 재시도 (Priority: P3)

**Goal**: 검증 실패, 중복 slug, 저장소 충돌, 권한 실패, public refresh 실패를 구분해 표시하고,
repository 변경 성공 후 public refresh만 재시도할 수 있다.

**Independent Test**: 검증 실패, 중복 slug, 저장소 충돌, 공개 반영 실패를 각각 재현하고 CMS가 상태와
재시도 동작을 구분해 표시하는지 확인한다.

### Tests for User Story 3

<!-- prettier-ignore-start -->
- [ ] T040 [P] [US3] Add publish action failure tests for validation-failure, duplicate-slug, stale-file, temporary-connectivity, auth-required, forbidden, and session-expired results in `apps/cms/app/actions/editor-actions.test.ts`
- [ ] T041 [P] [US3] Add public refresh failure tests for partial success, failed target reporting, retry token creation, retry success, and retry failure in `apps/cms/lib/editor/public-refresh.test.ts`
- [ ] T042 [P] [US3] Add retry public refresh action tests proving repository commit is not repeated and auth guard is enforced in `apps/cms/app/actions/editor-actions.test.ts`
- [ ] T043 [P] [US3] Add editor failure flow tests proving current edits remain, submitted source is preserved, local backup remains, and retry refresh UI appears only for partial success in `apps/cms/components/editor/editor-publish-failure-flow.test.tsx`
- [ ] T044 [P] [US3] Add recovery banner tests for stale-file, validation failure, duplicate slug, public-refresh-failed, and retry actions in `apps/cms/components/editor/recovery-banner.test.tsx`
<!-- prettier-ignore-end -->

### Implementation for User Story 3

<!-- prettier-ignore-start -->
- [ ] T045 [US3] Map repository, validation, duplicate slug, auth, rate-limit, connectivity, and unknown failures to publish workflow result codes in `apps/cms/lib/editor/publish-workflow.ts`
- [ ] T046 [US3] Harden publish/unpublish/archive action failure paths so repository failure never triggers public refresh in `apps/cms/app/actions/editor-actions.ts`
- [ ] T047 [US3] Implement public refresh execution failure mapping, partial success result, and retry token handling in `apps/cms/lib/editor/public-refresh.ts`
- [ ] T048 [US3] Implement `retryPublicRefreshAction` with protected auth guard and no repository rewrite in `apps/cms/app/actions/editor-actions.ts`
- [ ] T049 [US3] Add partial success, retry, stale-file, duplicate slug, and validation failure messaging to `apps/cms/components/editor/recovery-banner.tsx`
- [ ] T050 [US3] Integrate publish failure handling, local backup preservation, submitted document restore, and retry public refresh callback in `apps/cms/components/editor/editor-screen.tsx`
<!-- prettier-ignore-end -->

**Checkpoint**: User Story 3 is complete when invalid publish attempts make no repository change,
repository failures preserve the editor state, public refresh failure is shown separately from
commit success, and retry refresh does not create a second content commit.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: 문서, 검증, scope review를 마무리한다.

<!-- prettier-ignore-start -->
- [ ] T051 [P] Update Publish Workflow implementation notes and validation status in `specs/009-publish-workflow/quickstart.md`
- [ ] T052 [P] Update Phase 8 implementation status in `docs/implementation-roadmap.md`
- [ ] T053 [P] Update CMS publish workflow notes in `apps/cms/README.md`
- [ ] T054 [P] Update public generated output notes in `apps/blog/README.md`
- [ ] T055 Run `pnpm --filter @blog-platform/markdown typecheck`, `pnpm --filter @blog-platform/markdown lint`, and `pnpm --filter @blog-platform/markdown test` and fix issues in `packages/markdown`
- [ ] T056 Run `pnpm --filter @blog-platform/editor typecheck`, `pnpm --filter @blog-platform/editor lint`, and `pnpm --filter @blog-platform/editor test` and fix issues in `packages/editor`
- [ ] T057 Run `pnpm --filter @blog-platform/cms typecheck`, `pnpm --filter @blog-platform/cms lint`, and `pnpm --filter @blog-platform/cms test` and fix issues in `apps/cms`
- [ ] T058 Run `pnpm --filter @blog-platform/blog typecheck`, `pnpm --filter @blog-platform/blog lint`, and `pnpm --filter @blog-platform/blog build` and fix issues in `apps/blog`
- [ ] T059 Run `pnpm typecheck`, `pnpm lint`, `pnpm test`, and `pnpm build` from `package.json`
- [ ] T060 Verify quickstart scenarios in `specs/009-publish-workflow/quickstart.md`
- [ ] T061 Confirm no forbidden scope was introduced against `.specify/memory/constitution.md`
- [ ] T062 Confirm no CMS database, RSS/Sitemap file commit, scheduled publishing, approval workflow, SEO scoring implementation, analytics dashboard, AI generation, object storage, or multi-author permission system was introduced in `apps/cms`, `apps/blog`, `packages/markdown`, and `packages/editor`
<!-- prettier-ignore-end -->

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies. Can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion and blocks all user story phases.
- **User Story 1 (Phase 3)**: Depends on Foundational. MVP scope.
- **User Story 2 (Phase 4)**: Depends on Foundational and can be implemented after US1 action/UI
  patterns exist, but its state transition tests remain independently verifiable.
- **User Story 3 (Phase 5)**: Depends on Foundational and integrates with US1/US2 success paths so
  failure and retry behavior can be proven.
- **Polish (Phase 6)**: Depends on selected user stories being complete.

### User Story Dependencies

- **US1 글 저장과 발행**: Requires foundational slug policy, publish workflow helpers, protected
  action wrapper, and public refresh target helpers; no dependency on unpublish/archive.
- **US2 발행 취소와 보관**: Requires foundational state transition and public refresh helpers; can
  share publish controls but remains independently testable with published fixtures.
- **US3 실패 분리와 재시도**: Requires publish/unpublish/archive success paths to exist so partial
  success and retry behavior can be verified.

### Parallel Opportunities

- T002, T003, T004, and T005 can run in parallel because they update separate files or route groups.
- T006, T009, T011, T013, and T015 can be authored in parallel as tests for separate modules.
- T017, T018, T019, T020, and T021 can run in parallel for US1 tests.
- T025 and T026 can run in parallel after T024 establishes the publish action result shape.
- T029, T030, T031, T032, and T033 can run in parallel for US2 tests.
- T037 can run in parallel with T034/T035 after control props are agreed.
- T040, T041, T042, T043, and T044 can run in parallel for US3 failure tests.
- T051, T052, T053, and T054 can run in parallel after implementation because they update different
  documents.

---

## Parallel Example: User Story 1

```text
Task: "Add publish action success tests for slug generation, publishedAt auto-fill, existing publishedAt preservation, prepare-publish intent, and public refresh success in apps/cms/app/actions/editor-actions.test.ts"
Task: "Add publish workflow validation tests for missing title, missing author, empty body, unsupported MDX, and duplicate slug blocking in apps/cms/lib/editor/publish-workflow.test.ts"
Task: "Add editor toolbar tests for visible Save and Publish controls, disabled publish when title is missing, and pending publish state in apps/cms/components/editor/editor-toolbar.test.tsx"
Task: "Add editor screen publish flow tests proving status update, backup clearing, success messaging, and public refresh success display in apps/cms/components/editor/editor-publish-flow.test.tsx"
Task: "Add public blog smoke tests proving a newly published post appears on home and detail routes while draft posts remain hidden in apps/blog/app/public-publish-flow.test.tsx"
```

## Parallel Example: User Story 2

```text
Task: "Add unpublish action tests for prepare-unpublish intent, draft status result, publishedAt preservation, and public refresh target calculation in apps/cms/app/actions/editor-actions.test.ts"
Task: "Add archive action tests for prepare-archive intent, archived status result, repository file preservation, and public refresh target calculation in apps/cms/app/actions/editor-actions.test.ts"
Task: "Add publish workflow transition tests for published-to-draft, published-to-archived, archived-to-published revalidation requirements, and invalid state guards in apps/cms/lib/editor/publish-workflow.test.ts"
Task: "Add editor screen unpublish/archive flow tests proving controls, confirmation messaging, state updates, and public removal status in apps/cms/components/editor/editor-publication-state-flow.test.tsx"
Task: "Add public generated output removal tests proving unpublished and archived posts disappear from RSS, Sitemap, home, detail, category, and tag surfaces in apps/blog/app/generated-output-routes.test.ts"
```

## Parallel Example: User Story 3

```text
Task: "Add publish action failure tests for validation-failure, duplicate-slug, stale-file, temporary-connectivity, auth-required, forbidden, and session-expired results in apps/cms/app/actions/editor-actions.test.ts"
Task: "Add public refresh failure tests for partial success, failed target reporting, retry token creation, retry success, and retry failure in apps/cms/lib/editor/public-refresh.test.ts"
Task: "Add retry public refresh action tests proving repository commit is not repeated and auth guard is enforced in apps/cms/app/actions/editor-actions.test.ts"
Task: "Add editor failure flow tests proving current edits remain, submitted source is preserved, local backup remains, and retry refresh UI appears only for partial success in apps/cms/components/editor/editor-publish-failure-flow.test.tsx"
Task: "Add recovery banner tests for stale-file, validation failure, duplicate slug, public-refresh-failed, and retry actions in apps/cms/components/editor/recovery-banner.test.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Stop and validate draft save plus publish independently with `quickstart.md` Scenarios 1 and 2

### Incremental Delivery

1. Complete Setup + Foundational
2. Add User Story 1 and validate save/publish
3. Add User Story 2 and validate unpublish/archive
4. Add User Story 3 and validate failure separation/retry
5. Run full validation from `quickstart.md`

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 publish flow
   - Developer B: User Story 2 unpublish/archive flow
   - Developer C: User Story 3 failure and retry flow
3. Stories complete and integrate independently, then run final validation

---

## Notes

- [P] tasks = different files, no dependency on incomplete same-phase implementation
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Write story tests first and confirm they fail before implementation
- Commit after each task or logical group
- Stop at each checkpoint to validate story independently
- Avoid adding CMS database, generated-output file commits, scheduled publishing, approval workflow,
  SEO scoring implementation, analytics dashboard, AI generation, object storage, or multi-author
  permissions
