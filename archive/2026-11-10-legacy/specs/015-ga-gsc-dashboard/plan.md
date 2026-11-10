# Implementation Plan: GA/GSC 성과 대시보드

**Branch**: `[015-ga-gsc-dashboard]` | **Date**: 2026-07-31 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/015-ga-gsc-dashboard/spec.md`

## Summary

CMS 안에 인증된 운영자 전용 분석 대시보드를 추가해 최근 7일/28일 사이트 성과, 글별 방문/검색 성과,
발행 후 1일/7일/28일 성과 추적을 제공한다. 기존 analytics 패키지의 콘솔 링크 기능을 유지하면서, 새
분석 조회 계층은 GA4/GSC 원본 데이터를 집계 지표로 정규화하고 CMS 화면은 마지막 성공 데이터와 연결
상태를 함께 보여준다.

## Technical Context

**Language/Version**: TypeScript 6.0.3, Node.js 기반 Next.js App Router, React 19

**Primary Dependencies**: 기존 `@blog-platform/analytics`, `@blog-platform/editor`,
`@blog-platform/design-system`, Next.js App Router, Google OAuth/service account credential, GA4
Data API, Google Search Console Search Analytics API

**Storage**: 1차 표시 데이터는 외부 분석 서비스에서 조회한다. 반복 조회와 실패 fallback을 위해 D1
기반 `analytics_snapshots` 캐시를 사용한다. 서비스 미설정 또는 D1 미사용 환경에서는 캐시 없이 빈
상태와 외부 콘솔 링크를 표시한다.

**Testing**: `pnpm typecheck`, `pnpm test`, CMS Vitest component/unit tests, analytics package unit
tests, mocked GA/GSC contract tests

**Target Platform**: CMS web application, authenticated single-operator admin surface, Vercel/Node
runtime with optional Cloudflare D1 cache

**Project Type**: Monorepo web application with shared packages

**Performance Goals**: 운영자가 CMS 분석 화면에 진입한 뒤 30초 안에 핵심 지표를 확인한다. 정상
캐시가 있는 경우 첫 화면은 3초 안에 주요 요약을 표시한다.

**Constraints**: 방문자 개인 식별 정보는 표시하지 않는다. 초안은 기본 분석 목록에서 제외한다. 외부
분석 API quota 초과나 권한 오류가 CMS 전체 장애로 번지면 안 된다. MVP 헌법상 GA/GSC API 대시보드는
초기 범위 밖이므로 Post-MVP 확장으로 격리한다.

**Scale/Scope**: 단일 운영자 블로그, 수백 개 이하의 발행 글, 기본 기간 최근 7일/28일, 발행 후
1일/7일/28일 추적. 실시간 분석, 다중 사이트, 다중 운영자 권한, 방문자 단위 분석은 제외한다.

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- **I. MVP 범위 규율**: 조건부 통과. 헌법은 MVP에서 GA4/Search Console API 통합 대시보드를
  금지하지만, 이 feature는 D1/R2 전환 이후 Post-MVP 확장으로 명시되었고 기존 MVP 발행 흐름을
  복잡하게 만들지 않도록 `/analytics` surface와 전용 조회/cache 계층으로 격리한다.
- **II. 파일 기반 콘텐츠 권위**: 통과. 분석 데이터는 콘텐츠 원본이 아니며 글 본문/상태/slug 권위는
  기존 콘텐츠 source에 남는다. 대시보드는 발행 글 metadata를 읽어 외부 성과와 매칭한다.
- **III. 공유 패키지 소유권**: 통과. GA/GSC 정규화, 지표 타입, 콘솔 링크 확장은
  `packages/analytics`에 두고 CMS는 표시와 인증 경계에 집중한다.
- **IV. 안전한 발행 경계**: 통과. CMS 인증 경계를 재사용하고 초안은 기본 분석 대상에서 제외한다.
  공개 앱에는 분석 dashboard 데이터를 노출하지 않는다.
- **V. 생성형 SEO 및 분석 산출물**: 조건부 통과. 기존 GA4/GTM 이벤트 및 외부 콘솔 링크는 유지하고,
  API 기반 수치 표시를 Post-MVP 추가 산출물로 확장한다.
- **Documentation and Completion Workflow**: 통과. 산출물은 한국어로 작성한다.

## Project Structure

### Documentation (this feature)

```text
specs/015-ga-gsc-dashboard/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── analytics-dashboard-contract.md
│   └── analytics-provider-contract.md
└── tasks.md
```

### Source Code (repository root)

```text
apps/cms/
├── app/analytics/
│   ├── page.tsx
│   └── page.test.tsx
├── components/analytics/
│   ├── analytics-dashboard.tsx
│   ├── metric-summary.tsx
│   ├── post-performance-table.tsx
│   ├── publication-performance.tsx
│   └── analytics-empty-state.tsx
├── components/shell/
│   ├── navigation.ts
│   └── navigation.test.ts
└── lib/analytics/
    ├── analytics-dashboard-loader.ts
    ├── analytics-cache.ts
    ├── analytics-match.ts
    └── google-analytics-provider.ts

packages/analytics/
└── src/
    ├── dashboard-types.ts
    ├── ga4-reporting.ts
    ├── gsc-reporting.ts
    ├── performance-normalization.ts
    └── console-links.ts

apps/cms/lib/content-adapter/
└── d1-r2-adapter.ts
```

**Structure Decision**: CMS는 인증된 화면과 loader/cache orchestration을 담당한다. 외부 분석 지표
타입, GA/GSC 응답 정규화, 기간 비교 계산은 공유 analytics package에 둔다. D1 캐시가 필요할 경우 기존
D1 adapter 경계에 analytics snapshot 접근을 추가한다.

## Complexity Tracking

| Violation                    | Why Needed                                                                               | Simpler Alternative Rejected Because                                                                      |
| ---------------------------- | ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Post-MVP GA/GSC API 대시보드 | 운영자가 CMS 안에서 실제 성과 수치를 보고 글 운영 판단을 해야 한다                       | 외부 콘솔 링크만으로는 글별 GA/GSC 비교, 발행 후 성과 추적, 매칭 불완전 상태를 한 화면에서 제공할 수 없다 |
| D1 analytics snapshot cache  | 외부 API 지연, quota, 권한 오류 시 마지막 성공 데이터와 안정적인 첫 화면을 제공해야 한다 | 매 화면마다 외부 API만 직접 조회하면 quota와 실패 상태가 사용자 경험 전체를 지배한다                      |

## Phase 0: Research

완료: [research.md](./research.md)

## Phase 1: Design & Contracts

완료:

- [data-model.md](./data-model.md)
- [contracts/analytics-dashboard-contract.md](./contracts/analytics-dashboard-contract.md)
- [contracts/analytics-provider-contract.md](./contracts/analytics-provider-contract.md)
- [quickstart.md](./quickstart.md)

## Constitution Check Re-evaluation

- Post-MVP 범위 격리, 인증된 CMS surface, 집계 데이터만 표시, 공유 analytics package 소유권, D1
  cache fallback 설계로 모든 gate가 통과한다.
- 구현 phase에서는 헌법 충돌이 다시 생기지 않도록 공개 앱에 분석 원본 데이터가 노출되지 않는지,
  초안이 기본 분석 대상에 포함되지 않는지, 개인 식별 데이터가 저장/표시되지 않는지 테스트해야 한다.
