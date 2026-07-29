# Quickstart: Repo Foundation Validation

## Prerequisites

- Use the repository root.
- Install the package manager expected by the workspace.
- No GitHub credentials, database, object storage, analytics credentials, AI credentials, or content files are required for this phase.

## 1. Inspect Workspace Boundaries

Confirm the foundation contains:

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

Expected outcome: all required app, package, and documentation boundaries are present.

## 2. Install Dependencies

Run:

```sh
pnpm install
```

Expected outcome: dependencies install from the repository root without requiring external product credentials.

## 3. Run Root Validation

Run:

```sh
pnpm build
pnpm typecheck
pnpm lint
pnpm format:check
```

Expected outcome: each command includes the relevant apps and packages and completes successfully for the foundation.

## 4. Start the Public Blog

Run the documented development command for `apps/blog`.

Expected outcome: the public blog initial page is reachable locally at `/` and does not require content files or GitHub credentials.

## 5. Start the CMS

Run the documented development command for `apps/cms`.

Expected outcome: the CMS initial page is reachable locally at `/` and does not require authentication setup or GitHub credentials for Phase 0 validation.

## 6. Verify MVP Scope

Confirm the foundation does not introduce:

- Database or object storage
- Multi-user permissions
- Scheduled publishing
- AI content generation
- Integrated analytics dashboard
- Public comments, accounts, payments, newsletters, or localization

Expected outcome: Phase 0 remains a foundation-only feature and is ready for task generation.
