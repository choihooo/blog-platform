# 구현 계획: Repo Foundation

**Branch**: `001-repo-foundation` | **Date**: 2026-07-30 | **Spec**: [spec.md](./spec.md)

**Input**: `/specs/001-repo-foundation/spec.md`의 기능 명세

## 요약

단일 운영자 블로그 플랫폼을 위한 초기 monorepo foundation을 만든다. 범위는 root
workspace command, 공개 블로그 app boundary, 비공개 CMS app boundary, 필수 공유 package
boundary, 기존 문서 보존, 두 app과 모든 package가 workspace validation에 참여함을 증명하는
검증 경로다. 구현은 project constitution의 고정 platform constraint를 따르고 Post-MVP
scope를 도입하지 않는다.

## 기술 맥락

**Language/Version**: TypeScript on Node.js

**Primary Dependencies**: pnpm workspace, Turborepo, Next.js App Router, shared TypeScript
configuration, ESLint, Prettier

**Storage**: 이 phase에서는 repository file만 사용한다. database나 external storage는 없다.

**Testing**: build, type checking, linting, formatting, local app startup을 위한 root validation
command

**Target Platform**: local development 및 Vercel-compatible web application

**Project Type**: 두 web application과 공유 package를 가진 monorepo

**Performance Goals**: 신규 contributor가 2분 이내에 모든 app/package boundary를 식별하고,
dependency 설치 후 5분 이내에 두 초기 app에 로컬 접근할 수 있다.

**Constraints**: `docs/`를 보존한다. database, object storage, multi-user permission,
scheduled publishing, AI generation, integrated analytics dashboard를 도입하지 않는다. 초기 app은
GitHub credential이나 content file을 요구하지 않는다.

**Scale/Scope**: 공개 블로그 app 1개, 비공개 CMS app 1개, 공유 package 6개, root validation
workflow, 기존 문서

## 헌법 검토

*GATE: Phase 0 research 전에 통과해야 하며 Phase 1 design 후 재검토한다.*

- **I. MVP 범위 규율**: PASS. 이 phase는 foundation만 만들고 금지된 MVP 확장을 제외한다.
- **II. 파일 기반 콘텐츠 권위**: PASS. storage system을 도입하지 않으며 이후 content phase는
  repository file 기반으로 남는다.
- **III. 공유 패키지 소유권**: PASS. 필수 공유 package boundary가 계획에 포함되어 있다.
- **IV. 안전한 발행 경계**: PASS. public draft, preview, CMS mutation, publishing behavior를
  구현하지 않는다.
- **V. 생성형 SEO 및 분석 산출물**: PASS. SEO와 analytics output behavior는 이후 phase로
  미루고 ownership 위치만 예약한다.
- **Platform Constraints**: PASS. constitution이 정한 platform과 workspace 구조를 사용한다.
- **Development Workflow**: PASS. `apps/blog`, `apps/cms`, `docs/` 경계를 유지하고 foundation
  scope에 비례한 validation을 정의한다.
- **Documentation and Completion Workflow**: PASS. plan 산출물은 한국어로 작성하고 완료 시
  commit message 및 commit 절차를 따른다.

## 프로젝트 구조

### 문서 구조 (this feature)

```text
specs/001-repo-foundation/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── app-routes.md
│   └── workspace-commands.md
└── tasks.md
```

### Source Code (repository root)

```text
apps/
├── blog/
└── cms/

packages/
├── editor/
├── markdown/
├── seo-engine/
├── design-system/
├── analytics/
└── ai/

docs/
├── blog-platform-spec.md
└── implementation-roadmap.md

package.json
pnpm-workspace.yaml
turbo.json
tsconfig.base.json
```

**구조 결정**: constitution이 정한 monorepo 구조를 사용한다. 두 application, 여섯 공유
package, 기존 Markdown documentation folder는 roadmap의 Phase 0 boundary requirement를 직접
충족하고 이후 phase에 안정적인 ownership 위치를 제공한다.

## Phase 0: Research

Research는 [research.md](./research.md)에 정리되어 있다. unresolved technical clarification은
없다.

## Phase 1: Design & Contracts

Design artifacts:

- [data-model.md](./data-model.md): Workspace, application boundary, shared package boundary,
  validation workflow, documentation area model.
- [contracts/workspace-commands.md](./contracts/workspace-commands.md): install, validation,
  build, type check, lint, format, local development에 대한 root command contract.
- [contracts/app-routes.md](./contracts/app-routes.md): blog와 CMS app shell의 초기 local route
  contract.
- [quickstart.md](./quickstart.md): foundation end-to-end validation guide.

## 헌법 검토: Post-Design

- **I. MVP 범위 규율**: PASS. design artifact는 금지된 MVP capability를 추가하지 않는다.
- **II. 파일 기반 콘텐츠 권위**: PASS. 대체 content authority를 도입하지 않는다.
- **III. 공유 패키지 소유권**: PASS. data model과 validation contract에 공유 package
  boundary가 명시되어 있다.
- **IV. 안전한 발행 경계**: PASS. 초기 app shell은 placeholder일 뿐 private content나
  publishing workflow를 포함하지 않는다.
- **V. 생성형 SEO 및 분석 산출물**: PASS. generated output은 이 phase에서 구현하지 않고
  future phase를 위한 ownership 위치만 예약한다.
- **Platform Constraints**: PASS. contract는 TypeScript, pnpm, Turborepo, Next.js 및 package
  구조 요구와 일치한다.
- **Development Workflow**: PASS. quickstart validation은 foundation scope에 비례하며 문서화된
  app boundary를 보존한다.
- **Documentation and Completion Workflow**: PASS. 산출물은 한국어 기준을 따른다.

## Complexity Tracking

헌법 위반 사항이 없어 별도 정당화가 필요하지 않다.
