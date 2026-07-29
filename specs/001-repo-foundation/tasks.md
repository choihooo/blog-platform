# Tasks: Repo Foundation

**Input**: Design documents from `/specs/001-repo-foundation/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: No separate test-first workflow was requested. Validation is captured through root commands and local app startup tasks from quickstart.md.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize root workspace files and shared tooling needed by every story.

- [ ] T001 Create root workspace package metadata and scripts in `package.json`
- [ ] T002 Create pnpm workspace package globs for apps and packages in `pnpm-workspace.yaml`
- [ ] T003 Create Turborepo pipeline for build, typecheck, lint, format, and dev tasks in `turbo.json`
- [ ] T004 [P] Create shared TypeScript base configuration in `tsconfig.base.json`
- [ ] T005 [P] Create repository formatting configuration in `.prettierrc`
- [ ] T006 [P] Create repository lint ignore patterns in `.eslintignore`
- [ ] T007 [P] Create formatting ignore patterns in `.prettierignore`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Create the app/package directory skeletons and shared package metadata that all user stories depend on.

**CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T008 Create application directories `apps/blog` and `apps/cms`
- [ ] T009 Create shared package directories `packages/editor`, `packages/markdown`, `packages/seo-engine`, `packages/design-system`, `packages/analytics`, and `packages/ai`
- [ ] T010 [P] Create package metadata for editor package in `packages/editor/package.json`
- [ ] T011 [P] Create package metadata for markdown package in `packages/markdown/package.json`
- [ ] T012 [P] Create package metadata for seo-engine package in `packages/seo-engine/package.json`
- [ ] T013 [P] Create package metadata for design-system package in `packages/design-system/package.json`
- [ ] T014 [P] Create package metadata for analytics package in `packages/analytics/package.json`
- [ ] T015 [P] Create package metadata for ai package in `packages/ai/package.json`
- [ ] T016 [P] Create placeholder export for editor package in `packages/editor/src/index.ts`
- [ ] T017 [P] Create placeholder export for markdown package in `packages/markdown/src/index.ts`
- [ ] T018 [P] Create placeholder export for seo-engine package in `packages/seo-engine/src/index.ts`
- [ ] T019 [P] Create placeholder export for design-system package in `packages/design-system/src/index.ts`
- [ ] T020 [P] Create placeholder export for analytics package in `packages/analytics/src/index.ts`
- [ ] T021 [P] Create placeholder export for ai package in `packages/ai/src/index.ts`
- [ ] T022 Configure shared package TypeScript settings in `packages/editor/tsconfig.json`
- [ ] T023 Configure shared package TypeScript settings in `packages/markdown/tsconfig.json`
- [ ] T024 Configure shared package TypeScript settings in `packages/seo-engine/tsconfig.json`
- [ ] T025 Configure shared package TypeScript settings in `packages/design-system/tsconfig.json`
- [ ] T026 Configure shared package TypeScript settings in `packages/analytics/tsconfig.json`
- [ ] T027 Configure shared package TypeScript settings in `packages/ai/tsconfig.json`

**Checkpoint**: Foundation directories, package metadata, and shared package exports are ready.

---

## Phase 3: User Story 1 - Initialize Blog Platform Workspace (Priority: P1) MVP

**Goal**: Provide a complete workspace foundation for the public blog, private CMS, shared packages, and documentation.

**Independent Test**: Inspect the repository structure and run the root validation workflow from the repository root.

### Implementation for User Story 1

- [ ] T028 [US1] Add root install, build, typecheck, lint, format:check, and dev command scripts in `package.json`
- [ ] T029 [US1] Add workspace package names and dependency references for both apps and shared packages in `package.json`
- [ ] T030 [US1] Configure build task dependencies and outputs for all workspaces in `turbo.json`
- [ ] T031 [US1] Configure type checking to include application and package workspaces in `turbo.json`
- [ ] T032 [US1] Configure linting and formatting checks to include application and package workspaces in `turbo.json`
- [ ] T033 [US1] Verify existing documentation remains in `docs/blog-platform-spec.md`
- [ ] T034 [US1] Verify existing roadmap remains in `docs/implementation-roadmap.md`
- [ ] T035 [US1] Document root workspace validation expectations in `README.md`

**Checkpoint**: User Story 1 is complete when the required boundaries are discoverable and root validation commands are documented.

---

## Phase 4: User Story 2 - Run Both Initial Applications Locally (Priority: P2)

**Goal**: Make the public blog and private CMS applications locally runnable as separate initial experiences.

**Independent Test**: Start each app locally and confirm each app exposes its own initial page without depending on unfinished content, CMS, or publishing features.

### Implementation for User Story 2

- [ ] T036 [P] [US2] Create blog app package metadata and scripts in `apps/blog/package.json`
- [ ] T037 [P] [US2] Create CMS app package metadata and scripts in `apps/cms/package.json`
- [ ] T038 [P] [US2] Create blog app TypeScript configuration in `apps/blog/tsconfig.json`
- [ ] T039 [P] [US2] Create CMS app TypeScript configuration in `apps/cms/tsconfig.json`
- [ ] T040 [P] [US2] Create blog app framework configuration in `apps/blog/next.config.mjs`
- [ ] T041 [P] [US2] Create CMS app framework configuration in `apps/cms/next.config.mjs`
- [ ] T042 [P] [US2] Create blog app root layout in `apps/blog/app/layout.tsx`
- [ ] T043 [P] [US2] Create CMS app root layout in `apps/cms/app/layout.tsx`
- [ ] T044 [P] [US2] Create initial public blog page in `apps/blog/app/page.tsx`
- [ ] T045 [P] [US2] Create initial CMS page in `apps/cms/app/page.tsx`
- [ ] T046 [US2] Add app-specific local development command documentation in `README.md`

**Checkpoint**: User Story 2 is complete when both app shells can be started and reached locally.

---

## Phase 5: User Story 3 - Prepare Shared Package Ownership (Priority: P3)

**Goal**: Ensure each shared package has clear ownership and can participate in root validation without duplicating future domain logic in apps.

**Independent Test**: Confirm each shared package has a discoverable package boundary and participates in the root validation workflow.

### Implementation for User Story 3

- [ ] T047 [P] [US3] Document editor package ownership in `packages/editor/README.md`
- [ ] T048 [P] [US3] Document markdown package ownership in `packages/markdown/README.md`
- [ ] T049 [P] [US3] Document seo-engine package ownership in `packages/seo-engine/README.md`
- [ ] T050 [P] [US3] Document design-system package ownership in `packages/design-system/README.md`
- [ ] T051 [P] [US3] Document analytics package ownership in `packages/analytics/README.md`
- [ ] T052 [P] [US3] Document ai package ownership in `packages/ai/README.md`
- [ ] T053 [US3] Add shared package ownership summary to `README.md`
- [ ] T054 [US3] Confirm shared package scripts participate in root validation through `package.json`

**Checkpoint**: User Story 3 is complete when all shared packages are discoverable, documented, and included in validation.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validate the completed foundation and remove accidental MVP scope drift.

- [ ] T055 [P] Run workspace boundary inspection from `specs/001-repo-foundation/quickstart.md`
- [ ] T056 Run dependency installation validation with `pnpm install`
- [ ] T057 Run root build validation with `pnpm build`
- [ ] T058 Run root type validation with `pnpm typecheck`
- [ ] T059 Run root lint validation with `pnpm lint`
- [ ] T060 Run root format validation with `pnpm format:check`
- [ ] T061 [P] Verify the public blog route contract from `specs/001-repo-foundation/contracts/app-routes.md`
- [ ] T062 [P] Verify the CMS route contract from `specs/001-repo-foundation/contracts/app-routes.md`
- [ ] T063 Verify no prohibited MVP features were introduced against `.specify/memory/constitution.md`
- [ ] T064 Update implementation notes and validation results in `README.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; can start immediately.
- **Foundational (Phase 2)**: Depends on Phase 1 completion; blocks all user story phases.
- **User Story 1 (Phase 3)**: Depends on Phase 2 completion.
- **User Story 2 (Phase 4)**: Depends on Phase 2 completion; can run in parallel with User Story 1 after foundation exists.
- **User Story 3 (Phase 5)**: Depends on Phase 2 completion; can run in parallel with User Story 1 or 2 after foundation exists.
- **Polish (Phase 6)**: Depends on completion of the desired user stories.

### User Story Dependencies

- **User Story 1 (P1)**: No dependency on other user stories after foundational setup.
- **User Story 2 (P2)**: No dependency on User Story 1 after foundational setup, but final README documentation should be reconciled if both are implemented together.
- **User Story 3 (P3)**: No dependency on User Story 1 or 2 after foundational setup, but final README documentation should be reconciled if stories are implemented together.

### Parallel Opportunities

- T004-T007 can run in parallel after T001-T003 are understood.
- T010-T021 can run in parallel after T009 creates package directories.
- T036-T045 can run in parallel by app-specific file because blog and CMS files are independent.
- T047-T052 can run in parallel because each package README is independent.
- T061 and T062 can run in parallel because blog and CMS route validation are independent.

---

## Parallel Example: User Story 2

```text
Task: "Create blog app package metadata and scripts in apps/blog/package.json"
Task: "Create CMS app package metadata and scripts in apps/cms/package.json"
Task: "Create blog app root layout in apps/blog/app/layout.tsx"
Task: "Create CMS app root layout in apps/cms/app/layout.tsx"
Task: "Create initial public blog page in apps/blog/app/page.tsx"
Task: "Create initial CMS page in apps/cms/app/page.tsx"
```

---

## Parallel Example: User Story 3

```text
Task: "Document editor package ownership in packages/editor/README.md"
Task: "Document markdown package ownership in packages/markdown/README.md"
Task: "Document seo-engine package ownership in packages/seo-engine/README.md"
Task: "Document design-system package ownership in packages/design-system/README.md"
Task: "Document analytics package ownership in packages/analytics/README.md"
Task: "Document ai package ownership in packages/ai/README.md"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 setup.
2. Complete Phase 2 foundational directories and package metadata.
3. Complete Phase 3 User Story 1.
4. Stop and validate repository boundaries and root command documentation.

### Incremental Delivery

1. Complete Setup and Foundational phases.
2. Deliver User Story 1 to establish workspace boundaries.
3. Deliver User Story 2 to prove local app shells run independently.
4. Deliver User Story 3 to document shared package ownership and validation participation.
5. Run Phase 6 quickstart and constitution checks.

### Parallel Team Strategy

After Phase 2:

- Developer A: User Story 1 root workspace validation and documentation.
- Developer B: User Story 2 blog and CMS app shells.
- Developer C: User Story 3 shared package ownership README files.

## Notes

- Every task uses the required checkbox, task ID, optional `[P]`, story label where required, and explicit file path format.
- Tasks avoid database, object storage, auth, publishing, AI generation, analytics dashboard, comments, accounts, payments, newsletters, and localization.
- Tests are not generated as separate tasks because the feature specification did not request a TDD workflow; validation is handled through quickstart and root command tasks.
