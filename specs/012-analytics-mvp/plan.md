# Implementation Plan: Analytics MVP

**Branch**: `012-analytics-mvp` | **Date**: 2026-07-30 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/012-analytics-mvp/spec.md`

## Summary

공개 블로그 독자 행동을 GA4 또는 GTM으로 전송하고, CMS에서 공개 글과 외부 분석 콘솔로 이동할 수 있는
MVP 분석 흐름을 완성한다. `packages/analytics`는 이벤트 이름, provider 초기화, provider payload,
스크롤 milestone, 링크 분류, 외부 콘솔 링크 계약을 소유한다. `apps/blog`는 공개 글 상세와 독자
상호작용에 analytics client binding을 연결하고, `apps/cms`는 발행 글에만 외부 링크를 표시한다. 자체
분석 저장소, 자체 대시보드, GA4/Search Console API 조회, 서버 측 이벤트 수집 기능은 범위에서 제외한다.

## Technical Context

**Language/Version**: TypeScript 6.0, React 19, Next.js 16 App Router, Node.js, ESM

**Primary Dependencies**: 기존 `@blog-platform/analytics`, `@blog-platform/markdown`,
`@blog-platform/design-system`, `@blog-platform/editor`, Next.js public app surface, GA4/GTM browser
collection surfaces

**Storage**: 분석 이벤트와 외부 콘솔 데이터는 저장하지 않는다. 설정 입력은 `content/site.json`의
`analytics.provider`와 공개 환경 설정을 사용한다. CMS 링크는 현재 글 frontmatter와 사이트 URL에서
계산한다.

**Testing**: Vitest unit tests for `packages/analytics`, `apps/blog`, `apps/cms`; React component tests for
analytics interaction binding; package별 `typecheck`, `lint`, `test`

**Target Platform**: 단일 운영자 public blog와 CMS web app, Vercel/Node.js runtime, browser analytics
collection

**Project Type**: 모노레포 web application feature with shared package contracts

**Performance Goals**: 공개 글 상세 렌더링은 분석 설정 누락과 관계없이 실패하지 않는다. 스크롤, 링크,
코드 복사 이벤트 binding은 사용자 상호작용을 지연시키지 않고 한 페이지 표시 안에서 milestone 중복
전송을 막는다.

**Constraints**: 분석 provider는 `ga4` 또는 `gtm` 중 하나만 활성화한다. provider id가 누락되면 이벤트
전송은 disabled 상태가 된다. 이벤트 payload는 공개 글 맥락만 포함하고 개인 식별 정보, CMS 관리자 정보,
secret을 포함하지 않는다. 분석 데이터 저장소/대시보드/API 조회/서버 수집 기능은 도입하지 않는다.

**Scale/Scope**: MVP 이벤트 9종(`article_view`, `scroll_50`, `scroll_90`, `code_copy`, `toc_click`,
`internal_link_click`, `external_link_click`, `search`, `share`)과 CMS 외부 링크 3종(공개 글, GA4 페이지
성과, Search Console 검색 성과)을 포함한다.

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- **MVP 범위 규율**: 통과. 자체 analytics dashboard, GA4/Search Console API dashboard, 별도 DB, 서버
  수집 기능을 도입하지 않는다.
- **파일 기반 콘텐츠 권위**: 통과. 글 맥락은 `content/posts/*.mdx` frontmatter와 `content/site.json`에서
  파생하며, 분석 이벤트나 콘솔 데이터를 repository에 저장하지 않는다.
- **공유 패키지 소유권**: 통과. 이벤트 이름, payload, provider, console link 규칙은
  `packages/analytics`가 소유하고 앱은 연결만 담당한다.
- **안전한 발행 경계**: 통과. 발행 글만 public analytics context와 CMS 글별 외부 링크 대상이 되며,
  draft/archived 글을 공개 분석 대상으로 만들지 않는다.
- **생성형 SEO 및 분석 산출물**: 통과. GA4/GTM 이벤트 발행과 외부 콘솔 링크를 제공하고, MVP에서 분석
  데이터를 저장하지 않는다.
- **한국어 문서화 및 완료 workflow**: 통과. 신규 산출물은 한국어로 작성하고 완료 시 변경사항을 commit한다.

## Project Structure

### Documentation (this feature)

```text
specs/012-analytics-mvp/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── analytics-events.md
│   ├── public-analytics-binding.md
│   └── cms-analytics-links.md
└── tasks.md
```

### Source Code (repository root)

```text
packages/analytics/
├── src/
│   ├── types.ts
│   ├── provider.ts
│   ├── events.ts
│   ├── scroll-milestones.ts
│   ├── link-classification.ts
│   ├── console-links.ts
│   ├── test-fixtures.ts
│   └── *.test.ts
└── README.md

apps/blog/
├── app/
│   ├── layout.tsx
│   ├── posts/[slug]/page.tsx
│   └── components/
│       ├── analytics-provider.tsx
│       ├── post-analytics-events.tsx
│       └── code-copy-button.tsx
└── lib/
    ├── analytics.ts
    └── analytics.test.ts

apps/cms/
├── components/editor/
│   ├── editor-screen.tsx
│   └── editor-screen.test.tsx
└── lib/editor/
    ├── analytics-links.ts
    └── analytics-links.test.ts

content/
└── site.json
```

**Structure Decision**: `packages/analytics`의 기존 임시 event/link helper를 명세 이벤트 9종에 맞게
확장하고, 앱별 DOM binding과 UI 노출은 `apps/blog`와 `apps/cms`에 둔다. 외부 서비스 API 조회나 데이터
저장은 구현하지 않고 URL 기반 콘솔 이동만 제공한다.

## Complexity Tracking

헌법 위반이 없어 추가 복잡도 정당화 항목은 없다.

## Phase 0: Research

See [research.md](./research.md).

## Phase 1: Design & Contracts

See [data-model.md](./data-model.md), [analytics-events.md](./contracts/analytics-events.md),
[public-analytics-binding.md](./contracts/public-analytics-binding.md),
[cms-analytics-links.md](./contracts/cms-analytics-links.md), and [quickstart.md](./quickstart.md).

## Post-Design Constitution Check

- **MVP 범위 규율**: 통과. design artifacts는 이벤트 발행과 외부 링크만 다루며, 분석 저장소/대시보드/API
  조회는 제외한다.
- **파일 기반 콘텐츠 권위**: 통과. data model은 repository 콘텐츠와 사이트 설정을 입력으로 정의하고,
  분석 결과를 저장하지 않는다.
- **공유 패키지 소유권**: 통과. contracts는 package event contract, public app binding, CMS link
  contract를 분리한다.
- **안전한 발행 경계**: 통과. draft/archived/slug 없음 상태에서 글별 외부 분석 링크를 비활성화하는
  규칙을 명시했다.
- **생성형 SEO 및 분석 산출물**: 통과. GA4/GTM 이벤트 발행과 외부 콘솔 링크를 MVP 범위로 제한했다.
- **한국어 문서화 및 완료 workflow**: 통과. 모든 신규 산출물은 한국어로 작성됐다.
