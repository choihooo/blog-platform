# Contract: Workspace Commands

## Purpose

Define the root command behavior expected from the repo foundation. These commands are the external contributor-facing interface for validating the workspace.

## Required Commands

### Install

**Command**: `pnpm install`

**Expected outcome**:

- Installs workspace dependencies from the repository root.
- Prepares both applications and all shared packages for validation.

### Build

**Command**: `pnpm build`

**Expected outcome**:

- Runs the workspace build path.
- Includes `apps/blog`, `apps/cms`, and all shared packages that expose build work.
- Fails if an included workspace cannot be built.

### Type Check

**Command**: `pnpm typecheck`

**Expected outcome**:

- Runs type validation for both applications and all shared packages.
- Fails on type errors in any participating workspace.

### Lint

**Command**: `pnpm lint`

**Expected outcome**:

- Runs static analysis for both applications and all shared packages.
- Fails on lint violations in any participating workspace.

### Format Check

**Command**: `pnpm format:check`

**Expected outcome**:

- Checks formatting without rewriting files.
- Fails when files do not match the repository formatting rules.

### Local Development

**Command**: `pnpm dev`

**Expected outcome**:

- Starts the local development workflow for foundation validation.
- Makes both initial app shells available, either through a combined dev command or documented app-specific dev commands.

## Failure Contract

- Running validation before dependency installation must produce a clear missing-dependency or missing-installation failure.
- A missing app or shared package must be detectable through workspace validation or workspace listing.
- Root commands must not require GitHub credentials, content files, database services, object storage, analytics credentials, or AI credentials for Phase 0 validation.
