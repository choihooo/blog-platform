# 블로그 플랫폼

단일 운영자 기술 블로그를 위한 monorepo foundation이다. 공개 블로그, 비공개 CMS, 공유 package, 문서
영역을 분리해 이후 content, rendering, editor, SEO, analytics, publishing phase가 명확한 ownership
안에서 진행되도록 한다.

## Workspace 구조

```text
apps/
  blog/
  cms/

packages/
  editor/
  markdown/
  seo-engine/
  design-system/
  analytics/
  ai/

docs/
```

## Root command

```sh
pnpm install
pnpm build
pnpm typecheck
pnpm lint
pnpm format:check
```

## Local development

```sh
pnpm dev:blog
pnpm dev:cms
```

`apps/blog`는 기본적으로 port `3000`에서 시작하고, `apps/cms`는 port `3001`에서 시작한다. Phase 0
app shell은 GitHub credential, content file, authentication setup, deployment configuration을
요구하지 않는다.

## Shared package ownership

- `packages/editor`: CMS editor behavior
- `packages/markdown`: Markdown/MDX transformation behavior
- `packages/seo-engine`: rule-based SEO와 generated SEO output behavior
- `packages/design-system`: blog와 CMS 공유 UI behavior
- `packages/analytics`: GA4/GTM event emission과 analytics link helper behavior
- `packages/ai`: AI feature flag와 Post-MVP AI boundary

## Phase 0 validation

1. workspace boundary가 `apps/blog`, `apps/cms`, 여섯 shared package, `docs/`를 포함하는지 확인한다.
2. `pnpm install`을 실행한다.
3. `pnpm build`, `pnpm typecheck`, `pnpm lint`, `pnpm format:check`를 실행한다.
4. `pnpm dev:blog`와 `pnpm dev:cms`로 app shell을 각각 확인한다.
5. database, object storage, multi-user permission, scheduled publishing, AI generation, integrated
   analytics dashboard가 도입되지 않았는지 확인한다.

## Phase 0 validation 결과

2026-07-30 기준으로 다음 검증을 완료했다.

- `pnpm install`: 통과
- `pnpm build`: 통과
- `pnpm typecheck`: 통과
- `pnpm lint`: 통과
- `pnpm format:check`: 통과
- `http://localhost:3000/`: blog shell 응답 확인
- `http://localhost:3001/`: CMS shell 응답 확인

Next.js dev server는 외장 볼륨에서 실행되어 slow filesystem warning을 표시했지만, 두 app 모두
정상적으로 `200` 응답을 반환했다.

## Blog Rendering

공개 블로그는 `content/` 파일을 읽고 `packages/markdown`의 content validation, published-only
filtering, MDX analysis를 재사용한다. 공개 route는 `/`, `/posts/[slug]`, `/categories/[slug]`,
`/tags/[slug]`를 제공하며 draft, archived, invalid, unsafe MDX는 공개 출력에 포함하지 않는다.
