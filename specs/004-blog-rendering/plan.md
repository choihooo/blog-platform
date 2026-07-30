# Implementation Plan: Blog Rendering

**Branch**: `004-blog-rendering` | **Date**: 2026-07-30 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/004-blog-rendering/spec.md`

## Summary

공개 블로그 앱을 실제 repository 콘텐츠 기반 화면으로 전환한다. `content/` 파일 묶음은 기존
`packages/markdown`의 content collection validation, published-only filtering, MDX analysis를 통해
검증하고, `apps/blog`는 홈, 글 상세, category, tag 공개 route를 렌더링한다. 공개 런타임은 GitHub
API, CMS 인증, database, object storage에 의존하지 않는다.

## Technical Context

**Language/Version**: TypeScript 6.0, Node.js, ESM

**Primary Dependencies**: Next.js App Router, React, `@blog-platform/markdown`, MDX rendering helper
compatible with React Server Components, `remark-gfm`, `rehype-slug`

**Storage**: Repository file storage under `content/posts/*.mdx`, `content/authors/*.md`,
`content/categories.json`, `content/tags.json`, `content/site.json`; no database

**Testing**: Next.js build/typecheck/lint for `apps/blog`; root workspace build/typecheck/lint;
route contract checks through local dev or production build output

**Target Platform**: Vercel-compatible Next.js app and local development server

**Project Type**: Monorepo web application surface consuming shared packages

**Performance Goals**: Build-time/static route generation should handle MVP small-to-medium content
sets; each valid published post should render deterministically from local files without network
calls

**Constraints**: Public routes must expose only `status: published`; invalid or unsafe content must
fail before public output; public rendering must not require GitHub credentials, CMS session,
database, object storage, AI, analytics API, RSS, sitemap, JSON-LD, or OG image generation

**Scale/Scope**: Single-operator technical blog MVP with a small-to-medium repository-backed MDX
content set

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- **I. MVP 범위 규율**: PASS. Plan covers public blog rendering only and excludes comments,
  newsletter, payments, multi-user workflows, object storage, PostgreSQL, separate CMS database,
  scheduled publishing, AI generation, and integrated analytics dashboard.
- **II. 파일 기반 콘텐츠 권위**: PASS. Public blog reads local repository content files and does not
  require GitHub API credentials.
- **III. 공유 패키지 소유권**: PASS. Content validation, published filtering, MDX analysis, TOC, and
  reading time stay in `packages/markdown`; `apps/blog` consumes package contracts.
- **IV. 안전한 발행 경계**: PASS. Draft, archived, invalid, and unsafe MDX are blocked from public
  routes and generated public output.
- **V. 생성형 SEO 및 분석 산출물**: PASS. This phase displays deterministic TOC and reading time,
  but defers SEO scoring, RSS, Sitemap, robots.txt, JSON-LD, OG image, and analytics events to later
  phases.
- **Platform Constraints**: PASS. Uses TypeScript, pnpm, Turborepo, Next.js App Router, Node.js, and
  established MDX/remark/rehype tooling.
- **Documentation and Completion Workflow**: PASS. New Spec Kit artifacts are written in Korean with
  technical identifiers preserved.

## Project Structure

### Documentation (this feature)

```text
specs/004-blog-rendering/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── public-blog-routes.md
└── tasks.md
```

### Source Code (repository root)

```text
apps/blog/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── posts/[slug]/page.tsx
│   ├── categories/[slug]/page.tsx
│   └── tags/[slug]/page.tsx
├── lib/
│   └── content.ts
├── package.json
└── tsconfig.json

packages/markdown/
└── src/
    ├── collection.ts
    ├── mdx.ts
    ├── types.ts
    └── index.ts

content/
├── posts/*.mdx
├── authors/*.md
├── categories.json
├── tags.json
└── site.json
```

**Structure Decision**: Route and presentation code belongs to `apps/blog`. Shared content parsing,
validation, published-only filtering, generated metadata, and MDX safety analysis remain in
`packages/markdown`. The public app may add an app-local loader that adapts repository files to the
shared package input contract, but it must not duplicate markdown/content domain validation.

## Phase 0: Research

Phase 0 결과는 [research.md](./research.md)에 기록했다. 주요 결정은 다음과 같다.

- Public rendering reads local files and validates the full content collection before producing
  routes.
- Rendering routes include `/`, `/posts/[slug]`, `/categories/[slug]`, and `/tags/[slug]` only.
- Draft, archived, invalid, and unsafe posts return no public route and direct access resolves as
  not found.
- MDX UI rendering should reuse `packages/markdown` analysis before rendering and attach slugged
  heading anchors to match TOC links.

Unresolved clarification은 없다.

## Phase 1: Design & Contracts

Phase 1 산출물:

- [data-model.md](./data-model.md): Public Blog Content Collection, Public Post View, Public Route,
  Taxonomy Listing, Render Metadata, Public Rendering Failure 정의
- [contracts/public-blog-routes.md](./contracts/public-blog-routes.md): 공개 blog route별 입력,
  출력, 공개 노출 정책 계약
- [quickstart.md](./quickstart.md): 구현 후 route, published-only policy, build validation 검증
  시나리오

## Constitution Check (Post-Design)

- **I. MVP 범위 규율**: PASS. Design artifacts do not introduce excluded MVP scope.
- **II. 파일 기반 콘텐츠 권위**: PASS. All public rendering contracts operate from repository files.
- **III. 공유 패키지 소유권**: PASS. App contracts depend on `packages/markdown` for validation and
  generated metadata.
- **IV. 안전한 발행 경계**: PASS. Public route contracts explicitly block draft, archived, invalid,
  unknown, and unsafe content.
- **V. 생성형 SEO 및 분석 산출물**: PASS. TOC and reading time are displayed; later SEO and
  generated output phases remain out of scope.
- **Platform Constraints**: PASS. Design remains within the existing
  TypeScript/pnpm/Turborepo/Next.js workspace.
- **Documentation and Completion Workflow**: PASS. Generated artifacts are Korean and ready for
  `$speckit-tasks`.

## Complexity Tracking

No constitution violations.
