# Quickstart: Repo Foundation Validation

## Prerequisites

- repository root에서 실행한다.
- workspace가 요구하는 package manager를 설치한다.
- 이 phase에는 GitHub credential, database, object storage, analytics credential, AI credential,
  content file이 필요하지 않다.

## 1. Workspace Boundary 확인

foundation이 다음 경계를 포함하는지 확인한다.

```text
apps/blog
apps/cms
packages/editor
packages/markdown
packages/seo-engine
packages/design-system
packages/analytics
packages/ai
docs
```

Expected outcome: 모든 필수 app, package, documentation boundary가 존재한다.

## 2. Dependency 설치

실행:

```sh
pnpm install
```

Expected outcome: external product credential 없이 repository root에서 dependency가 설치된다.

## 3. Root Validation 실행

실행:

```sh
pnpm build
pnpm typecheck
pnpm lint
pnpm format:check
```

Expected outcome: 각 command가 관련 app과 package를 포함하고 foundation 기준에서 성공한다.

## 4. Public Blog 시작

`apps/blog`에 대해 문서화된 development command를 실행한다.

Expected outcome: public blog initial page가 local `/`에서 접근 가능하며 content file이나 GitHub
credential을 요구하지 않는다.

## 5. CMS 시작

`apps/cms`에 대해 문서화된 development command를 실행한다.

Expected outcome: CMS initial page가 local `/`에서 접근 가능하며 Phase 0 validation에 authentication
setup 또는 GitHub credential을 요구하지 않는다.

## 6. MVP Scope 확인

foundation이 다음 항목을 도입하지 않았는지 확인한다.

- database 또는 object storage
- multi-user permission
- scheduled publishing
- AI content generation
- integrated analytics dashboard
- public comment, account, payment, newsletter, localization

Expected outcome: Phase 0은 foundation-only feature로 남고 task implementation을 시작할 준비가 된다.
