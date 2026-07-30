# Research: GitHub Content Adapter

## Decision: CMS adapter stays inside `apps/cms`

**Rationale**: The adapter is a private CMS mutation boundary. The public blog must not require
GitHub credentials or repository write behavior, and the constitution's target package structure
already reserves shared packages for behavior used across apps. Keeping this module in `apps/cms`
limits blast radius while still allowing clean internal contracts.

**Alternatives considered**:

- New `packages/content-adapter`: rejected because this behavior is not shared by `apps/blog` and
  would expand the package structure without clear cross-app ownership.
- Put write behavior in `packages/markdown`: rejected because Markdown owns parsing and validation,
  not repository mutation or credentials.

## Decision: Use GitHub Contents API for MVP file mutation

**Rationale**: The roadmap explicitly calls for GitHub Contents API mutation and file SHA based
optimistic locking. GitHub's repository contents endpoint supports create/update/delete file
operations and uses `sha` for existing file updates. This maps directly to single-file CMS saves and
clear conflict reporting.

**Alternatives considered**:

- Git Trees API: useful for bulk tree writes, but MVP CMS operations are single content/media
  changes with user-facing commit messages. It adds lower-level commit/reference handling too early.
- Direct git CLI from server runtime: rejected because deployed CMS runtime should not depend on a
  local checkout with push credentials.

## Decision: Require last-read SHA for existing file changes

**Rationale**: The spec requires stale writes to be rejected 100% of the time. Requiring the SHA
read with the file prevents blind overwrites and lets CMS distinguish conflict from generic failure.

**Alternatives considered**:

- Last-write-wins overwrite: rejected because it can lose edits when another device, commit, or
  automation changes the file first.
- Timestamp comparison: rejected because repository SHA is the authoritative change identifier and
  avoids clock skew.

## Decision: Serialize create/update/delete operations per save workflow

**Rationale**: GitHub documentation warns that create/update and delete operations against
repository contents can conflict when used in parallel and should be used serially. CMS save/publish
workflows therefore queue or await file changes in a deterministic order.

**Alternatives considered**:

- Parallel file writes for speed: rejected because conflict risk matters more than speed in a
  single-operator CMS.
- Bulk tree commit for every save: rejected for MVP because it complicates conflict UX and commit
  construction.

## Decision: Normalize repository failures before they reach UI

**Rationale**: The CMS needs user-actionable categories: unauthorized, missing file, duplicate file,
stale file, rate limit, validation failure, temporary connectivity failure, and unknown. GitHub rate
limit and private-resource errors may appear as different status codes depending on authentication
and rate limit class, so raw transport errors should not leak into UI logic.

**Alternatives considered**:

- Show raw status codes: rejected because operators need recovery guidance, not transport details.
- Collapse all failures into generic save failure: rejected because retry, re-login, conflict
  resolution, and path correction require different user actions.

## Decision: Local adapter mirrors remote adapter contract

**Rationale**: Local adapter tests can prove path validation, SHA conflict behavior, duplicate
handling, error normalization, and content preservation without requiring GitHub credentials. It
also supports local development while the later CMS Auth + Shell phase finishes credentials.

**Alternatives considered**:

- Test only with GitHub integration: rejected because credentials and network state would make core
  validation slow and brittle.
- Local adapter with a different shape: rejected because CMS UI and editor phases need one stable
  adapter contract.

## Sources

- GitHub Docs, REST API endpoints for repository contents:
  https://docs.github.com/en/rest/repos/contents
- GitHub Docs, Rate limits for the REST API:
  https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api
- GitHub Docs, Best practices for using the REST API:
  https://docs.github.com/rest/guides/best-practices-for-using-the-rest-api
