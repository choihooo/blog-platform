# Quickstart: GitHub Content Adapter

## Prerequisites

- Dependencies installed with `pnpm install`.
- Existing MVP content files under `content/`.
- No GitHub credentials are required for local adapter validation.
- Remote GitHub adapter validation requires the later auth/config setup and may be skipped until
  credentials exist.

## 1. Package/App Validation

```sh
pnpm --filter @blog-platform/cms typecheck
pnpm --filter @blog-platform/cms lint
pnpm --filter @blog-platform/cms test
```

Expected outcome:

- CMS content adapter types compile.
- `apps/cms/lib/content-adapter` files are linted.
- Local adapter tests cover list/read/create/update/delete, stale SHA, duplicate path, disallowed
  path, and error normalization.

2026-07-30 validation:

- `pnpm --filter @blog-platform/cms typecheck`: 통과
- `pnpm --filter @blog-platform/cms lint`: 통과
- `pnpm --filter @blog-platform/cms test`: 통과, 12 files / 21 tests

## 2. Local Content Read Scenario

Use the local adapter against the repository sample content.

Expected outcome:

- `content/posts/hello-world.mdx` appears in post file listing.
- Reading the sample post returns path, content, kind, file size, and SHA-like change identifier.
- Reading `content/site.json`, `content/categories.json`, and `content/tags.json` returns valid
  config content for CMS use.

## 3. Draft Create Scenario

Create a new draft under `content/posts/` through the adapter contract.

Expected outcome:

- A new MDX file can be written under the approved posts path.
- The result includes `status: created`, latest change identifier, and summary
  `post(<slug>): create draft`.
- Creating the same path again returns `duplicate-file` and does not overwrite the existing file.

## 4. Existing Draft Save Scenario

Read an existing draft, then update it using the returned change identifier.

Expected outcome:

- Update succeeds only when `expectedSha` matches the latest file identifier.
- The result includes `status: updated`, a new change identifier, and summary
  `post(<slug>): save draft`.
- Submitted frontmatter and body can be read back without drift.

## 5. Conflict Scenario

Read a file, change the same file outside the adapter, then attempt to save with the old identifier.

Expected outcome:

- The adapter returns `stale-file`.
- Repository content is not overwritten.
- The failed result preserves the submitted content for recovery.

## 6. Path Boundary Scenario

Attempt to write outside `content/` and `public/media/`.

Expected outcome:

- Absolute paths, `../` traversal, `.github/` paths, and arbitrary root files are rejected with
  `validation-failure`.
- No file is created or changed outside approved paths.

## 7. Workspace Validation

```sh
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

Expected outcome:

- CMS adapter changes do not break blog rendering or shared package builds.
- Public blog continues to render from local content files without repository credentials.

## 8. Scope Review

Confirm this phase did not add:

- CMS database
- object storage
- multi-author approval workflow
- public blog GitHub credential dependency
- rich-text editor UI
- publish/revalidation workflow

Expected outcome:

- The feature remains limited to the repository-backed CMS content adapter boundary.

2026-07-30 scope review: CMS database, object storage, multi-author approval workflow, public blog
GitHub credential dependency, rich-text editor UI, publish/revalidation workflow를 추가하지 않았다.
