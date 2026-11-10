# Implementation Plan: Publish Workflow

**Branch**: `009-publish-workflow` | **Date**: 2026-07-30 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/009-publish-workflow/spec.md`

## Summary

CMS editor의 저장 흐름을 발행 workflow로 확장한다. 기존 `ContentAdapter`의 `prepare-publish`,
`prepare-unpublish`, `prepare-archive` 의도와 관리자 guard를 재사용하고, 발행 전에는 editor
document를 MDX로 직렬화한 뒤 published 필수값, slug 생성, 중복 slug를 검증한다. Publish, Unpublish,
Archive 성공 후에는 공개 blog 표면의 revalidation을 요청하고, repository 변경 성공과 공개 반영
실패를 분리해 CMS에서 재시도할 수 있게 한다.

## Technical Context

**Language/Version**: TypeScript, React 19, Next.js App Router, Node.js

**Primary Dependencies**: 기존 `@blog-platform/editor`, `@blog-platform/markdown`,
`@blog-platform/design-system`, `apps/cms/lib/content-adapter`, `apps/cms/lib/auth`, Next.js cache
revalidation primitives

**Storage**: GitHub repository 파일. 글 원본은 `content/posts/*.mdx`이고 발행 상태는 frontmatter의
`status`와 `publishedAt`으로 표현한다. 별도 CMS database는 사용하지 않는다.

**Testing**: Vitest, Testing Library, package별 `typecheck`, `lint`, `test`

**Target Platform**: 단일 운영자 CMS web app과 공개 blog app, Vercel/Node.js runtime

**Project Type**: 모노레포 web application feature

**Performance Goals**: 유효한 글의 Save/Publish/Unpublish/Archive 작업은 일반 개발 환경에서 10초
이내에 성공 또는 실패 상태를 반환한다. 공개 반영 요청은 정상 작업의 95% 이상에서 30초 안에 공개
표면을 최신 상태로 만든다.

**Constraints**: `published` 글만 공개 출력에 포함, `draft`/`archived` 공개 노출 금지, slug 중복
차단, SHA 기반 optimistic locking 유지, Save draft에서는 public revalidation 금지,
RSS/Sitemap/robots 파일 직접 commit 금지, 예약 발행과 승인 workflow 제외

**Scale/Scope**: 단일 운영자 MVP. Save, Publish, Unpublish, Archive, public revalidation,
revalidation retry, 실패 상태 표시만 포함하고 SEO scoring, generated output 구현, analytics
dashboard, AI 생성은 제외한다.

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- **MVP 범위 규율**: 통과. 예약 발행, 승인 workflow, 다중 작성자 권한, AI 생성, 분석 대시보드를
  도입하지 않는다.
- **파일 기반 콘텐츠 권위**: 통과. 글 상태 변경은 `content/posts/*.mdx` frontmatter와 본문
  commit으로 표현하며 별도 database를 만들지 않는다.
- **공유 패키지 소유권**: 통과. editor 직렬화는 `packages/editor`, published 검증과 slug 중복 판단은
  `packages/markdown`, CMS orchestration은 `apps/cms`, 공개 읽기 정책은 `apps/blog`가 담당한다.
- **안전한 발행 경계**: 통과. 관리자 guard, SHA conflict 처리, published-only 공개 필터를 유지하고
  `draft`/`archived` 공개 노출을 차단한다.
- **생성형 SEO 및 분석 산출물**: 통과. RSS/Sitemap/robots/OG는 파일 commit이 아니라 published 콘텐츠
  기반 공개 route와 후속 SEO engine phase에서 제공한다.
- **한국어 문서화 및 완료 workflow**: 통과. 산출물은 한국어로 작성하고 완료 시 변경사항을
  commit한다.

## Project Structure

### Documentation (this feature)

```text
specs/009-publish-workflow/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── publish-actions.md
│   └── public-refresh.md
└── tasks.md
```

### Source Code (repository root)

```text
apps/cms/
├── app/actions/
│   ├── editor-actions.ts
│   └── editor-actions.test.ts
├── components/editor/
│   ├── editor-screen.tsx
│   ├── editor-toolbar.tsx
│   ├── recovery-banner.tsx
│   ├── save-status.tsx
│   └── *.test.tsx
└── lib/
    ├── content-adapter/
    │   ├── commit-intent.ts
    │   ├── local-adapter.ts
    │   ├── github-adapter.ts
    │   ├── types.ts
    │   └── *.test.ts
    └── editor/
        ├── editor-save.ts
        ├── publish-workflow.ts
        ├── publish-workflow.test.ts
        ├── public-refresh.ts
        ├── public-refresh.test.ts
        └── index.ts

apps/blog/
├── app/
│   ├── page.tsx
│   ├── posts/[slug]/page.tsx
│   ├── categories/[slug]/page.tsx
│   ├── tags/[slug]/page.tsx
│   ├── rss.xml/route.ts
│   ├── sitemap.xml/route.ts
│   ├── robots.txt/route.ts
│   └── og/[slug]/route.ts
└── lib/
    └── content.ts

packages/editor/
└── src/
    ├── document.ts
    ├── editor-to-mdx.ts
    └── validation.ts

packages/markdown/
└── src/
    ├── collection.ts
    ├── post.ts
    ├── frontmatter.ts
    └── slug-policy.ts
```

**Structure Decision**: 기존 CMS editor save flow를 확장하되 발행 orchestration은
`apps/cms/lib/editor/publish-workflow.ts`에 둔다. 공개 반영 대상 계산과 revalidation 결과 mapping은
CMS 전용 helper로 분리하고, public blog는 계속 `packages/markdown`의 published-only selection을 통해
공개 경계를 보장한다.

## Complexity Tracking

헌법 위반이 없어 추가 복잡도 정당화 항목은 없다.

## Phase 0: Research

See [research.md](./research.md).

## Phase 1: Design & Contracts

See [data-model.md](./data-model.md), [publish-actions.md](./contracts/publish-actions.md),
[public-refresh.md](./contracts/public-refresh.md), and [quickstart.md](./quickstart.md).

## Post-Design Constitution Check

- **MVP 범위 규율**: 통과. contracts는 발행 상태 변경과 공개 반영만 다루며 예약 발행, 승인 workflow,
  분석 대시보드, AI 생성을 추가하지 않는다.
- **파일 기반 콘텐츠 권위**: 통과. data model의 `PublishablePost`는 repository MDX 파일을 canonical
  source로 사용한다.
- **공유 패키지 소유권**: 통과. published validation과 duplicate slug 판단은 markdown package를
  재사용하고, editor package는 MDX 직렬화 경계만 유지한다.
- **안전한 발행 경계**: 통과. contracts는 auth failure, forbidden, stale file, validation
  failure에서 repository mutation 또는 public refresh가 실행되지 않는 상태를 명시한다.
- **생성형 SEO 및 분석 산출물**: 통과. 공개 산출물 파일 직접 commit을 금지하고 published 콘텐츠 기반
  route 반영만 검증한다.
- **한국어 문서화 및 완료 workflow**: 통과. 모든 산출물은 한국어로 작성됐다.
