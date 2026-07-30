# Quickstart: CMS Editor

## Prerequisites

- Root dependencies installed with `pnpm install`.
- CMS auth environment configured:
  - `AUTH_GITHUB_ID`
  - `AUTH_GITHUB_SECRET`
  - `AUTH_SECRET`
- `content/site.json` contains the operator's `adminGithubLogin` and `adminGithubUserId`.
- Existing specs `005-github-content-adapter` and `006-cms-auth-shell` remain valid.
- For local UI-only validation without GitHub OAuth, run CMS with `CMS_DEV_BYPASS_AUTH=1`. This
  bypass is development-only.

## Validation Commands

Run package and app checks while implementing this feature:

```sh
pnpm --filter @blog-platform/editor typecheck
pnpm --filter @blog-platform/editor lint
pnpm --filter @blog-platform/markdown typecheck
pnpm --filter @blog-platform/markdown lint
pnpm --filter @blog-platform/markdown test
pnpm --filter @blog-platform/design-system typecheck
pnpm --filter @blog-platform/design-system lint
pnpm --filter @blog-platform/cms typecheck
pnpm --filter @blog-platform/cms lint
pnpm --filter @blog-platform/cms test
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

## Scenario 1: 새 초안 작성

1. Start CMS locally.

   ```sh
   pnpm dev:cms
   ```

   OAuth 없는 로컬 확인은 다음 명령을 사용한다.

   ```sh
   CMS_DEV_BYPASS_AUTH=1 pnpm dev:cms
   ```

2. Sign in as the configured GitHub admin.
3. Open `/posts`.
4. Choose the new draft action.
5. Enter title, paragraph, heading, list, quote, link, and code block.
6. Confirm the editor shows dirty state and preview can render the supported content.
7. Save the draft.

**Expected Result**: CMS creates a draft under `content/posts/`, clears the local backup for that
draft, and keeps the editor in clean saved state.

## Scenario 2: 기존 글 열기와 round-trip

1. Open an existing supported MDX post from `/posts`.
2. Change title, excerpt, paragraph text, heading, and code block.
3. Save the draft.
4. Reopen the same post.

**Expected Result**: The reopened document preserves the same title, metadata, body structure,
supported formatting, and source SHA from the latest repository read.

## Scenario 3: 미지원 MDX 차단

1. Prepare a post containing unsupported import/export, arbitrary JSX, unsafe HTML, or runtime
   expression.
2. Open it in CMS editor.

**Expected Result**: CMS shows an unsupported or unsafe MDX state and does not silently transform,
delete, or save the unsupported content.

## Scenario 4: 저장 전 복구

1. Open a supported post.
2. Edit the title or body without saving.
3. Refresh the browser.
4. Reopen the same post.

**Expected Result**: CMS detects a newer local backup and lets the operator restore or discard it.
Repository content is not replaced until the operator restores and saves.

## Scenario 5: 충돌 보존

1. Open a post and keep its editor screen active.
2. Change the same post externally so the repository SHA changes.
3. Attempt to save from the stale editor screen.

**Expected Result**: CMS reports a stale-file conflict, does not overwrite repository content, and
keeps the submitted editor document available.

## Scenario 6: 인증 실패와 세션 만료

1. Open a dirty editor document.
2. Invalidate the CMS session or sign out in another tab.
3. Attempt to save.

**Expected Result**: CMS blocks the repository mutation, reports re-authentication or access
failure, and preserves the dirty editor document and local backup.

## Scope Review

Confirm during implementation review:

- No media upload workflow was added.
- No publish, unpublish, archive, or revalidation workflow was added.
- No SEO scoring, generated outputs, analytics dashboard, or AI writing generation was added.
- No public blog runtime dependency on GitHub credentials or CMS session was introduced.
- No custom hex palette or nested-card editor layout was introduced.

## Implementation Validation Notes

2026-07-30 구현 기준:

- `packages/editor`는 supported editor document와 MDX round-trip helper를 제공한다.
- CMS editor 화면은 Tiptap contenteditable surface 기반 MVP로 구현되었고, toolbar command는 Tiptap
  command chain을 실행한다.
- 저장은 기존 protected content operation과 local content adapter를 통해 create draft/save draft를
  수행한다.
- Local draft backup helper는 30일 TTL과 restore candidate 판단을 제공한다.
- 검증 명령:
  - `pnpm --filter @blog-platform/editor typecheck`
  - `pnpm --filter @blog-platform/editor lint`
  - `pnpm --filter @blog-platform/editor test`
  - `pnpm --filter @blog-platform/cms typecheck`
  - `pnpm --filter @blog-platform/cms lint`
  - `pnpm --filter @blog-platform/cms test`
