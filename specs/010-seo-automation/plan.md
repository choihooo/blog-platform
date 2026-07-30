# Implementation Plan: SEO 자동화

**Branch**: `010-seo-automation` | **Date**: 2026-07-30 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/010-seo-automation/spec.md`

## Summary

발행 콘텐츠의 검색/공유/피드 산출물과 CMS SEO 점검을 `packages/seo-engine`에 모으고, 공개 블로그와 CMS가
같은 계산 결과를 사용하게 한다. `packages/markdown`는 기존 콘텐츠 검증, published-only filtering,
heading/TOC/reading time 분석을 계속 담당하고, `packages/seo-engine`는 metadata, JSON-LD, RSS/Sitemap
entry, robots policy, OG image payload, SEO score/report를 생성한다. `packages/analytics`는 GA4/GTM
초기화 payload, 공개 독자 이벤트 계약, CMS 외부 콘솔 링크 생성을 담당하며 API 기반 대시보드와 자체
분석 저장소는 제외한다.

## Technical Context

**Language/Version**: TypeScript 6.0, React 19, Next.js App Router, Node.js, ESM

**Primary Dependencies**: 기존 `@blog-platform/markdown`, `@blog-platform/seo-engine`,
`@blog-platform/analytics`, `@blog-platform/design-system`, `@blog-platform/editor`, Next.js metadata
및 route handler 표면

**Storage**: Repository file storage. 글 원본은 `content/posts/*.mdx`, 사이트 설정은
`content/site.json`, taxonomy는 `content/categories.json`와 `content/tags.json`에 둔다. SEO 산출물,
RSS, Sitemap, robots, OG image, 분석 데이터는 repository에 생성 파일로 저장하지 않는다.

**Testing**: Vitest unit tests for shared packages, Node route contract tests for `apps/blog`,
Testing Library/Vitest for CMS editor SEO panel, package별 `typecheck`, `lint`, `test`

**Target Platform**: 단일 운영자 public blog와 private CMS web app, Vercel/Node.js runtime

**Project Type**: 모노레포 web application feature with shared package contracts

**Performance Goals**: CMS SEO report는 일반 MVP 글에서 2초 이내에 표시된다. 발행 글 100개, category
20개, tag 50개 기준 RSS/Sitemap/SEO report generation은 로컬 개발 환경에서 사용자가 체감할 수 있는
지연 없이 완료된다.

**Constraints**: `published` 글만 공개 산출물에 포함, `draft`/`archived` 공개 노출 금지, 공개 blog
runtime에서 GitHub credential/CMS session/database/API analytics lookup 불필요, SEO score는
rule-based deterministic 0-100, GA4/Search Console API 통합 대시보드와 AI SEO 생성 제외

**Scale/Scope**: 단일 운영자 기술 블로그 MVP. SEO metadata/JSON-LD/RSS/Sitemap/robots/OG payload,
CMS SEO report, GA4/GTM event emission, external console link만 포함한다.

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- **MVP 범위 규율**: 통과. 자체 분석 대시보드, API 기반 지표 조회, AI SEO 생성, 내부 링크 자동 추천,
  예약 발행, 다중 작성자 workflow를 도입하지 않는다.
- **파일 기반 콘텐츠 권위**: 통과. 모든 SEO 산출물은 repository 콘텐츠와 사이트 설정에서 생성하며 별도
  CMS database나 generated file commit을 만들지 않는다.
- **공유 패키지 소유권**: 통과. SEO 계산은 `packages/seo-engine`, 분석 이벤트/링크는
  `packages/analytics`, 콘텐츠 분석은 `packages/markdown`, UI 표시와 route 연결은 app 경계에 둔다.
- **안전한 발행 경계**: 통과. `packages/markdown`의 published-only selection을 기준으로 공개 산출물을
  만들고 초안/보관/preview token 콘텐츠를 RSS/Sitemap/JSON-LD/analytics에서 제외한다.
- **생성형 SEO 및 분석 산출물**: 통과. metadata, JSON-LD, RSS, Sitemap, robots, OG image, rule-based
  SEO score, GA4/GTM event emission을 구현 범위로 삼되 직접 파일 commit과 API 대시보드는 제외한다.
- **한국어 문서화 및 완료 workflow**: 통과. 모든 신규 산출물은 한국어로 작성하고 완료 시 변경사항을
  commit한다.

## Project Structure

### Documentation (this feature)

```text
specs/010-seo-automation/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── seo-engine.md
│   ├── generated-output-routes.md
│   ├── analytics-events.md
│   └── cms-seo-panel.md
└── tasks.md
```

### Source Code (repository root)

```text
packages/seo-engine/
├── src/
│   ├── index.ts
│   ├── metadata.ts
│   ├── json-ld.ts
│   ├── feed.ts
│   ├── sitemap.ts
│   ├── robots.ts
│   ├── og-image.ts
│   ├── score.ts
│   ├── report.ts
│   └── *.test.ts
└── package.json

packages/analytics/
├── src/
│   ├── index.ts
│   ├── events.ts
│   ├── provider.ts
│   ├── console-links.ts
│   └── *.test.ts
└── package.json

apps/blog/
├── app/
│   ├── layout.tsx
│   ├── posts/[slug]/page.tsx
│   ├── categories/[slug]/page.tsx
│   ├── tags/[slug]/page.tsx
│   ├── rss.xml/route.ts
│   ├── sitemap.xml/route.ts
│   ├── robots.txt/route.ts
│   ├── og/[slug]/route.ts
│   └── generated-output-routes.test.ts
└── lib/
    ├── content.ts
    ├── seo.ts
    └── analytics.ts

apps/cms/
├── components/editor/
│   ├── editor-screen.tsx
│   ├── seo-panel.tsx
│   └── seo-panel.test.tsx
└── lib/editor/
    ├── seo-report.ts
    ├── seo-report.test.ts
    ├── analytics-links.ts
    └── analytics-links.test.ts

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

**Structure Decision**: SEO와 analytics domain 계산은 shared package에 둔다. `apps/blog`는 public route와
metadata 연결만 담당하고, `apps/cms`는 editor document 또는 repository post를 shared package 입력으로
변환해 SEO panel과 외부 콘솔 링크를 보여준다. `packages/markdown`에 이미 있는 content validation,
published filtering, MDX analysis, reading time, TOC는 중복하지 않는다.

## Complexity Tracking

헌법 위반이 없어 추가 복잡도 정당화 항목은 없다.

## Phase 0: Research

See [research.md](./research.md).

## Phase 1: Design & Contracts

See [data-model.md](./data-model.md), [seo-engine.md](./contracts/seo-engine.md),
[generated-output-routes.md](./contracts/generated-output-routes.md),
[analytics-events.md](./contracts/analytics-events.md), [cms-seo-panel.md](./contracts/cms-seo-panel.md),
and [quickstart.md](./quickstart.md).

## Post-Design Constitution Check

- **MVP 범위 규율**: 통과. contracts는 rule-based SEO, generated output, 이벤트 발행, 외부 콘솔 링크만
  다루며 API 대시보드, AI 생성, 자동 추천을 추가하지 않는다.
- **파일 기반 콘텐츠 권위**: 통과. data model의 입력은 repository 콘텐츠와 사이트 설정이며 산출물은
  요청 시 생성되는 표현으로 정의했다.
- **공유 패키지 소유권**: 통과. `SEO Report`, `Generated SEO Output`, `Analytics Event`,
  `External Console Link`가 각각 shared package와 app 연결 경계를 가진다.
- **안전한 발행 경계**: 통과. public route contracts는 published-only 입력을 요구하고 preview/draft/
  archived 노출 금지를 명시한다.
- **생성형 SEO 및 분석 산출물**: 통과. RSS/Sitemap/robots/OG 파일 commit을 금지하고, GA4/Search
  Console API 조회는 Post-MVP로 유지한다.
- **한국어 문서화 및 완료 workflow**: 통과. 모든 산출물은 한국어로 작성됐다.
