# Implementation Plan: Security Hardening

**Branch**: `013-security-hardening` | **Date**: 2026-07-30 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/013-security-hardening/spec.md`

## Summary

CMS repository write 경계를 강화하고 draft preview를 30분 TTL signed token으로 제한한다. 기존
`apps/cms/lib/auth`의 관리자 identity/guard 흐름은 유지하되 mutation 전 차단과 secret-safe failure
mapping을 보강한다. GitHub write는 기존 `apps/cms/lib/content-adapter` 경계를 확장해 GitHub App
installation token 준비 상태와 최소 권한 실패를 안전하게 정규화한다. Preview는 CMS에서 token을
발급하고 `apps/blog`의 별도 `/preview/[slug]` 표면에서만 검증하며, public
outputs/analytics/generated routes에는 포함하지 않는다.

## Technical Context

**Language/Version**: TypeScript 6.0, React 19, Next.js 16 App Router, Node.js, ESM

**Primary Dependencies**: 기존 `@blog-platform/markdown`, `@blog-platform/editor`,
`@blog-platform/design-system`, `apps/cms/lib/auth`, `apps/cms/lib/content-adapter`, Node.js
`crypto`

**Storage**: 별도 저장소 없음. 콘텐츠 원본은 `content/posts/*.mdx`, 관리자 identity는
`content/site.json`, GitHub App 및 preview secrets는 runtime environment에서 읽는다. Preview token은
stateless signed payload로 검증하며 DB에 저장하지 않는다.

**Testing**: Vitest unit tests for `apps/cms`, `apps/blog`, `packages/markdown`; route/component
tests for preview; package별 `typecheck`, `lint`, `test`

**Target Platform**: 단일 운영자 CMS와 public blog web app, Vercel/Node.js runtime

**Project Type**: 모노레포 web application security feature with shared app boundary contracts

**Performance Goals**: 관리자 mutation guard와 preview token verification은 사용자 체감 지연 없이
완료된다. Preview route는 draft 1건을 검증/렌더링하며 public listing/generated outputs를 재계산하지
않는다.

**Constraints**: 다중 관리자, 승인 workflow, audit dashboard, 별도 보안 DB, object storage 전환
없음. Secret은 client bundle, UI 오류, logs, analytics payload, generated output, repository
content에 포함하지 않는다. Preview token TTL은 30분이며 content identifier 불일치 시 무효다.

**Scale/Scope**: 단일 운영자 MVP. CMS mutation guard, GitHub App credential readiness, installation
token helper, preview token 발급/검증, preview route cache policy, secret exposure guard를 포함한다.

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- **MVP 범위 규율**: 통과. 다중 관리자, 승인 workflow, audit dashboard, 별도 보안 DB, object
  storage를 추가하지 않는다.
- **파일 기반 콘텐츠 권위**: 통과. 콘텐츠 원본은 repository 파일이며 preview token은 stateless라
  별도 저장소를 만들지 않는다.
- **공유 패키지 소유권**: 통과. MDX safety는 `packages/markdown`를 재사용하고, 앱별 security
  boundary는 `apps/cms`와 `apps/blog`에 둔다. 둘 이상에서 공유할 필요가 없는 token 발급/검증은 작은
  앱 helper로 둔다.
- **안전한 발행 경계**: 통과. draft preview는 TTL/token/content identifier/cache policy로 제한하고,
  public generated outputs와 analytics에서 제외한다.
- **생성형 SEO 및 분석 산출물**: 통과. generated outputs/analytics 동작은 published-only 경계를
  유지한다.
- **한국어 문서화 및 완료 workflow**: 통과. 신규 산출물은 한국어로 작성하고 완료 시 변경사항을
  commit한다.

## Project Structure

### Documentation (this feature)

```text
specs/013-security-hardening/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── cms-mutation-security.md
│   ├── github-write-credential.md
│   └── draft-preview-access.md
└── tasks.md
```

### Source Code (repository root)

```text
apps/cms/
├── app/actions/
│   ├── editor-actions.ts
│   └── editor-actions.test.ts
├── lib/auth/
│   ├── admin-identity.ts
│   ├── mutation-guard.ts
│   ├── protected-content-operations.ts
│   └── *.test.ts
├── lib/content-adapter/
│   ├── github-app-token.ts
│   ├── github-adapter.ts
│   ├── repository-error.ts
│   └── *.test.ts
└── lib/security/
    ├── preview-token.ts
    ├── secret-redaction.ts
    └── *.test.ts

apps/blog/
├── app/preview/[slug]/
│   ├── page.tsx
│   └── page.test.tsx
└── lib/
    ├── preview.ts
    ├── preview-token.ts
    └── *.test.ts

packages/markdown/
└── src/
    ├── mdx-safety.ts
    └── mdx-safety.test.ts
```

**Structure Decision**: 기존 auth/content-adapter/markdown 경계를 재사용한다. Preview token은 CMS
발급과 blog 검증 양쪽에서 같은 payload 규칙을 써야 하지만, 새 shared package를 만들지 않고 작은 동형
helper를 각 app 경계에 둔다. 구현 중 중복이 커지면 `packages/security`가 아니라
`packages/markdown`과 같은 기존 shared package로 옮길 근거를 다시 검토한다.

## Complexity Tracking

헌법 위반이 없어 추가 복잡도 정당화 항목은 없다.

## Phase 0: Research

See [research.md](./research.md).

## Phase 1: Design & Contracts

See [data-model.md](./data-model.md),
[cms-mutation-security.md](./contracts/cms-mutation-security.md),
[github-write-credential.md](./contracts/github-write-credential.md),
[draft-preview-access.md](./contracts/draft-preview-access.md), and
[quickstart.md](./quickstart.md).

## Post-Design Constitution Check

- **MVP 범위 규율**: 통과. design artifacts는 단일 관리자, 최소 GitHub write, stateless preview만
  다룬다.
- **파일 기반 콘텐츠 권위**: 통과. data model은 repository content와 runtime secrets를 입력으로
  정의하고 security DB를 만들지 않는다.
- **공유 패키지 소유권**: 통과. contracts는 CMS mutation, GitHub write credential, public preview
  route를 분리한다.
- **안전한 발행 경계**: 통과. draft/archived 기본 공개 차단과 preview 예외 경계를 명시했다.
- **생성형 SEO 및 분석 산출물**: 통과. preview route는 RSS/Sitemap/JSON-LD/OG/analytics 대상에서
  제외된다.
- **한국어 문서화 및 완료 workflow**: 통과. 모든 신규 산출물은 한국어로 작성됐다.
