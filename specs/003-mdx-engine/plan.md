# Implementation Plan: Markdown/MDX Engine

**Branch**: `003-mdx-engine` | **Date**: 2026-07-30 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/003-mdx-engine/spec.md`

## Summary

`packages/markdown`를 확장해 MDX frontmatter 분리, metadata serialization, MDX AST 안전성 검증,
heading/TOC 생성, reading time 계산, code block 표시 준비, 렌더링 준비 결과를 하나의 공유 계약으로
제공한다. 공개 블로그와 CMS preview는 이 package API를 재사용해 같은 입력에서 같은 metadata와 본문
분석 결과를 얻고, 안전하지 않은 MDX는 공개 가능한 출력으로 넘어가기 전에 차단한다.

## Technical Context

**Language/Version**: TypeScript 6.0, Node.js, ESM

**Primary Dependencies**: 기존 `gray-matter`, `zod`, `github-slugger`; 추가 예정 `@mdx-js/mdx`,
`remark-gfm`, `remark-mdx`, `rehype-sanitize`, `rehype-slug`, `rehype-autolink-headings`,
`reading-time`, `shiki`

**Storage**: Repository file storage under `content/posts/*.mdx`; no database and no object storage

**Testing**: Vitest unit tests for frontmatter parsing/serialization, heading extraction, duplicate
heading slugs, TOC depth, reading time, unsafe MDX rejection, unsupported component handling, and
deterministic repeated output

**Target Platform**: Local development and Vercel-compatible Node/Next.js workspace

**Project Type**: Monorepo shared package consumed by public blog and CMS preview

**Performance Goals**: Process a typical MVP post in under 200 ms locally and keep heading/TOC
analysis linear over post body size

**Constraints**: Public blog runtime must not require GitHub credentials, a CMS database, remote MDX
runtime evaluation, arbitrary import/export, inline script, event handler, unsafe HTML, or unsupported
interactive component editing

**Scale/Scope**: Single-operator MVP technical blog with repository-backed MDX posts and a
small-to-medium content set

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- **I. MVP 범위 규율**: PASS. Plan covers shared Markdown/MDX processing only and excludes AI
  generation, analytics dashboard, CMS database, object storage, scheduled publishing, and multi-user
  editorial flows.
- **II. 파일 기반 콘텐츠 권위**: PASS. `content/posts/*.mdx` remains the source of truth and public
  blog reading stays local-file based.
- **III. 공유 패키지 소유권**: PASS. Shared parsing, validation, TOC, reading time, and rendering
  preparation belong to `packages/markdown`.
- **IV. 안전한 발행 경계**: PASS. Unsafe MDX, arbitrary execution, scripts, event handlers, and
  unsupported components are explicitly blocked before public rendering.
- **V. 생성형 SEO 및 분석 산출물**: PASS. TOC and reading time are deterministic generated metadata;
  SEO scoring and generated feeds remain later phases.
- **Platform Constraints**: PASS. Uses TypeScript, pnpm, Turborepo, Node.js, and Next.js-compatible
  package boundaries. The MDX pipeline wraps established unified/remark/rehype/MDX libraries instead
  of implementing a custom parser.
- **Documentation and Completion Workflow**: PASS. New Spec Kit artifacts are written in Korean with
  technical identifiers preserved.

## Project Structure

### Documentation (this feature)

```text
specs/003-mdx-engine/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── markdown-mdx-engine.md
│   └── mdx-safety-policy.md
└── tasks.md
```

### Source Code (repository root)

```text
packages/markdown/
├── src/
│   ├── index.ts
│   ├── post.ts
│   ├── result.ts
│   ├── schemas.ts
│   ├── slug.ts
│   ├── types.ts
│   ├── mdx.ts
│   ├── mdx-safety.ts
│   ├── toc.ts
│   ├── reading-time.ts
│   └── *.test.ts
├── README.md
├── package.json
├── tsconfig.json
└── vitest.config.ts

content/
└── posts/
    └── hello-world.mdx
```

**Structure Decision**: 기존 콘텐츠 모델 API는 `packages/markdown`에 남기고, MDX engine 관련 API를
같은 package 안의 전용 module로 추가한다. `apps/blog`와 `apps/cms`는 이 phase에서 직접 렌더링 UI를
구현하지 않고, 이후 phase에서 `packages/markdown`의 공통 결과를 사용한다.

## Phase 0: Research

Phase 0 결과는 [research.md](./research.md)에 기록했다. 주요 결정은 다음과 같다.

- MDX 처리는 custom parser가 아니라 MDX/unified/remark/rehype 생태계를 감싼다.
- frontmatter parsing은 기존 `gray-matter`를 유지하고 serialization API를 추가한다.
- heading/TOC는 MDX AST 기반으로 추출해 raw string parsing을 피한다.
- unsafe MDX는 sanitize만 믿지 않고 import/export, JSX event handler, script, unsupported component를
  명시 검증한다.
- runtime evaluation API는 MVP 렌더링 계약에서 제외한다.

Unresolved clarification은 없다.

## Phase 1: Design & Contracts

Phase 1 산출물:

- [data-model.md](./data-model.md): MDX Document, Frontmatter Metadata, Rendered Content, Heading,
  Table of Contents, Reading Time, Allowed Component, Validation Failure 정의
- [contracts/markdown-mdx-engine.md](./contracts/markdown-mdx-engine.md): `packages/markdown` public
  MDX engine API 계약
- [contracts/mdx-safety-policy.md](./contracts/mdx-safety-policy.md): 허용/차단 MDX 요소와 실패 code
  계약
- [quickstart.md](./quickstart.md): 구현 후 검증 시나리오와 기대 결과

## Constitution Check (Post-Design)

- **I. MVP 범위 규율**: PASS. Design artifacts do not introduce excluded MVP functionality.
- **II. 파일 기반 콘텐츠 권위**: PASS. All contracts operate on repository file input.
- **III. 공유 패키지 소유권**: PASS. API contracts are centered on `packages/markdown`.
- **IV. 안전한 발행 경계**: PASS. Safety policy blocks unsafe MDX before public output.
- **V. 생성형 SEO 및 분석 산출물**: PASS. Generated metadata is deterministic and limited to TOC and
  reading time for this phase.
- **Platform Constraints**: PASS. Design uses established MDX/unified libraries and existing
  TypeScript workspace boundaries.
- **Documentation and Completion Workflow**: PASS. Artifacts are Korean and ready for
  `$speckit-tasks`.

## Complexity Tracking

No constitution violations.
