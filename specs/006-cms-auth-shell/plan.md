# Implementation Plan: CMS Auth + Shell

**Branch**: `006-cms-auth-shell` | **Date**: 2026-07-30 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/006-cms-auth-shell/spec.md`

## Summary

CMS에 GitHub OAuth 기반 단일 관리자 인증과 기본 app shell을 추가한다. 이 phase는
`content/site.json`의 `adminGithubLogin`, `adminGithubUserId`를 관리자 기준값으로 사용하고, 보호
화면과 모든 CMS mutation 앞에서 login과 immutable user id를 모두 검증한다. UI는 `apps/cms` 안에
shell, navigation, 상태 화면을 만들고, 공유 UI primitive는 `packages/design-system`에 둔다.

## Technical Context

**Language/Version**: TypeScript 6.0.3, Node.js, Next.js 16.2.12 App Router, React 19.2.8

**Primary Dependencies**: Auth.js/NextAuth GitHub provider, existing `@blog-platform/markdown` site
config validation, existing `apps/cms/lib/content-adapter`, `@blog-platform/design-system`,
lucide-react, Vitest

**Storage**: `content/site.json` for admin identity; encrypted/session cookie state for CMS login;
no CMS database, no object storage

**Testing**: Vitest unit/contract tests for auth/session/guard behavior, component-level shell tests
where practical, plus root `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build`

**Target Platform**: Local development and Vercel-compatible Next.js CMS runtime

**Project Type**: Monorepo web application with one protected CMS app

**Performance Goals**: Registered admin reaches CMS shell within 10 seconds after OAuth callback;
guard checks complete before any protected content or mutation result is exposed; shell first view
stays lightweight enough for MVP local and deployed use

**Constraints**: Single administrator only; require both GitHub login and immutable user id; fail
closed when site config or session is unavailable; public blog remains credential-free; no CMS
database; no editor/media/publish workflow implementation in this phase; CMS UI uses approved
design-system primitives and default shadcn-compatible colors only

**Scale/Scope**: Single-operator MVP blog, one CMS app, protected routes for posts/settings shell,
and guard wrappers for existing and future CMS mutation handlers

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- **I. MVP 범위 규율**: PASS. Plan covers single-admin auth, guard enforcement, and CMS shell only.
  It excludes multi-user roles, approval workflow, CMS database, scheduled publishing, AI, and
  analytics dashboard.
- **II. 파일 기반 콘텐츠 권위**: PASS. Admin identity is read from `content/site.json`; content
  mutation remains repository-backed through the existing CMS adapter.
- **III. 공유 패키지 소유권**: PASS. Auth and route guard behavior is CMS-only and remains under
  `apps/cms`; reusable UI primitives belong in `packages/design-system`.
- **IV. 안전한 발행 경계**: PASS. CMS access requires configured GitHub admin identity, mutations
  are guarded, and the public blog does not receive CMS credentials.
- **V. 생성형 SEO 및 분석 산출물**: PASS. This phase does not alter generated SEO outputs or
  analytics behavior.
- **Platform Constraints**: PASS. Uses the existing TypeScript, pnpm, Turborepo, Next.js, Node.js,
  Vercel-compatible workspace.
- **Documentation and Completion Workflow**: PASS. Planning artifacts are written in Korean with
  technical identifiers preserved where useful.

## Project Structure

### Documentation (this feature)

```text
specs/006-cms-auth-shell/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── auth-guard.md
│   └── cms-shell.md
└── tasks.md
```

### Source Code (repository root)

```text
apps/cms/
├── app/
│   ├── api/
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.ts
│   ├── login/
│   │   └── page.tsx
│   ├── posts/
│   │   └── page.tsx
│   ├── settings/
│   │   └── page.tsx
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   └── shell/
│       ├── cms-shell.tsx
│       ├── sidebar.tsx
│       ├── top-bar.tsx
│       └── access-state.tsx
├── lib/
│   ├── auth/
│   │   ├── config.ts
│   │   ├── session.ts
│   │   ├── admin-identity.ts
│   │   ├── guard.ts
│   │   └── guard.test.ts
│   └── content-adapter/
├── proxy.ts
├── package.json
├── tsconfig.json
└── vitest.config.ts

packages/design-system/
├── src/
│   ├── index.ts
│   └── ui/
│       ├── button.tsx
│       ├── input.tsx
│       ├── dialog.tsx
│       ├── tabs.tsx
│       ├── dropdown-menu.tsx
│       ├── badge.tsx
│       └── form.tsx
└── package.json

content/
└── site.json
```

**Structure Decision**: CMS-specific authentication, session enrichment, route protection, and
mutation guard logic stay under `apps/cms` because they are private to the CMS boundary. Shared UI
components requested by the roadmap are owned by `packages/design-system` so future CMS editor and
publish phases reuse the same primitives instead of duplicating UI code.

## Post-Design Constitution Check

- **I. MVP 범위 규율**: PASS. `research.md`, `data-model.md`, contracts, and quickstart keep this
  feature limited to single-admin auth and shell navigation.
- **II. 파일 기반 콘텐츠 권위**: PASS. Admin identity source remains `content/site.json`; no
  separate user database is introduced.
- **III. 공유 패키지 소유권**: PASS. Reusable UI primitives are assigned to
  `packages/design-system`; CMS-only auth and guard logic remains in `apps/cms`.
- **IV. 안전한 발행 경계**: PASS. Contracts require fail-closed access decisions and mutation guard
  enforcement before repository writes.
- **V. 생성형 SEO 및 분석 산출물**: PASS. SEO and analytics outputs are untouched.
- **Platform Constraints**: PASS. Design remains within the approved TypeScript, pnpm, Turborepo,
  Next.js, Node.js, Vercel-compatible stack.

## Complexity Tracking

No constitution violations or added complexity exceptions.
