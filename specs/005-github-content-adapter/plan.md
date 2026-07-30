# Implementation Plan: GitHub Content Adapter

**Branch**: `005-github-content-adapter` | **Date**: 2026-07-30 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/005-github-content-adapter/spec.md`

## Summary

CMS가 repository 콘텐츠 파일을 읽고 쓰기 위한 전용 content adapter를 만든다. 이 phase는 공개 블로그
runtime을 변경하지 않고, `apps/cms` 안에 CMS 전용 adapter 경계를 두어 글, 설정, taxonomy, media
파일에 대한 list/read/create/update/delete 동작, file SHA 기반 optimistic locking, 실패 상태 정규화,
local adapter와 GitHub Contents API adapter contract를 확정한다.

## Technical Context

**Language/Version**: TypeScript 6.0.3, Node.js, Next.js App Router workspace

**Primary Dependencies**: 기존 `@blog-platform/markdown` content validation API, GitHub REST
Contents API, Node.js filesystem API, Vitest

**Storage**: repository content files under `content/` and media files under `public/media`; no CMS
database, no object storage

**Testing**: Vitest package/app-level tests plus root `pnpm typecheck`, `pnpm lint`, `pnpm test`,
`pnpm build`

**Target Platform**: Local development and Vercel-compatible CMS server runtime

**Project Type**: Monorepo web application with CMS-internal service module

**Performance Goals**: MVP sample content list/read completes in under 3 seconds during normal
repository availability; stale writes are rejected 100% of the time

**Constraints**: Public blog must continue reading local content only; CMS writes must stay inside
approved `content/` and `public/media` paths; writes must include last-read SHA for existing files;
GitHub create/update/delete content operations must be serialized per target file workflow to avoid
conflicting writes

**Scale/Scope**: Single-operator MVP blog, one content repository branch, `content/posts/*.mdx`,
`content/site.json`, `content/categories.json`, `content/tags.json`, `content/authors/*.md`, and
repository media paths

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- **I. MVP 범위 규율**: PASS. Plan covers CMS repository content read/write boundary only and
  excludes multi-user permissions, separate CMS database, object storage, scheduled publishing, AI
  generation, and integrated analytics dashboard.
- **II. 파일 기반 콘텐츠 권위**: PASS. GitHub repository remains the content source of truth.
  Existing file updates require a last-read SHA and stale writes are rejected.
- **III. 공유 패키지 소유권**: PASS. The adapter is CMS-only behavior, so it stays under `apps/cms`
  instead of introducing a new shared package outside the approved package structure. Shared
  Markdown validation remains in `packages/markdown`.
- **IV. 안전한 발행 경계**: PASS. Public blog runtime is not given GitHub credentials. CMS mutation
  behavior is prepared for later auth guards and does not expose drafts publicly.
- **V. 생성형 SEO 및 분석 산출물**: PASS. This phase does not generate SEO outputs or analytics
  dashboards; it only preserves repository-backed content changes that later phases consume.
- **Platform Constraints**: PASS. Uses the existing TypeScript, pnpm, Turborepo, Next.js, Node.js,
  Vercel-compatible workspace.
- **Documentation and Completion Workflow**: PASS. Planning artifacts are written in Korean where
  possible, preserving technical terms where translation would reduce accuracy.

## Project Structure

### Documentation (this feature)

```text
specs/005-github-content-adapter/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── content-adapter.md
│   └── repository-errors.md
└── tasks.md
```

### Source Code (repository root)

```text
apps/cms/
├── lib/
│   └── content-adapter/
│       ├── index.ts
│       ├── types.ts
│       ├── paths.ts
│       ├── local-adapter.ts
│       ├── github-adapter.ts
│       ├── commit-intent.ts
│       └── repository-error.ts
├── app/
│   └── page.tsx
├── package.json
├── tsconfig.json
└── vitest.config.ts

content/
├── posts/
├── authors/
├── categories.json
├── tags.json
└── site.json

public/
└── media/
```

**Structure Decision**: CMS write behavior is local to `apps/cms/lib/content-adapter` because the
public blog must not depend on GitHub write access and the constitution's shared package list should
remain stable. The module exports a narrow CMS-facing contract and reuses `packages/markdown` for
content validation rather than duplicating schema logic.

## Post-Design Constitution Check

- **I. MVP 범위 규율**: PASS. `research.md`, `data-model.md`, `contracts/`, `quickstart.md` keep the
  feature limited to repository-backed CMS content operations.
- **II. 파일 기반 콘텐츠 권위**: PASS. Contracts require repository paths, SHA-based updates, and
  conflict rejection.
- **III. 공유 패키지 소유권**: PASS. Design keeps CMS-only mutation behavior in `apps/cms` and
  points shared validation back to `packages/markdown`.
- **IV. 안전한 발행 경계**: PASS. Contracts do not add public draft exposure or GitHub credentials
  to `apps/blog`.
- **V. 생성형 SEO 및 분석 산출물**: PASS. Generated SEO, analytics events, and dashboards remain
  later phases.
- **Platform Constraints**: PASS. Design uses the existing workspace and validation commands.

## Complexity Tracking

No constitution violations or added complexity exceptions.
