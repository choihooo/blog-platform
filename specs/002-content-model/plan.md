# Implementation Plan: Content Model

**Branch**: `002-content-model` | **Date**: 2026-07-30 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/002-content-model/spec.md`

## Summary

`content/`를 repository의 콘텐츠 원본으로 만들고, `content/posts/*.mdx`, `content/authors/*.md`,
`content/categories.json`, `content/tags.json`, `content/site.json`의 입력 계약을 확정한다. 콘텐츠
schema와 상태별 검증, slug 정책은 `packages/markdown`에서 소유해 이후 `apps/blog`, `apps/cms`, SEO
산출물이 같은 검증 결과를 재사용하게 한다.

## Technical Context

**Language/Version**: TypeScript 6.0, Node.js, ESM

**Primary Dependencies**: `zod` for schema validation, `gray-matter` for frontmatter parsing,
existing pnpm/Turborepo workspace

**Storage**: Repository file storage under `content/`; no database and no object storage

**Testing**: Vitest unit tests for schema validation, slug generation, duplicate detection, and
published-only filtering; root validation through existing Turborepo scripts

**Target Platform**: Local development and Vercel-compatible Node/Next.js workspace

**Project Type**: Monorepo shared package plus file-based content fixtures

**Performance Goals**: Validate the MVP content set in under 1 second locally; keep operations
linear over `content/posts/*.mdx`

**Constraints**: Public blog must be able to read local files without GitHub credentials; MVP must
not introduce PostgreSQL, CMS database, object storage, multi-author permissions, scheduled
publishing, or AI content generation

**Scale/Scope**: Single-operator MVP blog, one author profile, managed category/tag files, and a
small-to-medium technical blog content set

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- **I. MVP 범위 규율**: PASS. Plan covers file content, schema validation, and slug policy only.
  Excluded MVP items remain out of scope.
- **II. 파일 기반 콘텐츠 권위**: PASS. `content/posts/*.mdx` and frontmatter status are the source
  of truth. No runtime GitHub API dependency is introduced for public blog reading.
- **III. 공유 패키지 소유권**: PASS. Shared content parsing and validation belong to
  `packages/markdown`, preventing duplicated app logic.
- **IV. 안전한 발행 경계**: PASS. `draft` and `archived` are explicitly excluded from published
  content selection; unsafe MDX rendering itself remains a later phase.
- **V. 생성형 SEO 및 분석 산출물**: PASS. Content metadata provides deterministic inputs for later
  SEO and analytics work without building those features now.
- **Platform Constraints**: PASS. Uses existing TypeScript/pnpm/Turborepo/Next.js workspace.
- **Documentation and Completion Workflow**: PASS. New project documents are written in Korean, with
  technical identifiers preserved.

## Project Structure

### Documentation (this feature)

```text
specs/002-content-model/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── content-files.md
│   └── markdown-package.md
└── tasks.md
```

### Source Code (repository root)

```text
content/
├── authors/
│   └── ho.md
├── posts/
│   └── hello-world.mdx
├── categories.json
├── tags.json
└── site.json

packages/markdown/
├── src/
│   └── index.ts
├── README.md
├── package.json
└── tsconfig.json
```

**Structure Decision**: 콘텐츠 파일은 repository root의 `content/`가 소유하고, 콘텐츠를 읽고
검증하는 공유 계약은 `packages/markdown`가 소유한다. `apps/blog`와 `apps/cms`는 이 phase에서 직접
수정하지 않고 이후 phase에서 같은 package API를 사용한다.

## Phase 0: Research

Phase 0 결과는 [research.md](./research.md)에 기록했다. 모든 기술 선택과 scope 결정은 constitution
gate 안에서 해결되었고, unresolved clarification은 없다.

## Phase 1: Design & Contracts

Phase 1 산출물:

- [data-model.md](./data-model.md): Post, Author, Site Config, Category, Tag entity와
  validation/state transition 정의
- [contracts/content-files.md](./contracts/content-files.md): `content/` 파일 형식과 예시 계약
- [contracts/markdown-package.md](./contracts/markdown-package.md): `packages/markdown` public API
  계약
- [quickstart.md](./quickstart.md): 구현 후 검증 시나리오와 기대 결과

## Constitution Check (Post-Design)

- **I. MVP 범위 규율**: PASS. Design artifacts do not add excluded MVP features.
- **II. 파일 기반 콘텐츠 권위**: PASS. All entities and contracts keep repository files as source of
  truth.
- **III. 공유 패키지 소유권**: PASS. Contracts define a shared package API instead of app-local
  duplication.
- **IV. 안전한 발행 경계**: PASS. Published-only filtering is part of the contract and data model.
- **V. 생성형 SEO 및 분석 산출물**: PASS. Metadata is structured for later generated outputs while
  generation remains out of this feature.
- **Platform Constraints**: PASS. Planned directories match the existing monorepo.
- **Documentation and Completion Workflow**: PASS. Artifacts are Korean and ready for
  `$speckit-tasks`.

## Complexity Tracking

No constitution violations.
