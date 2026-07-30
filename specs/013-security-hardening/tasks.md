# Tasks: Security Hardening

**Input**: Design documents from `specs/013-security-hardening/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md),
[data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: 보안 경계 feature이므로 contract, guard, token, route, secret exposure 테스트를 구현 작업보다 먼저
배치한다.

**Organization**: 사용자 스토리별로 독립 구현 및 검증이 가능하도록 구성한다.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 서로 다른 파일 또는 선행 작업에 의존하지 않아 병렬 처리 가능
- **[Story]**: 사용자 스토리 단계의 작업에만 부여
- 모든 작업은 구체적인 파일 경로를 포함

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: 기존 auth/content-adapter/preview 관련 경계를 확인하고 보안 helper 위치를 준비

- [ ] T001 Review protected mutation entrypoints and record scope notes in `specs/013-security-hardening/quickstart.md`
- [ ] T002 [P] Add Security Hardening validation fixture notes in `specs/013-security-hardening/quickstart.md`
- [ ] T003 [P] Add security helper barrel placeholder in `apps/cms/lib/security/index.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: 모든 사용자 스토리가 공유하는 secret redaction, preview token payload, failure-safe 기본 helper 정비

**CRITICAL**: 이 단계가 끝나기 전에는 user story 구현을 시작하지 않는다.

- [ ] T004 Add secret redaction tests for token, private key, preview secret, and auth secret values in `apps/cms/lib/security/secret-redaction.test.ts`
- [ ] T005 Implement secret redaction helper in `apps/cms/lib/security/secret-redaction.ts`
- [ ] T006 [P] Add preview token payload type and TTL tests in `apps/cms/lib/security/preview-token.test.ts`
- [ ] T007 [P] Add matching blog preview token verification tests in `apps/blog/lib/preview-token.test.ts`
- [ ] T008 Implement stateless signed preview token issue/verify helper in `apps/cms/lib/security/preview-token.ts`
- [ ] T009 Implement matching stateless signed preview token verify helper in `apps/blog/lib/preview-token.ts`
- [ ] T010 Export security helpers from `apps/cms/lib/security/index.ts`

**Checkpoint**: redaction과 token helper가 준비되어 user story 구현을 시작할 수 있다.

---

## Phase 3: User Story 1 - 관리자 전용 CMS 쓰기 보장 (Priority: P1) MVP

**Goal**: 모든 CMS repository write mutation이 관리자 login과 immutable user id를 모두 확인한 뒤에만 실행된다.

**Independent Test**: 관리자 session, login-only mismatch, id-only mismatch, unauthenticated, misconfigured 상태로 save/publish/archive/media/settings mutation guard를 검증한다.

### Tests for User Story 1

- [ ] T011 [P] [US1] Add admin identity mismatch tests for login-only and id-only matches in `apps/cms/lib/auth/admin-identity.test.ts`
- [ ] T012 [P] [US1] Add mutation guard repository-not-called tests for unauthenticated, forbidden, expired, and misconfigured decisions in `apps/cms/lib/auth/mutation-guard.test.ts`
- [ ] T013 [P] [US1] Add protected content operation tests covering create, update, delete, media, and settings operations in `apps/cms/lib/auth/content-operation-guard.test.ts`
- [ ] T014 [P] [US1] Add editor action auth failure preservation tests for save, publish, unpublish, archive, and media upload in `apps/cms/app/actions/editor-actions.test.ts`

### Implementation for User Story 1

- [ ] T015 [US1] Harden admin identity parsing and mismatch messaging in `apps/cms/lib/auth/admin-identity.ts`
- [ ] T016 [US1] Ensure guardMutation never invokes repository operations for non-authorized decisions in `apps/cms/lib/auth/mutation-guard.ts`
- [ ] T017 [US1] Ensure all protected content operations use the same guard in `apps/cms/lib/auth/protected-content-operations.ts`
- [ ] T018 [US1] Redact auth failure messages before returning editor action responses in `apps/cms/app/actions/editor-actions.ts`
- [ ] T019 [US1] Export any renamed protected operation test subject from `apps/cms/lib/auth/index.ts`

**Checkpoint**: User Story 1은 CMS mutation guard tests만으로 독립 검증 가능하다.

---

## Phase 4: User Story 2 - 제한된 GitHub write 권한 사용 (Priority: P2)

**Goal**: GitHub App credential readiness를 검증하고, 누락/권한 부족/rate limit 실패를 secret 없이 보존 가능한 실패로 정규화한다.

**Independent Test**: 필수 환경변수 누락, invalid config, unauthorized, rate limit, ready token 상태를 각각 검증한다.

### Tests for User Story 2

- [ ] T020 [P] [US2] Add GitHub App credential missing-config tests in `apps/cms/lib/content-adapter/github-app-token.test.ts`
- [ ] T021 [P] [US2] Add GitHub App token ready, unauthorized, invalid-config, and rate-limit tests in `apps/cms/lib/content-adapter/github-app-token.test.ts`
- [ ] T022 [P] [US2] Add repository failure redaction tests for GitHub token and private key values in `apps/cms/lib/content-adapter/repository-error.test.ts`
- [ ] T023 [P] [US2] Add GitHub adapter authorization header and secret-safe failure tests in `apps/cms/lib/content-adapter/github-adapter.test.ts`

### Implementation for User Story 2

- [ ] T024 [US2] Implement GitHub App installation token readiness helper in `apps/cms/lib/content-adapter/github-app-token.ts`
- [ ] T025 [US2] Extend repository failure normalization with secret redaction in `apps/cms/lib/content-adapter/repository-error.ts`
- [ ] T026 [US2] Update GitHub adapter to consume ready credential state without exposing raw token in failures in `apps/cms/lib/content-adapter/github-adapter.ts`
- [ ] T027 [US2] Export GitHub App token helper from `apps/cms/lib/content-adapter/index.ts`
- [ ] T028 [US2] Add GitHub App environment variable guidance to `apps/cms/README.md`

**Checkpoint**: User Story 2는 content-adapter tests만으로 독립 검증 가능하다.

---

## Phase 5: User Story 3 - 안전한 draft preview 접근 (Priority: P3)

**Goal**: CMS에서 30분 TTL signed preview token을 발급하고 public blog의 `/preview/[slug]`에서만 draft preview를 검증/렌더링한다.

**Independent Test**: valid token, expired token, slug mismatch, stale contentSha, invalid signature, unsafe MDX, no-store cache policy를 검증한다.

### Tests for User Story 3

- [ ] T029 [P] [US3] Add CMS preview token action tests for slug, exp, contentSha, nonce, and no secret exposure in `apps/cms/app/actions/editor-actions.test.ts`
- [ ] T030 [P] [US3] Add blog preview loader tests for valid, expired, slug mismatch, stale contentSha, and invalid signature states in `apps/blog/lib/preview.test.ts`
- [ ] T031 [P] [US3] Add preview route tests for private no-store cache policy and draft body non-exposure on invalid access in `apps/blog/app/preview/[slug]/page.test.tsx`
- [ ] T032 [P] [US3] Add MDX safety preview regression tests for script, event handler, unsafe URL, and unsupported component in `packages/markdown/src/mdx-safety.test.ts`
- [ ] T033 [P] [US3] Add generated output boundary tests proving preview URLs/content stay out of RSS, Sitemap, JSON-LD, OG, and analytics in `apps/blog/app/generated-output-routes.test.ts`

### Implementation for User Story 3

- [ ] T034 [US3] Add CMS preview token issue action in `apps/cms/app/actions/editor-actions.ts`
- [ ] T035 [US3] Add preview link/action wiring to editor screen without exposing token secret in `apps/cms/components/editor/editor-screen.tsx`
- [ ] T036 [US3] Implement draft preview loader using token verification and markdown safety in `apps/blog/lib/preview.ts`
- [ ] T037 [US3] Implement `/preview/[slug]` route with private no-store response in `apps/blog/app/preview/[slug]/page.tsx`
- [ ] T038 [US3] Ensure public analytics binding does not emit public article events for preview route in `apps/blog/app/components/post-analytics-events.tsx`
- [ ] T039 [US3] Ensure robots and generated output route exclusions still cover `/preview` in `apps/blog/app/robots.txt/route.ts`

**Checkpoint**: User Story 3은 preview token과 `/preview/[slug]` route tests로 독립 검증 가능하다.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: 문서, 검증, scope guard를 마무리

- [ ] T040 [P] Update security hardening implementation notes in `specs/013-security-hardening/quickstart.md`
- [ ] T041 [P] Update CMS README security environment variable notes in `apps/cms/README.md`
- [ ] T042 Run `pnpm --filter @blog-platform/cms typecheck` and record result in `specs/013-security-hardening/quickstart.md`
- [ ] T043 Run `pnpm --filter @blog-platform/cms lint` and record result in `specs/013-security-hardening/quickstart.md`
- [ ] T044 Run `pnpm --filter @blog-platform/cms test` and record result in `specs/013-security-hardening/quickstart.md`
- [ ] T045 Run `pnpm --filter @blog-platform/blog typecheck` and record result in `specs/013-security-hardening/quickstart.md`
- [ ] T046 Run `pnpm --filter @blog-platform/blog lint` and record result in `specs/013-security-hardening/quickstart.md`
- [ ] T047 Run `pnpm --filter @blog-platform/blog test` and record result in `specs/013-security-hardening/quickstart.md`
- [ ] T048 Run `pnpm --filter @blog-platform/markdown typecheck` and record result in `specs/013-security-hardening/quickstart.md`
- [ ] T049 Run `pnpm --filter @blog-platform/markdown test` and record result in `specs/013-security-hardening/quickstart.md`
- [ ] T050 Verify no multi-admin workflow, approval workflow, audit dashboard, security database, or object storage migration was added across `apps`, `packages`, and `content`
- [ ] T051 Verify no raw GitHub token, private key, preview secret, or session secret appears in client-facing strings across `apps/blog`, `apps/cms`, and generated outputs

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 즉시 시작 가능
- **Foundational (Phase 2)**: Setup 이후 진행하며 모든 사용자 스토리를 block
- **User Story 1 (Phase 3)**: Foundational 이후 시작, MVP scope
- **User Story 2 (Phase 4)**: Foundational 이후 시작 가능, GitHub adapter 파일을 공유하므로 US1과 병렬 가능
- **User Story 3 (Phase 5)**: Foundational 이후 시작 가능, preview action이 editor action 파일을 공유하므로 US1 이후 순차 진행 권장
- **Polish (Phase 6)**: 선택한 user story 구현 완료 후 진행

### User Story Dependencies

- **User Story 1 (P1)**: Foundational 완료 후 독립 구현 가능
- **User Story 2 (P2)**: Foundational 완료 후 독립 구현 가능, CMS auth guard와 runtime 의존은 낮음
- **User Story 3 (P3)**: Foundational 완료 후 구현 가능, CMS preview action은 US1 action hardening 이후 진행 권장

### Within Each User Story

- 테스트 작업을 먼저 작성하고 실패를 확인한다.
- helper/contract 구현을 먼저 완료한다.
- 앱 entrypoint 연결을 그 다음 수행한다.
- 각 user story checkpoint에서 독립 검증을 수행한다.

### Parallel Opportunities

- T002, T003은 서로 다른 파일이라 병렬 가능
- T006, T007은 app별 preview token tests라 병렬 가능
- US1의 T011-T014 테스트 작업은 병렬 가능
- US2의 T020-T023 테스트 작업은 병렬 가능
- US3의 T029-T033 테스트 작업은 서로 다른 영역이라 병렬 가능
- T040, T041은 문서 파일이 달라 병렬 가능

---

## Parallel Example: User Story 1

```bash
Task: "T011 [P] [US1] Add admin identity mismatch tests in apps/cms/lib/auth/admin-identity.test.ts"
Task: "T012 [P] [US1] Add mutation guard repository-not-called tests in apps/cms/lib/auth/mutation-guard.test.ts"
Task: "T013 [P] [US1] Add protected content operation tests in apps/cms/lib/auth/content-operation-guard.test.ts"
Task: "T014 [P] [US1] Add editor action auth failure preservation tests in apps/cms/app/actions/editor-actions.test.ts"
```

## Parallel Example: User Story 3

```bash
Task: "T030 [P] [US3] Add blog preview loader tests in apps/blog/lib/preview.test.ts"
Task: "T031 [P] [US3] Add preview route tests in apps/blog/app/preview/[slug]/page.test.tsx"
Task: "T032 [P] [US3] Add MDX safety preview regression tests in packages/markdown/src/mdx-safety.test.ts"
Task: "T033 [P] [US3] Add generated output boundary tests in apps/blog/app/generated-output-routes.test.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Validate CMS mutation guard independently

### Incremental Delivery

1. Setup + Foundational으로 redaction/token helper 기반 정렬
2. US1로 CMS repository write guard 강화
3. US2로 GitHub App credential readiness와 secret-safe failure 강화
4. US3로 draft preview token과 isolated preview route 완성
5. Polish phase에서 package별 validation과 scope guard 확인

### Scope Guard

- 다중 관리자 권한을 만들지 않는다.
- 승인 workflow를 만들지 않는다.
- audit dashboard를 만들지 않는다.
- 별도 보안 DB를 만들지 않는다.
- object storage 전환을 하지 않는다.
- raw secret을 client-facing surface에 포함하지 않는다.
