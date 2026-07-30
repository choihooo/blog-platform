# Implementation Plan: Generated Outputs

**Branch**: `011-generated-outputs` | **Date**: 2026-07-30 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/011-generated-outputs/spec.md`

## Summary

발행 글과 사이트 metadata를 기준으로 공개 블로그의 generated outputs를 완성한다. `packages/seo-engine`는
metadata, JSON-LD, RSS, Sitemap, robots, OG image payload의 결정적 생성 규칙을 제공하고,
`packages/markdown`는 heading, TOC, reading time, published-only filtering을 계속 담당한다.
`apps/blog`는 글 상세 metadata/JSON-LD, `/rss.xml`, `/sitemap.xml`, `/robots.txt`, `/og/[slug]`, TOC,
reading time 표시를 연결한다. SEO 점수, CMS SEO panel, GA4/GTM 이벤트, 외부 분석 콘솔 링크는 이
feature 범위에서 제외한다.

## Technical Context

**Language/Version**: TypeScript 6.0, React 19, Next.js 16 App Router, Node.js, ESM

**Primary Dependencies**: 기존 `@blog-platform/markdown`, `@blog-platform/seo-engine`,
`@blog-platform/design-system`, Next.js metadata 및 route handler 표면, MDX rendering pipeline

**Storage**: Repository file storage. 글 원본은 `content/posts/*.mdx`, 사이트 설정은 `content/site.json`,
taxonomy는 `content/categories.json`와 `content/tags.json`에 둔다. RSS, Sitemap, robots, JSON-LD, OG
image 파일은 repository에 commit하지 않는다.

**Testing**: Vitest unit tests for `packages/seo-engine` and `packages/markdown`, route contract tests for
`apps/blog`, package별 `typecheck`, `lint`, `test`

**Target Platform**: 단일 운영자 public blog web app, Vercel/Node.js runtime

**Project Type**: 모노레포 web application feature with shared package contracts

**Performance Goals**: 발행 글 100개, category 20개, tag 50개 기준 RSS/Sitemap/robots/metadata 생성은
로컬 개발 환경에서 사용자가 체감할 수 있는 지연 없이 완료된다. 긴 제목 OG image rendering은 정상
응답을 유지하고 텍스트 겹침 없이 표시된다.

**Constraints**: `published` 글만 공개 산출물에 포함, `draft`/`archived`/preview 공개 노출 금지, 공개
blog runtime에서 GitHub credential/CMS session/database 불필요, generated files repository commit 금지,
SEO 점수와 analytics MVP 제외

**Scale/Scope**: 단일 운영자 기술 블로그 MVP. 글별 metadata/JSON-LD/OG image URL, 사이트 단위
RSS/Sitemap/robots, 글 상세 TOC/reading time 표시를 포함한다.

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- **MVP 범위 규율**: 통과. Analytics dashboard, GA4/Search Console API 조회, AI 생성, 내부 링크 자동
  추천, 예약 발행, 다중 작성자 workflow를 도입하지 않는다.
- **파일 기반 콘텐츠 권위**: 통과. 모든 생성 산출물은 repository 콘텐츠와 사이트 설정에서 생성하며 별도
  CMS database나 generated file commit을 만들지 않는다.
- **공유 패키지 소유권**: 통과. 생성 규칙은 `packages/seo-engine`, 콘텐츠 분석은 `packages/markdown`,
  public route 연결은 `apps/blog`에 둔다.
- **안전한 발행 경계**: 통과. public output contract는 published-only 입력을 요구하고 draft,
  archived, preview 콘텐츠 노출 금지를 명시한다.
- **생성형 SEO 및 분석 산출물**: 통과. metadata, JSON-LD, RSS, Sitemap, robots, OG image, TOC, reading
  time을 generated output으로 제공하며 수동 파일 관리를 제거한다.
- **한국어 문서화 및 완료 workflow**: 통과. 신규 산출물은 한국어로 작성하고 완료 시 변경사항을 commit한다.

## Project Structure

### Documentation (this feature)

```text
specs/011-generated-outputs/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── seo-engine-generated-outputs.md
│   └── public-output-routes.md
└── tasks.md
```

### Source Code (repository root)

```text
packages/seo-engine/
├── src/
│   ├── metadata.ts
│   ├── json-ld.ts
│   ├── feed.ts
│   ├── sitemap.ts
│   ├── robots.ts
│   ├── og-image.ts
│   ├── subject.ts
│   ├── types.ts
│   └── *.test.ts
└── package.json

packages/markdown/
└── src/
    ├── collection.ts
    ├── headings.ts
    ├── toc.ts
    ├── reading-time.ts
    ├── mdx.ts
    └── *.test.ts

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
│   ├── generated-output-routes.test.ts
│   └── public-seo-output.test.tsx
└── lib/
    ├── content.ts
    ├── seo.ts
    └── seo.test.ts

content/
├── posts/*.mdx
├── authors/*.md
├── categories.json
├── tags.json
└── site.json
```

**Structure Decision**: Generated output 계산은 shared package에 두고, `apps/blog`는 public route와 page
metadata 연결만 담당한다. `packages/markdown`의 published-only selection, TOC, reading time, heading
slug 로직은 중복하지 않는다. `packages/seo-engine`의 기존 SEO score/report 모듈은 이번 작업에서 확장하지
않고 metadata/output 모듈만 검증한다.

## Complexity Tracking

헌법 위반이 없어 추가 복잡도 정당화 항목은 없다.

## Phase 0: Research

See [research.md](./research.md).

## Phase 1: Design & Contracts

See [data-model.md](./data-model.md), [seo-engine-generated-outputs.md](./contracts/seo-engine-generated-outputs.md),
[public-output-routes.md](./contracts/public-output-routes.md), and [quickstart.md](./quickstart.md).

## Post-Design Constitution Check

- **MVP 범위 규율**: 통과. design artifacts는 generated outputs에만 집중하고 SEO scoring/analytics를
  범위 밖으로 둔다.
- **파일 기반 콘텐츠 권위**: 통과. data model은 repository 콘텐츠와 사이트 설정을 입력으로 정의하고,
  산출물을 요청 시 생성되는 표현으로 정의했다.
- **공유 패키지 소유권**: 통과. 생성 규칙 contract와 public route contract가 package/app 경계를
  분리한다.
- **안전한 발행 경계**: 통과. draft, archived, preview exclusion을 data model, contracts, quickstart
  validation에 반복 명시했다.
- **생성형 SEO 및 분석 산출물**: 통과. RSS/Sitemap/robots/OG image 파일 commit을 금지하고 생성 route로
  제공한다.
- **한국어 문서화 및 완료 workflow**: 통과. 모든 신규 산출물은 한국어로 작성됐다.
