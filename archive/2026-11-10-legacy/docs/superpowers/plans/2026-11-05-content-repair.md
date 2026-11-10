# Content preservation and recovery implementation plan

> **For agentic workers:** Implement inline with executing-plans and test-driven-development;
> preserve the user's existing changes. The user explicitly requested implementation and remote
> content recovery, so continue through verification without another plan approval.

**Goal:** Restore the audited published content from original sources and preserve formatting
through future CMS edits.

**Architecture:** Extend version-1 native nodes additively with rich inline runs, table cells and
grouped/nested list items. Use a real Markdown parser and HTML tree parser; never strip tags from
decoded code. The same native nodes flow through CMS, both public content sources, preview, SEO and
RAG extraction.

**Tech Stack:** TypeScript, Vitest, React/Next, Tiptap, markdown-it, parse5, D1 REST.

**Spec:** docs/audits/2026-11-05-content-rendering.md and the user's request to repair all findings,
restore lost code/tables and prevent recurrence.

## Global constraints

- Source edits use apply_patch; preserve unrelated work. No generated output edits or secret
  commits.
- Keep id, slug, metadata, publication state and media references during recovery. Back up exact
  stored content outside git.
- Run migrate:dry-run and recovery-specific dry-run/verification before remote changes.
- Record runbook id, guarded writes, rollback and idempotent retry. Deploy compatible rendering
  before writing extended data.

## Review focus

- Fenced code with blank lines, JSX, generic types, literal HTML and indentation survives exactly.
- Rich inline marks/links, nested lists, numbered starts, image captions and linked images survive
  CMS reload/save.
- Tables retain cell boundaries, header state and spans, including edits in CMS.
- Raw unsafe HTML and unsafe URL schemes never become executable public markup.
- Recovery refuses stale content, missing image mappings or source mismatches; metadata and newer
  CMS edits stay intact.

## Task 1: Native content model and parsers

Files: packages/editor/src/{document,post-content,validation,supported-format,index}.ts; new
rich-content.ts, html-content.ts, tiptap-content.ts and regression tests; package README and content
contract.

Interfaces: additive inline content, table rows/cells, grouped list items/start, blockquote
children; htmlToEditorNodes(html, mapImage?) and bidirectional Tiptap JSON conversion.

- [x] Write failing tests for exact multiline JSX/generic code, GFM table, adjacent partial marks,
      explicit captions, nested lists and unsafe URLs.
- [x] Run editor tests, confirm expected failures; implement tree conversion and validation without
      regex HTML stripping.
- [x] Verify parse/serialize/Tiptap round trips and editor suite, lint/typecheck/build.

## Task 2: CMS and public rendering

Files: CMS editor-screen, editor-toolbar, native extensions, editor-save and tests; public
post-body-renderer and tests; CSS.

- [x] Write failing render and real Tiptap round-trip tests showing tables, grouped numbering, mixed
      emphasis, caption/link preservation and validation before saving.
- [x] Integrate shared conversions, table/caption extensions and safe inline rendering, recursive
      lists/quotes/tables.
- [x] Run affected suites and workspace tests, lint, typecheck and builds; inspect browser
      desktop/mobile representative pages.

## Task 3: Guarded source recovery

Files: scripts/migration source extraction/recovery helpers and CLI, migration tests, runbook.

- [x] Test original pre/code extraction, table/headings and image mapping; test stale-write
      rejection, no-op retries and rollback guards.
- [x] Back up current remote records and original HTML; build source-based proposals for Tistory
      posts, preserve newer CMS body edits by explicit comparison, normalize native posts only when
      necessary.
- [x] Run migrate:dry-run, recovery dry-run and full proposal checks; review all 35 diffs and
      original code/table counts.
- [x] Deploy compatible apps if available, apply guarded updates, refresh caches, refetch all 35 and
      verify code/table/heading/media preservation.
- [x] Run fresh independent review, address actionable findings and report exact remote/deployment
      status.

## Execution ledger

- Initial status: only the prior audit is untracked; no tracked source changes. Work in the supplied
  checkout; no branch integration requested.
- Ruling: the user's explicit request authorizes recovering remote published content and necessary
  public refresh after validated backups/dry-run; avoid unrelated metadata changes.
- Ruling: add maintained parsers and Tiptap table support because existing regex parsers cannot
  preserve these structures safely; reuse existing parse5 version.

- Completion: 32 content-only updates verified against all 39 records; original 130 code blocks/15
  tables/283 cells verified; production 35 articles pass (149 code blocks/15 tables/106 images);
  search 32 slugs/352 chunks synced. Blog, CMS and Worker deployed. See runbook for deployment IDs
  and rollback.
- Review: independent reviewer found and verified fixes for wrapped images, terminal newlines,
  nested heading IDs and HTML caption clipboard round trips. No remaining review blockers.
- Ruling: deployed shared-model-compatible Worker and declared editor dependency to invalidate
  future Turbo caches; no bindings, embedding model or dimensions changed.
- Ruling: final Blog rebuild after data recovery and rich-content cache-key bump prevent
  pre-recovery prerender HTML from surviving the migration.
- Integration: a concurrent rounded-design release replaced both compatible apps. Restored
  compatible CMS and deployed latest main 5cda284 plus these fixes, preserving the accepted design.
  Combined Blog 442 tests, lint, typecheck, build and 35 production articles pass. Latest-main patch
  is prepared for an isolated delivery branch, preserving unrelated working changes.
