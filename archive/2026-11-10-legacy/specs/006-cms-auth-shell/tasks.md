# Tasks: CMS Auth + Shell

**Input**: Design documents from `specs/006-cms-auth-shell/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`,
`quickstart.md`

**Tests**: 이 feature는 인증/권한 경계와 quickstart 검증 시나리오가 핵심 성공 기준이므로 user
story별 테스트 task를 포함한다.

**Organization**: 사용자 스토리별로 독립 구현과 검증이 가능하도록 task를 구성한다.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 서로 다른 파일을 수정하며 선행 task에 의존하지 않아 병렬 실행 가능
- **[Story]**: user story phase task에만 사용
- 모든 task는 구현 대상 파일 경로를 포함한다

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: CMS 인증, shell UI, 테스트 구현에 필요한 package dependency와 파일 구조를 준비한다.

<!-- prettier-ignore-start -->
- [x] T001 Add Auth.js/NextAuth and lucide dependencies to `apps/cms/package.json`
- [x] T002 Add design-system UI dependencies for Radix primitives and form helpers to `packages/design-system/package.json`
- [x] T003 Add component test dependencies for CMS shell tests to `apps/cms/package.json`
- [x] T004 Create auth module barrel in `apps/cms/lib/auth/index.ts`
- [x] T005 Create shell component directory barrel in `apps/cms/components/shell/index.ts`
<!-- prettier-ignore-end -->

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: 모든 user story가 공유하는 session type, admin identity loader, access decision,
mutation guard, auth provider, design-system primitive를 구현한다.

**CRITICAL**: 이 phase가 끝나기 전에는 user story 구현을 시작하지 않는다.

<!-- prettier-ignore-start -->
- [x] T006 Define `AdminIdentity`, `CmsSession`, `AccessDecision`, and guarded mutation result types in `apps/cms/lib/auth/types.ts`
- [x] T007 [P] Add admin identity loading tests for valid, missing, blank, placeholder, and unreadable site config in `apps/cms/lib/auth/admin-identity.test.ts`
- [x] T008 Implement admin identity loading from `content/site.json` in `apps/cms/lib/auth/admin-identity.ts`
- [x] T009 [P] Add access decision tests for authorized, unauthenticated, expired, forbidden, and misconfigured states in `apps/cms/lib/auth/guard.test.ts`
- [x] T010 Implement access decision and session expiry helpers in `apps/cms/lib/auth/guard.ts`
- [x] T011 [P] Add guarded mutation mapping tests for auth-required, forbidden, auth-misconfigured, and session-expired results in `apps/cms/lib/auth/mutation-guard.test.ts`
- [x] T012 Implement guarded mutation wrapper that blocks content adapter calls unless access is authorized in `apps/cms/lib/auth/mutation-guard.ts`
- [x] T013 Configure Auth.js GitHub provider, JWT/session callbacks, and GitHub id/login enrichment in `apps/cms/lib/auth/config.ts`
- [x] T014 Add Auth.js route handler export in `apps/cms/app/api/auth/[...nextauth]/route.ts`
- [x] T015 Add lightweight protected-route redirect proxy in `apps/cms/proxy.ts`
- [x] T016 [P] Add Button primitive in `packages/design-system/src/ui/button.tsx`
- [x] T017 [P] Add Input primitive in `packages/design-system/src/ui/input.tsx`
- [x] T018 [P] Add Dialog primitive in `packages/design-system/src/ui/dialog.tsx`
- [x] T019 [P] Add Tabs primitive in `packages/design-system/src/ui/tabs.tsx`
- [x] T020 [P] Add Dropdown Menu primitive in `packages/design-system/src/ui/dropdown-menu.tsx`
- [x] T021 [P] Add Form primitive in `packages/design-system/src/ui/form.tsx`
- [x] T022 Export new design-system primitives from `packages/design-system/src/index.ts`
<!-- prettier-ignore-end -->

**Checkpoint**: Auth/session/guard foundation and reusable UI primitive surface are typed, tested,
and available for user story implementation.

---

## Phase 3: User Story 1 - 관리자만 CMS 접근 (Priority: P1) MVP

**Goal**: 등록된 GitHub 관리자만 CMS 보호 화면에 접근하고, 미로그인 또는 비관리자 사용자는 콘텐츠
노출 없이 로그인/거부 상태를 받는다.

**Independent Test**: 관리자 identity가 등록된 사이트 설정과 로그인된 GitHub 사용자 정보를 준비한 뒤
CMS 진입을 시도해 관리자만 shell에 도달하고 그 외 사용자는 거부되는지 확인한다.

### Tests for User Story 1

<!-- prettier-ignore-start -->
- [x] T023 [P] [US1] Add route guard integration tests for admin, anonymous, non-admin, partial mismatch, and misconfigured states in `apps/cms/lib/auth/route-guard.test.ts`
- [x] T024 [P] [US1] Add login page rendering tests for sign-in, denied, and setup-error states in `apps/cms/app/login/page.test.tsx`
<!-- prettier-ignore-end -->

### Implementation for User Story 1

<!-- prettier-ignore-start -->
- [x] T025 [US1] Implement server route guard helpers for protected CMS pages in `apps/cms/lib/auth/route-guard.ts`
- [x] T026 [US1] Implement public login page and state messaging in `apps/cms/app/login/page.tsx`
- [x] T027 [US1] Replace CMS home page with protected admin access handling in `apps/cms/app/page.tsx`
- [x] T028 [US1] Ensure root CMS layout does not expose protected shell content before guard completion in `apps/cms/app/layout.tsx`
<!-- prettier-ignore-end -->

**Checkpoint**: User Story 1 is complete when only the configured GitHub admin can reach the
protected CMS home and all non-admin states fail closed without protected content.

---

## Phase 4: User Story 2 - 콘텐츠 변경 요청 보호 (Priority: P2)

**Goal**: 모든 CMS mutation이 repository 변경 전에 관리자 identity를 다시 검증하고, 비인가 요청은
content adapter 호출 없이 거부된다.

**Independent Test**: 관리자, 비관리자, 미로그인 상태에서 대표 mutation을 요청해 관리자 요청만
허용되고 나머지는 repository 변경 없이 거부되는지 확인한다.

### Tests for User Story 2

<!-- prettier-ignore-start -->
- [x] T029 [P] [US2] Add mutation guard contract tests proving unauthorized states do not call adapter operations in `apps/cms/lib/auth/protected-mutation.test.ts`
- [x] T030 [P] [US2] Add representative protected content operation tests for create, update, delete, media, and settings operations in `apps/cms/lib/auth/content-operation-guard.test.ts`
<!-- prettier-ignore-end -->

### Implementation for User Story 2

<!-- prettier-ignore-start -->
- [x] T031 [US2] Implement content adapter authorization wrapper for create/update/delete/media/settings operations in `apps/cms/lib/auth/protected-content-operations.ts`
- [x] T032 [US2] Export mutation guard and protected content operation helpers from `apps/cms/lib/auth/index.ts`
- [x] T033 [US2] Document how future CMS mutations must call the guard before adapter operations in `specs/006-cms-auth-shell/contracts/auth-guard.md`
- [x] T034 [US2] Add auth failure handling guidance for repository write flows in `specs/006-cms-auth-shell/quickstart.md`
<!-- prettier-ignore-end -->

**Checkpoint**: User Story 2 is complete when unauthorized mutation attempts always return
auth-specific failures and never invoke repository content adapter writes.

---

## Phase 5: User Story 3 - 기본 CMS Shell 탐색 (Priority: P3)

**Goal**: 인증된 관리자가 sidebar, top bar, posts/settings navigation, account state를 갖춘 기본 CMS
shell에서 안정적으로 이동할 수 있다.

**Independent Test**: 관리자 계정으로 로그인해 CMS shell을 열고 sidebar, top bar, posts navigation,
settings navigation, 로그아웃 또는 계정 상태 표시가 일관되게 동작하는지 확인한다.

### Tests for User Story 3

<!-- prettier-ignore-start -->
- [x] T035 [P] [US3] Add shell navigation model tests for active, available, and disabled item states in `apps/cms/components/shell/navigation.test.ts`
- [x] T036 [P] [US3] Add CMS shell rendering tests for sidebar, top bar, account state, and no editor/media/publish actions in `apps/cms/components/shell/cms-shell.test.tsx`
- [x] T037 [P] [US3] Add protected posts/settings page tests for readiness states and active navigation in `apps/cms/app/posts/page.test.tsx` and `apps/cms/app/settings/page.test.tsx`
<!-- prettier-ignore-end -->

### Implementation for User Story 3

<!-- prettier-ignore-start -->
- [x] T038 [US3] Implement shell navigation model helpers in `apps/cms/components/shell/navigation.ts`
- [x] T039 [P] [US3] Implement access and readiness state component in `apps/cms/components/shell/access-state.tsx`
- [x] T040 [P] [US3] Implement sidebar navigation component with lucide icons in `apps/cms/components/shell/sidebar.tsx`
- [x] T041 [P] [US3] Implement top bar account component with sign-out affordance in `apps/cms/components/shell/top-bar.tsx`
- [x] T042 [US3] Implement composed CMS shell layout in `apps/cms/components/shell/cms-shell.tsx`
- [x] T043 [US3] Implement protected posts readiness page in `apps/cms/app/posts/page.tsx`
- [x] T044 [US3] Implement protected settings readiness page in `apps/cms/app/settings/page.tsx`
- [x] T045 [US3] Integrate CMS shell into protected home, posts, and settings routes in `apps/cms/app/page.tsx`, `apps/cms/app/posts/page.tsx`, and `apps/cms/app/settings/page.tsx`
<!-- prettier-ignore-end -->

**Checkpoint**: User Story 3 is complete when an authorized admin can navigate the basic CMS shell
and no later-phase editor, media, or publish controls appear as usable features.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: 문서, 검증, scope review를 마무리한다.

<!-- prettier-ignore-start -->
- [x] T046 [P] Update CMS auth and shell implementation notes in `README.md`
- [x] T047 [P] Update Phase 5 implementation status in `docs/implementation-roadmap.md`
- [x] T048 Run `pnpm --filter @blog-platform/design-system typecheck` and fix issues in `packages/design-system`
- [x] T049 Run `pnpm --filter @blog-platform/design-system lint` and fix issues in `packages/design-system`
- [x] T050 Run `pnpm --filter @blog-platform/cms typecheck` and fix issues in `apps/cms`
- [x] T051 Run `pnpm --filter @blog-platform/cms lint` and fix issues in `apps/cms`
- [x] T052 Run `pnpm --filter @blog-platform/cms test` and fix issues in `apps/cms`
- [x] T053 Run `pnpm typecheck`, `pnpm lint`, `pnpm test`, and `pnpm build` from `package.json`
- [x] T054 Verify quickstart scenarios in `specs/006-cms-auth-shell/quickstart.md`
- [x] T055 Confirm no forbidden scope was introduced against `.specify/memory/constitution.md`
- [x] T056 Confirm no custom hex palette or nested-card shell layout was introduced in `apps/cms` and `packages/design-system`
<!-- prettier-ignore-end -->

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies. Can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion and blocks all user story phases.
- **User Story 1 (Phase 3)**: Depends on Foundational. MVP scope.
- **User Story 2 (Phase 4)**: Depends on Foundational and can be implemented independently with a
  mocked access decision and adapter.
- **User Story 3 (Phase 5)**: Depends on Foundational and can be implemented after US1 for route
  integration, while shell component work can be prepared independently.
- **Polish (Phase 6)**: Depends on selected user stories being complete.

### User Story Dependencies

- **US1 관리자만 CMS 접근**: No dependency on US2 or US3 after Foundational.
- **US2 콘텐츠 변경 요청 보호**: Uses foundational guard helpers and existing content adapter
  contract; does not require shell UI.
- **US3 기본 CMS Shell 탐색**: Uses foundational session/access types and integrates most cleanly
  after US1 protected routes exist.

### Parallel Opportunities

- T007, T009, T011, T016, T017, T018, T019, T020, and T021 can be authored in parallel after setup
  because they target separate files.
- T023 and T024 can run in parallel for US1 tests.
- T029 and T030 can run in parallel for US2 tests.
- T035, T036, and T037 can run in parallel for US3 tests.
- T039, T040, and T041 can run in parallel once navigation model expectations are established.
- T046 and T047 can run in parallel after implementation because they update different documents.

---

## Parallel Example: User Story 1

```text
Task: "Add route guard integration tests for admin, anonymous, non-admin, partial mismatch, and misconfigured states in apps/cms/lib/auth/route-guard.test.ts"
Task: "Add login page rendering tests for sign-in, denied, and setup-error states in apps/cms/app/login/page.test.tsx"
```

## Parallel Example: User Story 2

```text
Task: "Add mutation guard contract tests proving unauthorized states do not call adapter operations in apps/cms/lib/auth/protected-mutation.test.ts"
Task: "Add representative protected content operation tests for create, update, delete, media, and settings operations in apps/cms/lib/auth/content-operation-guard.test.ts"
```

## Parallel Example: User Story 3

```text
Task: "Add shell navigation model tests for active, available, and disabled item states in apps/cms/components/shell/navigation.test.ts"
Task: "Add CMS shell rendering tests for sidebar, top bar, account state, and no editor/media/publish actions in apps/cms/components/shell/cms-shell.test.tsx"
Task: "Add protected posts/settings page tests for readiness states and active navigation in apps/cms/app/posts/page.test.tsx and apps/cms/app/settings/page.test.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 Setup.
2. Complete Phase 2 Foundational auth/session/guard and UI primitive work.
3. Complete Phase 3 User Story 1.
4. Stop and validate admin-only CMS access independently.

### Incremental Delivery

1. Setup + Foundational establishes auth provider, session enrichment, admin identity loading,
   access decisions, mutation guard base, and UI primitives.
2. US1 proves only the configured GitHub admin can access CMS protected routes.
3. US2 proves direct mutation requests are independently guarded before repository writes.
4. US3 adds the navigable CMS shell for later editor, media, and publish phases.
5. Polish validates package and workspace commands and updates docs.

### Scope Guardrails

- Do not add multi-user roles, approval workflow, or public user accounts.
- Do not add a CMS database, object storage, or scheduled publishing.
- Do not implement rich-text editor, media upload, publish/revalidation, preview token, SEO engine,
  or analytics dashboard behavior in this feature.
- Keep public blog runtime free of GitHub OAuth, CMS session, and repository write credentials.
- Keep reusable UI primitives in `packages/design-system`; keep CMS auth and shell behavior in
  `apps/cms`.

## Notes

- `[P]` tasks modify different files or can be prepared independently.
- Test tasks should be written before their implementation task and should fail before the target
  implementation exists.
- Commit after each phase or logical group.
