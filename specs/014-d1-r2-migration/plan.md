# Implementation Plan: d1-r2-migration

**Branch**: `014-d1-r2-migration` | **Date**: 2026-07-31 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/014-d1-r2-migration/spec.md`

## Summary

Supabase 중심 블로그를 D1 + R2 아키텍처로 전환한다. 구조화 데이터(글/태그/연결/관리자/미디어 메타)는
D1에, 이미지는 R2에 보관한다. 기존 글 URL은 유지하되 CMS와 공개 앱 모두 동일한 Content Adapter를
통해 데이터 소스가 전환되도록 하고, 7일간 이중 보관 및 1분 롤백 경로를 둔다.

## Technical Context

**Language/Version**: TypeScript, React 19, Next.js App Router, Node.js

**Primary Dependencies**: 기존 `@blog-platform/editor`, `@blog-platform/markdown`,
`@blog-platform/design-system`, `apps/cms/lib/auth`, `apps/cms/lib/content-adapter`, `wrangler`,
migration/ETL 스크립트 런타임

**Storage**: 읽기/쓰기 메타데이터는 D1, 이미지 바이너리는 R2. Supabase Storage는 전환 대상에서 완전
분리.

**Testing**: Vitest, Testing Library, package별 `typecheck`, `lint`, `test`

**Target Platform**: 단일 운영자 CMS + 공개 블로그 웹 앱(+ `/categories/[categoryPath]` 라우트),
마이그레이션은 local/CI 실행

**Project Type**: 모노레포 web application + migration tooling

**Performance Goals**: 일반 환경에서 핵심 목록/상세 조회는 즉시 반영되어야 하며, 마이그레이션 1회
전환에서는 1주일 내 정합성 99.5% 이상을 유지한다. 핵심 API p95 기준: `listPosts` 600ms,
`getPostBySlug` 500ms, `getPostsByTag`/`getPostsByCategoryPath` 700ms, 쓰기 API `createPost` 1.2s,
`updatePost` 1.5s.

**Constraints**: 주 1~2개 글 발행 리듬, 댓글 없음, 이미지 위주 운영, 공개 노출은 published 글만,
단일 운영자 범위, 비용 경량 사용

**Scale/Scope**: 단일 운영자 MVP, 기존 블로그 조회·작성·수정·삭제 및 카테고리(최대 2-depth) 페이지
유지, 예약 발행/다국어 확장/뉴스레터/구독 기능은 제외

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- **MVP 범위 규율**: 통과. 기능 범위는 코어 글 중심 운영으로 유지하고, 댓글/다중 작성자/구독/AI
  생성을 도입하지 않는다.
- **파일 기반 콘텐츠 권위**: 조건부 미통과. 공개 미디어의 영속 저장소를 객체 저장소로 이동하므로
  헌법 원문(공개 미디어 경량/기본 위치 고정)에서의 예외가 필요하다. 예외 사유는 마이그레이션 핵심
  요구사항이다.
- **공유 패키지 소유권**: 통과. `packages/editor`와 `packages/markdown` 경계는 유지되고, 저장소 전환
  로직은 앱 경계 내 adapter로 격리한다.
- **안전한 발행 경계**: 통과. published-only 노출, 드래프트 보호, 관리자 접근 제어는 기존 흐름을
  유지한다.
- **생성형 SEO 및 분석 산출물**: 통과. SEO/JSON-LD/Feed 생성 전략은 기존 공개 파이프라인을 유지한다.
- **한국어 문서화 및 완료 workflow**: 통과. 모든 산출물은 한국어로 작성하고 완료 기준을 기록한다.

## Project Structure

### Documentation (this feature)

```text
specs/014-d1-r2-migration/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── content-adapter-contract.md
│   ├── media-mapping-contract.md
│   └── rollback-switch-contract.md
└── tasks.md
```

### Source Code (repository root)

```text
apps/blog/
├── app/
│   ├── page.tsx
│   ├── posts/[slug]/page.tsx
│   ├── rss.xml/route.ts
│   ├── sitemap.xml/route.ts
│   └── robots.txt/route.ts
├── lib/
│   ├── content.ts
│   ├── content-source.ts
│   └── content-source.test.ts
└── ...

apps/cms/
├── app/actions/
│   ├── editor-actions.ts
│   └── editor-actions.test.ts
├── lib/
│   ├── content-adapter/
│   │   ├── content-adapter.interface.ts
│   │   ├── content-adapter.ts
│   │   ├── d1-r2-adapter.ts
│   │   ├── migration-adapter.ts
│   │   ├── github-fallback-adapter.ts
│   │   ├── types.ts
│   │   └── *.test.ts
│   ├── migration/
│   │   ├── extract-from-supabase.ts
│   │   ├── map-media.ts
│   │   ├── upload-media-to-r2.ts
│   │   ├── import-to-d1.ts
│   │   └── dual-run-verification.ts
│   └── admin-ops/
│       ├── migration-switch.ts
│       ├── rollout-checks.ts
│       └── rollback.ts
│       └── *.test.ts

scripts/
└── migration/
    ├── run-migration.ts
    ├── verify-migration.ts
    ├── dry-run.ts
    └── report.ts
```

**Structure Decision**: 기존 `apps/blog`/`apps/cms` 구조를 유지하고, 콘텐츠 접근은 `content-adapter`
계층 하나에서 D1, R2, 기존 방식(GitHub fallback) 선택이 가능하도록 추상화한다.

## Complexity Tracking

| Violation                                     | Why Needed                                             | Simpler Alternative Rejected Because                                             |
| --------------------------------------------- | ------------------------------------------------------ | -------------------------------------------------------------------------------- |
| 파일 기반 콘텐츠 권위의 공개 미디어 위치 예외 | 기존 원칙 대비 D1/R2 전환 목표가 본 기능의 핵심 가치임 | 기존 방식으로 유지하면 비용 최적화와 마이그레이션 목표를 달성할 수 없음          |
| 단일 `content-adapter` 추가 분기              | 롤백 경로를 위해 런타임에 소스 분기를 제어해야 함      | CMS와 blog에 개별 분기를 넣으면 운영 동기화 비용이 증가하고 정합성 검증이 어려움 |

## Phase 0: Research

See [research.md](./research.md).

## Phase 1: Design & Contracts

See [data-model.md](./data-model.md),
[content-adapter-contract.md](./contracts/content-adapter-contract.md),
[media-mapping-contract.md](./contracts/media-mapping-contract.md),
[rollback-switch-contract.md](./contracts/rollback-switch-contract.md), and
[quickstart.md](./quickstart.md).

## Post-Design Constitution Check

- **MVP 범위 규율**: 통과. 핵심은 운영자 글 중심 기능(목록/상세/CRUD/미디어)이고 코어 이외 기능은
  제외한다.
- **파일 기반 콘텐츠 권위**: 조건부 통과. 공개 미디어는 R2 객체 키 기반으로 보존되며, 원문 글
  콘텐츠는 D1 및 기존 편집 경로를 통해 canonical source로 관리한다.
- **공유 패키지 소유권**: 통과. `packages/editor` 및 `packages/markdown`은 기존 책임을 유지한다.
- **안전한 발행 경계**: 통과. published 전용 공개, 관리자 인증, draft 차단은 기존 계약을 유지한다.
- **생성형 SEO 및 분석 산출물**: 통과. 이번 설계는 저장/조회 및 이미지 참조 정합성에 집중한다.
- **한국어 문서화 및 완료 workflow**: 통과. 산출물은 한국어로 작성한다.
