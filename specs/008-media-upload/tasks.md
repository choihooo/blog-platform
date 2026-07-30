# Tasks: Media Upload

**Input**: Design documents from `specs/008-media-upload/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`,
`quickstart.md`

**Tests**: 이 feature는 이미지 파일 검증, repository media commit, editor document 오염 방지, 인증
실패 보존이 핵심 성공 기준이므로 user story별 테스트 task를 포함한다.

**Organization**: 사용자 스토리별로 독립 구현과 검증이 가능하도록 task를 구성한다.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 서로 다른 파일을 수정하며 선행 task에 의존하지 않아 병렬 실행 가능
- **[Story]**: user story phase task에만 사용
- 모든 task는 구현 대상 파일 경로를 포함한다

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: media upload 구현에 필요한 dependency, public media directory, barrel export 기반을
준비한다.

<!-- prettier-ignore-start -->
- [ ] T001 Add `sharp` dependency for CMS server-side image validation and webp normalization in `apps/cms/package.json`
- [ ] T002 Ensure repository media directories exist with keep files in `public/media/covers/.gitkeep` and `public/media/posts/.gitkeep`
- [ ] T003 [P] Add media upload component exports placeholder to `apps/cms/components/editor/index.ts`
- [ ] T004 [P] Add media helper exports placeholder to `apps/cms/lib/editor/index.ts`
- [ ] T005 [P] Add upload media action export placeholder beside existing save action in `apps/cms/app/actions/editor-actions.ts`
<!-- prettier-ignore-end -->

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: 모든 user story가 공유하는 이미지 검증, 경로 생성, editor image reference, action
result mapping, adapter 보존 규칙을 구현한다.

**CRITICAL**: 이 phase가 끝나기 전에는 user story 구현을 시작하지 않는다.

<!-- prettier-ignore-start -->
- [ ] T006 [P] Add media path tests for cover/body paths, slug requirement, hash suffix, public path conversion, and overwrite avoidance in `apps/cms/lib/editor/media-path.test.ts`
- [ ] T007 Implement media path generation and public path conversion helpers in `apps/cms/lib/editor/media-path.ts`
- [ ] T008 [P] Add media file tests for allowed extensions, 2MB limit, invalid decode, webp normalization, and content hash generation in `apps/cms/lib/editor/media-file.test.ts`
- [ ] T009 Implement server-side media file validation, image decode, webp normalization, and content hash helpers in `apps/cms/lib/editor/media-file.ts`
- [ ] T010 [P] Add editor media contract tests for upload state transitions, body image reference creation, cover reference creation, and no pending placeholder persistence in `apps/cms/lib/editor/editor-media.test.ts`
- [ ] T011 Implement editor media request/result types, upload state helpers, body image reference creation, and cover reference creation in `apps/cms/lib/editor/editor-media.ts`
- [ ] T012 [P] Add editor document tests for image caption support and public-path-only image refs in `packages/editor/src/document.test.ts`
- [ ] T013 Extend `EditorNode` image shape to include optional caption in `packages/editor/src/document.ts`
- [ ] T014 [P] Add editor serialization tests for Markdown image syntax with alt/title/caption and rejection of blob/data/local image refs in `packages/editor/src/editor-to-mdx.test.ts`
- [ ] T015 Update image MDX serialization to preserve caption as following paragraph in `packages/editor/src/editor-to-mdx.ts`
- [ ] T016 [P] Add editor validation tests for allowed public media paths, forbidden blob/data/file/local paths, and cover image path validation in `packages/editor/src/validation.test.ts`
- [ ] T017 Update editor image and cover path validation rules in `packages/editor/src/validation.ts`
- [ ] T018 [P] Add content adapter media tests for base64 media writes, duplicate hash paths, invalid non-media paths, and GitHub payload content preservation in `apps/cms/lib/content-adapter/media.test.ts`
- [ ] T019 Confirm or adjust local and GitHub media commit behavior for binary base64 content in `apps/cms/lib/content-adapter/local-adapter.ts` and `apps/cms/lib/content-adapter/github-adapter.ts`
<!-- prettier-ignore-end -->

**Checkpoint**: Media path generation, image normalization, editor image serialization/validation,
and adapter media commit behavior are typed, tested, and available for user story implementation.

---

## Phase 3: User Story 1 - 본문 이미지 업로드 (Priority: P1) MVP

**Goal**: 인증된 관리자가 CMS editor 본문에 허용된 이미지 파일을 업로드하고, 성공 후 저장 가능한
MDX에 공개 이미지 경로만 남길 수 있다.

**Independent Test**: 관리자 계정으로 기존 초안 또는 새 초안을 열고 허용된 이미지 파일을 본문에
추가한 뒤, 업로드 성공 후 편집 문서와 저장될 MDX에 공개 이미지 경로만 남는지 확인한다.

### Tests for User Story 1

<!-- prettier-ignore-start -->
- [ ] T020 [P] [US1] Add upload media action tests for successful body upload, slug candidate use, public path result, and protected content operation usage in `apps/cms/app/actions/editor-actions.test.ts`
- [ ] T021 [P] [US1] Add body media upload control tests for file selection, alt/title/caption input, pending state, success insertion, and accessible image button in `apps/cms/components/editor/media-upload-control.test.tsx`
- [ ] T022 [P] [US1] Add editor screen body upload flow tests proving image node insertion, dirty state, backup persistence, and MDX public path serialization in `apps/cms/components/editor/editor-media-flow.test.tsx`
<!-- prettier-ignore-end -->

### Implementation for User Story 1

<!-- prettier-ignore-start -->
- [ ] T023 [US1] Implement protected `uploadEditorMediaAction` body upload path with media validation, `commitMedia`, and public image node result in `apps/cms/app/actions/editor-actions.ts`
- [ ] T024 [P] [US1] Implement reusable media upload status component for pending, uploaded, retryable failure, and non-retryable failure states in `apps/cms/components/editor/media-upload-status.tsx`
- [ ] T025 [US1] Implement body media upload control with lucide image button, file input, alt/title/caption fields, action submission, and success callback in `apps/cms/components/editor/media-upload-control.tsx`
- [ ] T026 [US1] Replace disabled image toolbar button with body media upload control wiring in `apps/cms/components/editor/editor-toolbar.tsx`
- [ ] T027 [US1] Integrate body media upload success into Tiptap image insertion, editor document dirty state, and local backup persistence in `apps/cms/components/editor/editor-screen.tsx`
- [ ] T028 [US1] Export media upload UI components from `apps/cms/components/editor/index.ts`
<!-- prettier-ignore-end -->

**Checkpoint**: User Story 1 is complete when an authorized admin can upload a valid body image,
insert it into the editor as a public path image node, save MDX without blob/data/local paths, and
see a clear uploaded-but-unsaved state.

---

## Phase 4: User Story 2 - 커버 이미지 업로드 (Priority: P2)

**Goal**: 인증된 관리자가 metadata panel에서 커버 이미지를 업로드하고, 성공 후 `coverImage`가 공개
경로로 갱신되는 것을 확인할 수 있다.

**Independent Test**: 관리자 계정으로 글 편집 화면을 열고 커버 이미지 파일을 선택한 뒤, 업로드 성공
후 metadata의 커버 이미지 값이 공개 경로로 바뀌고 저장 가능한 상태가 되는지 확인한다.

### Tests for User Story 2

<!-- prettier-ignore-start -->
- [ ] T029 [P] [US2] Add upload media action tests for successful cover upload, cover path format, existing cover replacement without delete, and public cover result in `apps/cms/app/actions/editor-actions.test.ts`
- [ ] T030 [P] [US2] Add frontmatter panel cover upload tests for file selection, pending state, cover path update, existing cover display, and dirty state callback in `apps/cms/components/editor/frontmatter-panel.test.tsx`
- [ ] T031 [P] [US2] Add editor screen cover upload integration tests proving frontmatter update, preview awareness, backup persistence, and separate save requirement in `apps/cms/components/editor/editor-cover-media-flow.test.tsx`
<!-- prettier-ignore-end -->

### Implementation for User Story 2

<!-- prettier-ignore-start -->
- [ ] T032 [US2] Extend `uploadEditorMediaAction` to support cover uploads and return `coverImage` public path result in `apps/cms/app/actions/editor-actions.ts`
- [ ] T033 [US2] Add cover upload UI, existing cover display, and upload status handling to `apps/cms/components/editor/frontmatter-panel.tsx`
- [ ] T034 [US2] Integrate cover upload callbacks, dirty state, local backup persistence, and uploaded-but-unsaved messaging in `apps/cms/components/editor/editor-screen.tsx`
- [ ] T035 [US2] Update preview panel cover image awareness or summary messaging without adding publish/SEO controls in `apps/cms/components/editor/preview-panel.tsx`
<!-- prettier-ignore-end -->

**Checkpoint**: User Story 2 is complete when an authorized admin can upload a cover image, see
`coverImage` change to `/media/covers/<slug>-<hash>.webp`, keep previous repository files untouched,
and save the updated frontmatter through the existing draft save flow.

---

## Phase 5: User Story 3 - 실패와 제한 처리 (Priority: P3)

**Goal**: 허용되지 않는 파일, 2MB 초과 파일, decode 실패, upload 실패, 세션 만료, 권한 실패 상황에서
글 원본이 오염되지 않고 현재 편집 내용을 유지한다.

**Independent Test**: 허용되지 않는 파일 형식, 2MB 초과 파일, 업로드 실패, 권한 실패를 각각 재현해
편집 내용이 유지되고 저장될 콘텐츠에 임시 이미지 참조가 남지 않는지 확인한다.

### Tests for User Story 3

<!-- prettier-ignore-start -->
- [ ] T036 [P] [US3] Add upload media action failure tests for missing file, invalid type, too large file, invalid decode, slug-required, commit failure, auth-required, forbidden, and session-expired results in `apps/cms/app/actions/editor-actions.test.ts`
- [ ] T037 [P] [US3] Add media upload status rendering tests for validation failure, temporary connectivity, forbidden, session expired, retry action, and no public path leakage in `apps/cms/components/editor/media-upload-status.test.tsx`
- [ ] T038 [P] [US3] Add editor media failure flow tests proving body and cover refs are unchanged, current edits remain, backup excludes pending placeholders, and retry can resubmit in `apps/cms/components/editor/editor-media-failure-flow.test.tsx`
- [ ] T039 [P] [US3] Add editor validation regression tests proving saved MDX/frontmatter never includes `blob:`, `data:`, `file://`, or local absolute image paths after failed upload in `packages/editor/src/validation.test.ts`
<!-- prettier-ignore-end -->

### Implementation for User Story 3

<!-- prettier-ignore-start -->
- [ ] T040 [US3] Map media validation, slug, auth, repository, rate-limit, connectivity, and unknown failures to upload action result codes in `apps/cms/lib/editor/editor-media.ts`
- [ ] T041 [US3] Harden `uploadEditorMediaAction` failure paths so rejected uploads never call `commitMedia` and never return temporary URLs in `apps/cms/app/actions/editor-actions.ts`
- [ ] T042 [US3] Add retry and discard handling for failed body uploads without mutating editor document before success in `apps/cms/components/editor/media-upload-control.tsx`
- [ ] T043 [US3] Add retry and unchanged-cover handling for failed cover uploads in `apps/cms/components/editor/frontmatter-panel.tsx`
- [ ] T044 [US3] Ensure editor local backup serialization excludes pending upload placeholders and preserves only successful public paths in `apps/cms/components/editor/editor-screen.tsx`
- [ ] T045 [US3] Add no-delete behavior for removed image references and document that repository media cleanup is out of scope in `apps/cms/lib/editor/editor-media.ts`
<!-- prettier-ignore-end -->

**Checkpoint**: User Story 3 is complete when invalid files and failed uploads do not mutate
repository content or editor document image references, current edits are preserved, and retryable
states are clearly separated from terminal failures.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: 문서, 검증, scope review를 마무리한다.

<!-- prettier-ignore-start -->
- [ ] T046 [P] Update media upload implementation notes in `README.md`
- [ ] T047 [P] Update Phase 7 implementation status in `docs/implementation-roadmap.md`
- [ ] T048 [P] Update media upload validation notes in `specs/008-media-upload/quickstart.md`
- [ ] T049 [P] Update editor package image/caption behavior notes in `packages/editor/README.md`
- [ ] T050 Run `pnpm --filter @blog-platform/editor typecheck` and fix issues in `packages/editor`
- [ ] T051 Run `pnpm --filter @blog-platform/editor lint` and fix issues in `packages/editor`
- [ ] T052 Run `pnpm --filter @blog-platform/editor test` and fix issues in `packages/editor`
- [ ] T053 Run `pnpm --filter @blog-platform/cms typecheck` and fix issues in `apps/cms`
- [ ] T054 Run `pnpm --filter @blog-platform/cms lint` and fix issues in `apps/cms`
- [ ] T055 Run `pnpm --filter @blog-platform/cms test` and fix issues in `apps/cms`
- [ ] T056 Run `pnpm typecheck`, `pnpm lint`, `pnpm test`, and `pnpm build` from `package.json`
- [ ] T057 Verify quickstart scenarios in `specs/008-media-upload/quickstart.md`
- [ ] T058 Confirm no forbidden scope was introduced against `.specify/memory/constitution.md`
- [ ] T059 Confirm no object storage, media library, unused file cleanup, publish/revalidation, SEO scoring, analytics dashboard, AI generation, custom hex palette, or nested-card editor layout was introduced in `apps/cms`, `packages/editor`, and `packages/design-system`
<!-- prettier-ignore-end -->

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies. Can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion and blocks all user story phases.
- **User Story 1 (Phase 3)**: Depends on Foundational. MVP scope.
- **User Story 2 (Phase 4)**: Depends on Foundational and can be implemented after US1 UI patterns
  exist, but its action path and panel tests remain independently verifiable.
- **User Story 3 (Phase 5)**: Depends on Foundational and integrates with both upload targets after
  US1/US2 flows exist.
- **Polish (Phase 6)**: Depends on selected user stories being complete.

### User Story Dependencies

- **US1 본문 이미지 업로드**: Requires foundational media validation/path/action result helpers; no
  dependency on cover upload.
- **US2 커버 이미지 업로드**: Requires foundational media validation/path/action result helpers; can
  share UI/status primitives from US1 but remains independently testable through frontmatter panel.
- **US3 실패와 제한 처리**: Requires upload success paths to exist so failure behavior can prove
  body and cover refs remain unchanged.

### Parallel Opportunities

- T003, T004, and T005 can run in parallel because they update separate export surfaces.
- T006, T008, T010, T012, T014, T016, and T018 can be authored in parallel as contract tests for
  separate modules.
- T020, T021, and T022 can run in parallel for US1 tests.
- T024 and T025 can run in parallel after T023 establishes the action result shape.
- T029, T030, and T031 can run in parallel for US2 tests.
- T036, T037, T038, and T039 can run in parallel for US3 failure tests.
- T046, T047, T048, and T049 can run in parallel after implementation because they update different
  documents.

---

## Parallel Example: User Story 1

```text
Task: "Add upload media action tests for successful body upload, slug candidate use, public path result, and protected content operation usage in apps/cms/app/actions/editor-actions.test.ts"
Task: "Add body media upload control tests for file selection, alt/title/caption input, pending state, success insertion, and accessible image button in apps/cms/components/editor/media-upload-control.test.tsx"
Task: "Add editor screen body upload flow tests proving image node insertion, dirty state, backup persistence, and MDX public path serialization in apps/cms/components/editor/editor-media-flow.test.tsx"
```

## Parallel Example: User Story 2

```text
Task: "Add upload media action tests for successful cover upload, cover path format, existing cover replacement without delete, and public cover result in apps/cms/app/actions/editor-actions.test.ts"
Task: "Add frontmatter panel cover upload tests for file selection, pending state, cover path update, existing cover display, and dirty state callback in apps/cms/components/editor/frontmatter-panel.test.tsx"
Task: "Add editor screen cover upload integration tests proving frontmatter update, preview awareness, backup persistence, and separate save requirement in apps/cms/components/editor/editor-cover-media-flow.test.tsx"
```

## Parallel Example: User Story 3

```text
Task: "Add upload media action failure tests for missing file, invalid type, too large file, invalid decode, slug-required, commit failure, auth-required, forbidden, and session-expired results in apps/cms/app/actions/editor-actions.test.ts"
Task: "Add media upload status rendering tests for validation failure, temporary connectivity, forbidden, session expired, retry action, and no public path leakage in apps/cms/components/editor/media-upload-status.test.tsx"
Task: "Add editor media failure flow tests proving body and cover refs are unchanged, current edits remain, backup excludes pending placeholders, and retry can resubmit in apps/cms/components/editor/editor-media-failure-flow.test.tsx"
Task: "Add editor validation regression tests proving saved MDX/frontmatter never includes blob:, data:, file://, or local absolute image paths after failed upload in packages/editor/src/validation.test.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Stop and validate body image upload independently with `quickstart.md` Scenario 1

### Incremental Delivery

1. Complete Setup + Foundational
2. Add User Story 1 and validate body image upload
3. Add User Story 2 and validate cover image upload
4. Add User Story 3 and validate failure/limit handling
5. Complete Polish validation and scope review

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 body upload flow
   - Developer B: User Story 2 cover upload flow
   - Developer C: User Story 3 failure and limit handling
3. Stories complete and integrate through shared media helper contracts

## Notes

- [P] tasks = different files, no dependency on incomplete tasks
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Tests should be written before implementation and fail before the corresponding implementation
- Avoid adding object storage, publish/revalidation, SEO scoring, analytics dashboard, AI
  generation, media library, or automatic unused file cleanup in this phase
