# Quickstart: CMS Auth + Shell

## Prerequisites

- Install workspace dependencies from the repository root with `pnpm install`.
- Ensure `content/site.json` contains the intended `adminGithubLogin` and `adminGithubUserId`.
- Configure GitHub OAuth credentials for the CMS environment:
  - `AUTH_GITHUB_ID`
  - `AUTH_GITHUB_SECRET`
  - `AUTH_SECRET`
- Keep repository write credentials separate from the user login session.

## Validation Commands

Run from repository root:

```bash
pnpm --filter @blog-platform/cms typecheck
pnpm --filter @blog-platform/cms lint
pnpm --filter @blog-platform/cms test
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

## Local Run

```bash
pnpm dev:cms
```

Expected local URL:

```text
http://localhost:3001
```

## Scenario 1: Admin Login Success

1. Set `content/site.json.adminGithubLogin` and `adminGithubUserId` to the GitHub account used for
   testing.
2. Start the CMS app.
3. Visit `/login` and complete GitHub login.
4. Open `/`.

Expected outcome:

- CMS shell renders within 10 seconds after the OAuth callback.
- Sidebar, top bar, current user state, Posts navigation, and Settings navigation are visible.
- No editor, media upload, or publish workflow is presented as available.

## Scenario 2: Anonymous Access

1. Clear the CMS session or use a private browser session.
2. Visit `/`, `/posts`, or `/settings`.
3. Attempt a representative CMS mutation through the available test harness or route handler.

Expected outcome:

- Protected routes send the user to login or show authentication-required state without protected
  content.
- Mutation returns an auth-required result and does not call the content adapter.

## Scenario 3: Non-Admin Access

1. Configure `content/site.json` for a different GitHub account than the one used to log in.
2. Log in with the non-admin account.
3. Visit `/`, `/posts`, or `/settings`.
4. Attempt a representative CMS mutation through the available test harness or route handler.

Expected outcome:

- Protected content is not displayed.
- Access denied state distinguishes account mismatch from anonymous access.
- Mutation returns forbidden and does not call the content adapter.

## Scenario 4: Partial Identity Mismatch

Run both checks:

- `adminGithubLogin` matches but `adminGithubUserId` differs.
- `adminGithubUserId` matches but `adminGithubLogin` differs.

Expected outcome:

- Both route access and mutation requests are denied.
- The UI explains that both GitHub login and immutable user id must match.

## Scenario 5: Misconfigured Site Admin

1. Temporarily remove or blank one admin field in `content/site.json`.
2. Start the CMS app and visit a protected route.
3. Attempt a representative CMS mutation.

Expected outcome:

- CMS fails closed.
- Protected content is not shown.
- Mutation returns auth-misconfigured and does not call the content adapter.
- The state identifies which admin config field must be fixed.

## Scenario 6: Shell Navigation

1. Log in as the configured admin.
2. Visit `/`.
3. Navigate to `/posts` and `/settings`.

Expected outcome:

- Active navigation state follows the selected route.
- Posts and Settings areas show stable readiness or empty states.
- Top bar continues to show the current admin session.
- Default design-system colors are used; no custom hex palette is introduced.

## Scope Review

Confirm this phase did not add:

- Multi-user roles or approval workflow.
- CMS database or object storage.
- Rich-text editor behavior.
- Media upload behavior.
- Publish/revalidation workflow.
- Public blog dependency on GitHub OAuth or CMS session state.
