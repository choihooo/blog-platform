# Tasks: Repo Foundation

**Input**: `/specs/001-repo-foundation/`의 design document

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: 별도 test-first workflow는 요청되지 않았다. validation은 quickstart.md의 root command와
local app startup task로 수행한다.

**Organization**: 각 task는 사용자 스토리별로 묶어 독립 구현과 검증이 가능하게 한다.

## Format: `[ID] [P?] [Story] 설명`

- **[P]**: 다른 파일을 다루며 미완료 task에 의존하지 않아 병렬 실행 가능
- **[Story]**: task가 매핑되는 사용자 스토리(US1, US2, US3)
- 설명에는 정확한 file path를 포함한다.

## Phase 1: Setup (공유 Infrastructure)

**목적**: 모든 story가 사용하는 root workspace file과 shared tooling을 초기화한다.

- [x] T001 root workspace package metadata와 script를 `package.json`에 작성한다
- [x] T002 app과 package를 포함하는 pnpm workspace glob을 `pnpm-workspace.yaml`에 작성한다
- [x] T003 build, typecheck, lint, format, dev task를 위한 Turborepo pipeline을 `turbo.json`에
      작성한다
- [x] T004 [P] shared TypeScript base configuration을 `tsconfig.base.json`에 작성한다
- [x] T005 [P] repository formatting configuration을 `.prettierrc`에 작성한다
- [x] T006 [P] repository lint ignore pattern을 `.eslintignore`에 작성한다
- [x] T007 [P] formatting ignore pattern을 `.prettierignore`에 작성한다

---

## Phase 2: Foundational (Blocking Prerequisites)

**목적**: 모든 사용자 스토리가 의존하는 app/package directory skeleton과 shared package metadata를
만든다.

**CRITICAL**: 이 phase가 끝나기 전에는 사용자 스토리 작업을 시작하지 않는다.

- [x] T008 application directory `apps/blog`와 `apps/cms`를 생성한다
- [x] T009 shared package directory `packages/editor`, `packages/markdown`, `packages/seo-engine`,
      `packages/design-system`, `packages/analytics`, `packages/ai`를 생성한다
- [x] T010 [P] editor package metadata를 `packages/editor/package.json`에 작성한다
- [x] T011 [P] markdown package metadata를 `packages/markdown/package.json`에 작성한다
- [x] T012 [P] seo-engine package metadata를 `packages/seo-engine/package.json`에 작성한다
- [x] T013 [P] design-system package metadata를 `packages/design-system/package.json`에 작성한다
- [x] T014 [P] analytics package metadata를 `packages/analytics/package.json`에 작성한다
- [x] T015 [P] ai package metadata를 `packages/ai/package.json`에 작성한다
- [x] T016 [P] editor package placeholder export를 `packages/editor/src/index.ts`에 작성한다
- [x] T017 [P] markdown package placeholder export를 `packages/markdown/src/index.ts`에 작성한다
- [x] T018 [P] seo-engine package placeholder export를 `packages/seo-engine/src/index.ts`에 작성한다
- [x] T019 [P] design-system package placeholder export를 `packages/design-system/src/index.ts`에
      작성한다
- [x] T020 [P] analytics package placeholder export를 `packages/analytics/src/index.ts`에 작성한다
- [x] T021 [P] ai package placeholder export를 `packages/ai/src/index.ts`에 작성한다
- [x] T022 shared package TypeScript setting을 `packages/editor/tsconfig.json`에 작성한다
- [x] T023 shared package TypeScript setting을 `packages/markdown/tsconfig.json`에 작성한다
- [x] T024 shared package TypeScript setting을 `packages/seo-engine/tsconfig.json`에 작성한다
- [x] T025 shared package TypeScript setting을 `packages/design-system/tsconfig.json`에 작성한다
- [x] T026 shared package TypeScript setting을 `packages/analytics/tsconfig.json`에 작성한다
- [x] T027 shared package TypeScript setting을 `packages/ai/tsconfig.json`에 작성한다

**Checkpoint**: foundation directory, package metadata, shared package export가 준비된다.

---

## Phase 3: 사용자 스토리 1 - 블로그 플랫폼 workspace 초기화 (Priority: P1) MVP

**Goal**: 공개 블로그, 비공개 CMS, 공유 package, 문서를 포함한 완전한 workspace foundation을
제공한다.

**Independent Test**: repository 구조를 확인하고 repository root에서 root validation workflow를
실행한다.

### 사용자 스토리 1 구현

- [x] T028 [US1] root install, build, typecheck, lint, format:check, dev command script를
      `package.json`에 작성한다
- [x] T029 [US1] 두 app과 shared package의 workspace package name 및 dependency reference를
      `package.json`에 작성한다
- [x] T030 [US1] 모든 workspace의 build task dependency와 output을 `turbo.json`에 작성한다
- [x] T031 [US1] application과 package workspace를 포함하는 type checking 설정을 `turbo.json`에
      작성한다
- [x] T032 [US1] application과 package workspace를 포함하는 linting 및 formatting check 설정을
      `turbo.json`에 작성한다
- [x] T033 [US1] 기존 documentation이 `docs/blog-platform-spec.md`에 남아 있는지 확인한다
- [x] T034 [US1] 기존 roadmap이 `docs/implementation-roadmap.md`에 남아 있는지 확인한다
- [x] T035 [US1] root workspace validation expectation을 `README.md`에 문서화한다

**Checkpoint**: 필수 boundary를 발견할 수 있고 root validation command가 문서화되면 US1이 완료된다.

---

## Phase 4: 사용자 스토리 2 - 초기 app 두 개를 로컬에서 실행 (Priority: P2)

**Goal**: 공개 블로그와 비공개 CMS application을 서로 분리된 initial experience로 locally
runnable하게 만든다.

**Independent Test**: 각 app을 로컬에서 시작하고 unfinished content, CMS, publishing feature에
의존하지 않는 초기 page가 노출되는지 확인한다.

### 사용자 스토리 2 구현

- [x] T036 [P] [US2] blog app package metadata와 script를 `apps/blog/package.json`에 작성한다
- [x] T037 [P] [US2] CMS app package metadata와 script를 `apps/cms/package.json`에 작성한다
- [x] T038 [P] [US2] blog app TypeScript configuration을 `apps/blog/tsconfig.json`에 작성한다
- [x] T039 [P] [US2] CMS app TypeScript configuration을 `apps/cms/tsconfig.json`에 작성한다
- [x] T040 [P] [US2] blog app framework configuration을 `apps/blog/next.config.mjs`에 작성한다
- [x] T041 [P] [US2] CMS app framework configuration을 `apps/cms/next.config.mjs`에 작성한다
- [x] T042 [P] [US2] blog app root layout을 `apps/blog/app/layout.tsx`에 작성한다
- [x] T043 [P] [US2] CMS app root layout을 `apps/cms/app/layout.tsx`에 작성한다
- [x] T044 [P] [US2] initial public blog page를 `apps/blog/app/page.tsx`에 작성한다
- [x] T045 [P] [US2] initial CMS page를 `apps/cms/app/page.tsx`에 작성한다
- [x] T046 [US2] app-specific local development command를 `README.md`에 문서화한다

**Checkpoint**: 두 app shell을 시작하고 로컬에서 접근할 수 있으면 US2가 완료된다.

---

## Phase 5: 사용자 스토리 3 - 공유 package 소유권 준비 (Priority: P3)

**Goal**: 각 shared package가 명확한 ownership을 가지고 root validation에 참여하게 하며, 향후 domain
logic이 app 사이에서 중복되지 않게 한다.

**Independent Test**: 각 shared package가 발견 가능한 package boundary를 가지고 root validation
workflow에 참여하는지 확인한다.

### 사용자 스토리 3 구현

- [x] T047 [P] [US3] editor package ownership을 `packages/editor/README.md`에 문서화한다
- [x] T048 [P] [US3] markdown package ownership을 `packages/markdown/README.md`에 문서화한다
- [x] T049 [P] [US3] seo-engine package ownership을 `packages/seo-engine/README.md`에 문서화한다
- [x] T050 [P] [US3] design-system package ownership을 `packages/design-system/README.md`에
      문서화한다
- [x] T051 [P] [US3] analytics package ownership을 `packages/analytics/README.md`에 문서화한다
- [x] T052 [P] [US3] ai package ownership을 `packages/ai/README.md`에 문서화한다
- [x] T053 [US3] shared package ownership summary를 `README.md`에 추가한다
- [x] T054 [US3] shared package script가 root validation에 참여하는지 `package.json` 기준으로
      확인한다

**Checkpoint**: 모든 shared package가 discoverable하고 documented되어 있으며 validation에 포함되면
US3이 완료된다.

---

## Phase 6: Polish & Cross-Cutting Concerns

**목적**: 완료된 foundation을 검증하고 MVP scope drift가 없는지 확인한다.

- [x] T055 [P] workspace boundary inspection을 `specs/001-repo-foundation/quickstart.md` 기준으로
      실행한다
- [x] T056 dependency installation validation을 `pnpm install`로 실행한다
- [x] T057 root build validation을 `pnpm build`로 실행한다
- [x] T058 root type validation을 `pnpm typecheck`로 실행한다
- [x] T059 root lint validation을 `pnpm lint`로 실행한다
- [x] T060 root format validation을 `pnpm format:check`로 실행한다
- [x] T061 [P] public blog route contract를 `specs/001-repo-foundation/contracts/app-routes.md`
      기준으로 검증한다
- [x] T062 [P] CMS route contract를 `specs/001-repo-foundation/contracts/app-routes.md` 기준으로
      검증한다
- [x] T063 금지된 MVP feature가 도입되지 않았는지 `.specify/memory/constitution.md` 기준으로
      확인한다
- [x] T064 implementation note와 validation result를 `README.md`에 업데이트한다

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: dependency 없음. 즉시 시작할 수 있다.
- **Foundational (Phase 2)**: Phase 1 완료에 의존하며 모든 사용자 스토리를 block한다.
- **User Story 1 (Phase 3)**: Phase 2 완료에 의존한다.
- **User Story 2 (Phase 4)**: Phase 2 완료에 의존하며, foundation 이후 US1과 병렬 진행할 수 있다.
- **User Story 3 (Phase 5)**: Phase 2 완료에 의존하며, foundation 이후 US1 또는 US2와 병렬 진행할 수
  있다.
- **Polish (Phase 6)**: 원하는 사용자 스토리 완료에 의존한다.

### User Story Dependencies

- **User Story 1 (P1)**: foundational setup 이후 다른 사용자 스토리에 의존하지 않는다.
- **User Story 2 (P2)**: foundational setup 이후 US1에 의존하지 않는다. 함께 구현하는 경우 final
  README documentation은 reconcile해야 한다.
- **User Story 3 (P3)**: foundational setup 이후 US1 또는 US2에 의존하지 않는다. 함께 구현하는 경우
  final README documentation은 reconcile해야 한다.

### Parallel Opportunities

- T004-T007은 T001-T003을 이해한 뒤 병렬 실행 가능하다.
- T010-T021은 T009가 package directory를 만든 뒤 병렬 실행 가능하다.
- T036-T045는 blog와 CMS file이 독립적이므로 app별로 병렬 실행 가능하다.
- T047-T052는 각 package README가 독립적이므로 병렬 실행 가능하다.
- T061과 T062는 blog와 CMS route validation이 독립적이므로 병렬 실행 가능하다.

---

## Parallel Example: 사용자 스토리 2

```text
Task: "blog app package metadata와 script를 apps/blog/package.json에 작성한다"
Task: "CMS app package metadata와 script를 apps/cms/package.json에 작성한다"
Task: "blog app root layout을 apps/blog/app/layout.tsx에 작성한다"
Task: "CMS app root layout을 apps/cms/app/layout.tsx에 작성한다"
Task: "initial public blog page를 apps/blog/app/page.tsx에 작성한다"
Task: "initial CMS page를 apps/cms/app/page.tsx에 작성한다"
```

---

## Parallel Example: 사용자 스토리 3

```text
Task: "editor package ownership을 packages/editor/README.md에 문서화한다"
Task: "markdown package ownership을 packages/markdown/README.md에 문서화한다"
Task: "seo-engine package ownership을 packages/seo-engine/README.md에 문서화한다"
Task: "design-system package ownership을 packages/design-system/README.md에 문서화한다"
Task: "analytics package ownership을 packages/analytics/README.md에 문서화한다"
Task: "ai package ownership을 packages/ai/README.md에 문서화한다"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1 setup을 완료한다.
2. Phase 2 foundational directory와 package metadata를 완료한다.
3. Phase 3 User Story 1을 완료한다.
4. 멈추고 repository boundary 및 root command documentation을 검증한다.

### Incremental Delivery

1. Setup과 Foundational phase를 완료한다.
2. User Story 1을 delivery해 workspace boundary를 확립한다.
3. User Story 2를 delivery해 local app shell이 독립 실행됨을 증명한다.
4. User Story 3을 delivery해 shared package ownership과 validation participation을 문서화한다.
5. Phase 6 quickstart와 constitution check를 실행한다.

### Parallel Team Strategy

Phase 2 이후:

- Developer A: User Story 1 root workspace validation과 documentation.
- Developer B: User Story 2 blog 및 CMS app shell.
- Developer C: User Story 3 shared package ownership README.

## Notes

- 모든 task는 checkbox, task ID, optional `[P]`, 필요한 story label, explicit file path format을
  따른다.
- task는 database, object storage, auth, publishing, AI generation, analytics dashboard, comments,
  accounts, payments, newsletters, localization을 피한다.
- feature specification이 TDD workflow를 요청하지 않았으므로 별도 test task는 만들지 않았다.
  validation은 quickstart와 root command task로 처리한다.
