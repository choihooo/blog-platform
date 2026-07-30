# Tasks: CMS Editor

**Input**: Design documents from `specs/007-cms-editor/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`,
`quickstart.md`

**Tests**: 이 feature는 editor document round-trip, 저장/충돌/복구, 인증 실패 보존이 핵심 성공
기준이므로 user story별 테스트 task를 포함한다.

**Organization**: 사용자 스토리별로 독립 구현과 검증이 가능하도록 task를 구성한다.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 서로 다른 파일을 수정하며 선행 task에 의존하지 않아 병렬 실행 가능
- **[Story]**: user story phase task에만 사용
- 모든 task는 구현 대상 파일 경로를 포함한다

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: CMS editor 구현에 필요한 dependency, package script, 디렉터리와 barrel 파일을 준비한다.

<!-- prettier-ignore-start -->
- [ ] T001 Add Tiptap, ProseMirror markdown, lowlight, and editor test dependencies to `packages/editor/package.json`
- [ ] T002 Add `test` script and Vitest dependency for editor package validation in `packages/editor/package.json`
- [ ] T003 Add CMS editor route/component test dependencies if missing in `apps/cms/package.json`
- [ ] T004 Create editor package test config in `packages/editor/vitest.config.ts`
- [ ] T005 Create editor package module barrel in `packages/editor/src/index.ts`
- [ ] T006 Create CMS editor component barrel in `apps/cms/components/editor/index.ts`
- [ ] T007 Create CMS editor lib barrel in `apps/cms/lib/editor/index.ts`
<!-- prettier-ignore-end -->

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: 모든 user story가 공유하는 editor document model, supported format, validation, MDX
변환, preview analysis, save mapping 기반을 구현한다.

**CRITICAL**: 이 phase가 끝나기 전에는 user story 구현을 시작하지 않는다.

<!-- prettier-ignore-start -->
- [ ] T008 [P] Add editor document contract tests for empty draft, metadata defaults, dirty state, and supported formats in `packages/editor/src/document.test.ts`
- [ ] T009 Implement `EditorDocument`, `EditorFrontmatter`, `EditorNode`, and empty draft factory in `packages/editor/src/document.ts`
- [ ] T010 [P] Add supported format tests for paragraph, heading, lists, quote, rule, link, image reference, inline code, code block, bold, and italic in `packages/editor/src/supported-format.test.ts`
- [ ] T011 Implement supported block, mark, toolbar command, and availability helpers in `packages/editor/src/supported-format.ts`
- [ ] T012 [P] Add editor validation tests for empty title, unsafe links, blob/data image refs, unsupported nodes, and invalid status transitions in `packages/editor/src/validation.test.ts`
- [ ] T013 Implement editor document validation and issue types in `packages/editor/src/validation.ts`
- [ ] T014 [P] Add MDX-to-editor blocked state tests for import/export, JSX, unsafe HTML, event handlers, runtime expressions, and invalid frontmatter in `packages/editor/src/mdx-to-editor.test.ts`
- [ ] T015 Implement MDX-to-editor parsing and unsupported MDX detection using markdown safety helpers in `packages/editor/src/mdx-to-editor.ts`
- [ ] T016 [P] Add editor-to-MDX serialization tests for frontmatter preservation, supported blocks, safe links, image references, and code fences in `packages/editor/src/editor-to-mdx.test.ts`
- [ ] T017 Implement editor-to-MDX serialization and frontmatter merging in `packages/editor/src/editor-to-mdx.ts`
- [ ] T018 [P] Add editor preview analysis tests for headings, code blocks, links, image references, and safety warnings in `packages/editor/src/preview.test.ts`
- [ ] T019 Implement editor preview analysis wrapper around markdown package behavior in `packages/editor/src/preview.ts`
- [ ] T020 Export editor document, validation, conversion, supported format, and preview APIs from `packages/editor/src/index.ts`
- [ ] T021 [P] Add save result mapping tests for validation, unsupported MDX, auth-required, forbidden, session-expired, stale-file, temporary-connectivity, and unknown results in `apps/cms/lib/editor/editor-save.test.ts`
- [ ] T022 Implement CMS editor save result mapping helpers in `apps/cms/lib/editor/editor-save.ts`
<!-- prettier-ignore-end -->

**Checkpoint**: Editor document, supported format, MDX round-trip, preview analysis, and save
mapping APIs are typed, tested, and available for user story implementation.

---

## Phase 3: User Story 1 - 글 작성 및 편집 (Priority: P1) MVP

**Goal**: 인증된 관리자가 새 초안을 만들거나 기존 글을 열어 제목, 본문, 기본 metadata와 지원 서식을
시각적으로 편집할 수 있다.

**Independent Test**: 관리자 계정으로 CMS에 로그인한 뒤 새 초안을 만들고 제목, 단락, heading, 목록,
인용문, 코드 블록, 링크를 입력해 저장 가능한 편집 상태가 되는지 확인한다.

### Tests for User Story 1

<!-- prettier-ignore-start -->
- [ ] T023 [P] [US1] Add CMS posts list route tests for authorized post summaries, new draft action, protected access, and no publish/media controls in `apps/cms/app/posts/page.test.tsx`
- [ ] T024 [P] [US1] Add new editor route tests for authorized empty draft screen, title input, toolbar visibility, preview area, and protected access in `apps/cms/app/posts/new/page.test.tsx`
- [ ] T025 [P] [US1] Add existing editor route tests for loading repository post content, unsupported state, and protected access in `apps/cms/app/posts/[slug]/page.test.tsx`
- [ ] T026 [P] [US1] Add editor screen rendering tests for title editing, body editing, dirty state, toolbar commands, frontmatter panel, and preview panel in `apps/cms/components/editor/editor-screen.test.tsx`
- [ ] T027 [P] [US1] Add editor loader tests for listing posts, creating empty documents, loading existing files, and unsupported MDX handling in `apps/cms/lib/editor/editor-loader.test.ts`
<!-- prettier-ignore-end -->

### Implementation for User Story 1

<!-- prettier-ignore-start -->
- [ ] T028 [US1] Implement CMS editor loader for post summaries, empty draft documents, existing post documents, and unsupported states in `apps/cms/lib/editor/editor-loader.ts`
- [ ] T029 [P] [US1] Implement editor toolbar component with lucide icon buttons and supported command states in `apps/cms/components/editor/editor-toolbar.tsx`
- [ ] T030 [P] [US1] Implement frontmatter panel component for title, excerpt, category, tags, author, slug display, status, and existing cover image path in `apps/cms/components/editor/frontmatter-panel.tsx`
- [ ] T031 [P] [US1] Implement save status component for clean, dirty, pending, saved, validation, unsupported, and failed states in `apps/cms/components/editor/save-status.tsx`
- [ ] T032 [P] [US1] Implement editor preview panel using editor preview analysis output in `apps/cms/components/editor/preview-panel.tsx`
- [ ] T033 [US1] Implement composed editor screen with title editing, body editor surface, toolbar, frontmatter panel, preview panel, and dirty state in `apps/cms/components/editor/editor-screen.tsx`
- [ ] T034 [US1] Replace posts readiness page with protected posts list and new draft action in `apps/cms/app/posts/page.tsx`
- [ ] T035 [US1] Implement protected new draft editor route in `apps/cms/app/posts/new/page.tsx`
- [ ] T036 [US1] Implement protected existing post editor route with unsupported MDX state in `apps/cms/app/posts/[slug]/page.tsx`
- [ ] T037 [US1] Export CMS editor components from `apps/cms/components/editor/index.ts`
- [ ] T038 [US1] Export CMS editor loader APIs from `apps/cms/lib/editor/index.ts`
<!-- prettier-ignore-end -->

**Checkpoint**: User Story 1 is complete when an authorized admin can open `/posts`, create a new
draft editor screen, open an existing supported post, edit supported content, see dirty state and
preview, and no media upload or publish workflow appears.

---

## Phase 4: User Story 2 - MDX 저장 형식 보존 (Priority: P2)

**Goal**: 지원되는 편집 문서가 repository-compatible MDX로 저장되고, 다시 열었을 때 같은 의미의 편집
문서로 복원된다.

**Independent Test**: 지원되는 블록과 inline 서식이 포함된 글을 편집해 저장 가능한 MDX로 변환한 뒤
같은 글을 다시 열어 구조와 metadata가 유지되는지 확인한다.

### Tests for User Story 2

<!-- prettier-ignore-start -->
- [ ] T039 [P] [US2] Add round-trip fixture tests for paragraph, heading, lists, blockquote, horizontal rule, link, image reference, inline code, code block, bold, and italic in `packages/editor/src/roundtrip.test.ts`
- [ ] T040 [P] [US2] Add editor save action tests for create draft, save draft, expected SHA, serialized MDX, and submitted content preservation in `apps/cms/app/actions/editor-actions.test.ts`
- [ ] T041 [P] [US2] Add protected editor save integration tests proving unauthorized states do not call adapter writes in `apps/cms/lib/editor/protected-editor-save.test.ts`
- [ ] T042 [P] [US2] Add editor screen save interaction tests for successful save, validation failure, unsupported MDX block, and clean saved state in `apps/cms/components/editor/editor-save-flow.test.tsx`
<!-- prettier-ignore-end -->

### Implementation for User Story 2

<!-- prettier-ignore-start -->
- [ ] T043 [US2] Implement round-trip fixture coverage and fixture helpers for supported editor content in `packages/editor/src/roundtrip.ts`
- [ ] T044 [US2] Implement protected editor save server action for create-draft and save-draft intents in `apps/cms/app/actions/editor-actions.ts`
- [ ] T045 [US2] Integrate protected content operations, expected SHA, create/update intent selection, and adapter failure mapping in `apps/cms/lib/editor/editor-save.ts`
- [ ] T046 [US2] Wire editor screen save submission to server action and saved SHA state in `apps/cms/components/editor/editor-screen.tsx`
- [ ] T047 [US2] Update existing post editor route to reload saved MDX with latest SHA after successful save in `apps/cms/app/posts/[slug]/page.tsx`
- [ ] T048 [US2] Update new draft editor route to transition from temporary draft id to saved repository path after create success in `apps/cms/app/posts/new/page.tsx`
- [ ] T049 [US2] Document editor MDX round-trip implementation notes in `packages/editor/README.md`
<!-- prettier-ignore-end -->

**Checkpoint**: User Story 2 is complete when supported content round-trips through editor document
and MDX, save operations use protected repository writes, and unsupported or invalid input is
blocked without silent content loss.

---

## Phase 5: User Story 3 - 변경 손실 방지와 복구 (Priority: P3)

**Goal**: 저장 전 새로고침, 저장 실패, 세션 만료, 권한 실패, repository 충돌 상황에서도 현재 편집
내용이 보존되고 운영자가 복구 또는 재시도를 판단할 수 있다.

**Independent Test**: 글을 수정한 뒤 저장하지 않고 새로고침하거나 저장 실패와 충돌 상태를 재현해,
운영자가 복구 안내와 현재 변경 내용을 확인할 수 있는지 검증한다.

### Tests for User Story 3

<!-- prettier-ignore-start -->
- [ ] T050 [P] [US3] Add draft backup tests for key generation, 30 day TTL, expired cleanup, restore candidate detection, and save cleanup in `apps/cms/lib/editor/draft-backup.test.ts`
- [ ] T051 [P] [US3] Add recovery banner rendering tests for restore, discard, stale backup, session-expired, auth-required, and conflict states in `apps/cms/components/editor/recovery-banner.test.tsx`
- [ ] T052 [P] [US3] Add editor failure flow tests for stale-file, temporary-connectivity, forbidden, session-expired, and unknown adapter failures in `apps/cms/components/editor/editor-failure-flow.test.tsx`
- [ ] T053 [P] [US3] Add editor save conflict tests proving stale SHA keeps submitted document and does not overwrite repository content in `apps/cms/lib/editor/editor-conflict.test.ts`
<!-- prettier-ignore-end -->

### Implementation for User Story 3

<!-- prettier-ignore-start -->
- [ ] T054 [US3] Implement local draft backup storage, TTL handling, restore candidate detection, and cleanup helpers in `apps/cms/lib/editor/draft-backup.ts`
- [ ] T055 [P] [US3] Implement recovery banner component for local backup restore/discard, auth recovery, save retry, and conflict states in `apps/cms/components/editor/recovery-banner.tsx`
- [ ] T056 [US3] Integrate draft backup persistence, restore/discard actions, and successful save cleanup into `apps/cms/components/editor/editor-screen.tsx`
- [ ] T057 [US3] Extend editor save mapping to preserve submitted document/source for stale-file, connectivity, auth, forbidden, and unknown failures in `apps/cms/lib/editor/editor-save.ts`
- [ ] T058 [US3] Wire stale-file conflict messaging and non-overwrite behavior into save server action in `apps/cms/app/actions/editor-actions.ts`
- [ ] T059 [US3] Update editor routes to surface backup restore candidates before replacing the current editor view in `apps/cms/app/posts/[slug]/page.tsx` and `apps/cms/app/posts/new/page.tsx`
- [ ] T060 [US3] Export draft backup helpers from `apps/cms/lib/editor/index.ts`
<!-- prettier-ignore-end -->

**Checkpoint**: User Story 3 is complete when dirty editor content survives refresh, failed saves
preserve the submitted document, stale writes do not overwrite repository content, and auth/session
failures keep a recovery path.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: 문서, 검증, scope review를 마무리한다.

<!-- prettier-ignore-start -->
- [ ] T061 [P] Update CMS editor implementation notes in `README.md`
- [ ] T062 [P] Update Phase 6 implementation status in `docs/implementation-roadmap.md`
- [ ] T063 [P] Update CMS editor validation notes in `specs/007-cms-editor/quickstart.md`
- [ ] T064 Run `pnpm --filter @blog-platform/editor typecheck` and fix issues in `packages/editor`
- [ ] T065 Run `pnpm --filter @blog-platform/editor lint` and fix issues in `packages/editor`
- [ ] T066 Run `pnpm --filter @blog-platform/editor test` and fix issues in `packages/editor`
- [ ] T067 Run `pnpm --filter @blog-platform/markdown typecheck`, `lint`, and `test` and fix issues in `packages/markdown`
- [ ] T068 Run `pnpm --filter @blog-platform/design-system typecheck` and `lint` and fix issues in `packages/design-system`
- [ ] T069 Run `pnpm --filter @blog-platform/cms typecheck` and fix issues in `apps/cms`
- [ ] T070 Run `pnpm --filter @blog-platform/cms lint` and fix issues in `apps/cms`
- [ ] T071 Run `pnpm --filter @blog-platform/cms test` and fix issues in `apps/cms`
- [ ] T072 Run `pnpm typecheck`, `pnpm lint`, `pnpm test`, and `pnpm build` from `package.json`
- [ ] T073 Verify quickstart scenarios in `specs/007-cms-editor/quickstart.md`
- [ ] T074 Confirm no forbidden scope was introduced against `.specify/memory/constitution.md`
- [ ] T075 Confirm no media upload, publish/revalidation, SEO scoring, analytics dashboard, AI generation, custom hex palette, or nested-card editor layout was introduced in `apps/cms`, `packages/editor`, and `packages/design-system`
<!-- prettier-ignore-end -->

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies. Can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion and blocks all user story phases.
- **User Story 1 (Phase 3)**: Depends on Foundational. MVP scope.
- **User Story 2 (Phase 4)**: Depends on Foundational and can be implemented after or alongside US1
  conversion APIs, but save UI integration is clearest after US1 editor screen exists.
- **User Story 3 (Phase 5)**: Depends on Foundational and integrates most cleanly after US1 editor
  screen and US2 save path exist.
- **Polish (Phase 6)**: Depends on selected user stories being complete.

### User Story Dependencies

- **US1 글 작성 및 편집**: Requires foundational editor model and loader; no dependency on US2 or
  US3 for basic editable UI.
- **US2 MDX 저장 형식 보존**: Uses foundational conversion APIs and existing protected content
  operations; save UI wiring depends on US1 editor screen.
- **US3 변경 손실 방지와 복구**: Uses foundational save mapping and integrates with US1 editor
  screen plus US2 save action for full validation.

### Parallel Opportunities

- T003, T004, T005, T006, and T007 can run in parallel after dependency scope is set because they
  target separate files.
- T008, T010, T012, T014, T016, T018, and T021 can be authored in parallel as contract tests for
  separate modules.
- T023, T024, T025, T026, and T027 can run in parallel for US1 tests.
- T029, T030, T031, and T032 can run in parallel after editor screen expectations are established.
- T039, T040, T041, and T042 can run in parallel for US2 tests.
- T050, T051, T052, and T053 can run in parallel for US3 tests.
- T061, T062, and T063 can run in parallel after implementation because they update different
  documents.

---

## Parallel Example: User Story 1

```text
Task: "Add CMS posts list route tests for authorized post summaries, new draft action, protected access, and no publish/media controls in apps/cms/app/posts/page.test.tsx"
Task: "Add new editor route tests for authorized empty draft screen, title input, toolbar visibility, preview area, and protected access in apps/cms/app/posts/new/page.test.tsx"
Task: "Add existing editor route tests for loading repository post content, unsupported state, and protected access in apps/cms/app/posts/[slug]/page.test.tsx"
Task: "Add editor screen rendering tests for title editing, body editing, dirty state, toolbar commands, frontmatter panel, and preview panel in apps/cms/components/editor/editor-screen.test.tsx"
Task: "Add editor loader tests for listing posts, creating empty documents, loading existing files, and unsupported MDX handling in apps/cms/lib/editor/editor-loader.test.ts"
```

## Parallel Example: User Story 2

```text
Task: "Add round-trip fixture tests for paragraph, heading, lists, blockquote, horizontal rule, link, image reference, inline code, code block, bold, and italic in packages/editor/src/roundtrip.test.ts"
Task: "Add editor save action tests for create draft, save draft, expected SHA, serialized MDX, and submitted content preservation in apps/cms/app/actions/editor-actions.test.ts"
Task: "Add protected editor save integration tests proving unauthorized states do not call adapter writes in apps/cms/lib/editor/protected-editor-save.test.ts"
Task: "Add editor screen save interaction tests for successful save, validation failure, unsupported MDX block, and clean saved state in apps/cms/components/editor/editor-save-flow.test.tsx"
```

## Parallel Example: User Story 3

```text
Task: "Add draft backup tests for key generation, 30 day TTL, expired cleanup, restore candidate detection, and save cleanup in apps/cms/lib/editor/draft-backup.test.ts"
Task: "Add recovery banner rendering tests for restore, discard, stale backup, session-expired, auth-required, and conflict states in apps/cms/components/editor/recovery-banner.test.tsx"
Task: "Add editor failure flow tests for stale-file, temporary-connectivity, forbidden, session-expired, and unknown adapter failures in apps/cms/components/editor/editor-failure-flow.test.tsx"
Task: "Add editor save conflict tests proving stale SHA keeps submitted document and does not overwrite repository content in apps/cms/lib/editor/editor-conflict.test.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 Setup.
2. Complete Phase 2 Foundational editor document, validation, conversion, preview, and save mapping
   APIs.
3. Complete Phase 3 User Story 1.
4. Stop and validate that an authorized admin can open `/posts`, create a new draft editor, edit
   supported content, and see dirty state plus preview without save/recovery guarantees.

### Incremental Delivery

1. Setup + Foundational establishes shared editor contracts and package APIs.
2. US1 adds usable editor UI and route integration.
3. US2 adds protected save and round-trip persistence.
4. US3 adds local backup, conflict preservation, and failure recovery.
5. Polish validates package and workspace commands and updates docs.

### Scope Guardrails

- Do not add media upload, image conversion, unused media cleanup, publish/unpublish/archive,
  revalidation, preview token, SEO scoring, generated outputs, analytics dashboard, AI writing
  generation, collaborative editing, comments, approval workflow, or scheduled publishing.
- Keep repository MDX under `content/posts/*.mdx` as canonical; local draft backup is recovery-only.
- Keep public blog runtime free of GitHub OAuth, CMS session, and repository write credentials.
- Keep reusable editor model and conversion behavior in `packages/editor`; keep CMS protected routes
  and actions in `apps/cms`.
- Keep UI within existing design-system primitives and shell navigation; do not introduce custom hex
  palette or nested-card editor layout.

## Notes

- `[P]` tasks modify different files or can be prepared independently.
- Test tasks should be written before their implementation task and should fail before the target
  implementation exists.
- Commit after each phase or logical group.
