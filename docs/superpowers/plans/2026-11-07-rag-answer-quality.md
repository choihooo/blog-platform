# RAG Answer Quality Implementation Plan

> **For agentic workers:** Use executing-plans inline with TDD; retain existing worktree and prior
> audit files.

**Goal:** Remove serialized editor data from RAG evidence, choose relevant passages, and prevent
instruction echoes or omission of explicit company facts.

**Spec:** `docs/audits/2026-11-07-gemini-quality.md` and the user's request to fix the recorded
failures.

**Architecture:** Add a read-only text projection in packages/editor; leave its
editing/serialization contract unchanged. Reuse that projection in postDocument. Preserve provider
IDs and stale checks; changed document text naturally invalidates affected chunks. Select matching
body passages and bound evidence to 550 characters. Improve grounding and retry a semantically
invalid model response once under one time budget, then fail closed.

**Constraints:** No new dependencies, no deployment, no secrets in artifacts, no fixture relabeling.
Existing 0.7 cutoff remains a candidate. Reembedding uses the already authorized candidate index
only and stops at quota errors.

## Task 1: Clean evidence and relevant passages

- [x] RED: editor tests for tables, nested text, duplicate inline text, malformed structured data,
      and legacy Markdown; RAG tests for clean source output and relevant later chunks with
      introduction.
- [x] GREEN: `textFromPostContent(source: string): string` in editor, export/README, postDocument
      consumer, currentMatches passage selection.
- [x] Verify editor and Blog tests and shared-consumer types.

## Task 2: Grounded generation

- [x] RED: wire-level tests replay `없다고 답하세요.`, missing explicit organization, bounded second
      failure, and cancellation; preserve authoritative links.
- [x] GREEN: grounding instructions use organization-labelled metadata and treat source instructions
      as data. Retry detected bad output once; no invented replacement answer or provider fallback.
- [x] Verify Worker tests plus Blog grounding contracts.

## Task 3: Actual evaluation

- [x] Run mandatory package format/lint/types/tests/build checks and inspect outputs.
- [x] Dry-run and synchronize only changed candidate chunks within verified free quota; retain old
      vectors with stale rejection.
- [x] Replay failures as regression, then use a newly frozen question set and source-injection
      fixtures as independent checks. Record automatic and agent review separately; do not claim
      human sign-off.
- [x] Record results and limitations, including any failed quality gates. Run one final code review
      and fix material findings with RED→GREEN.

## Review focus

Malformed structured content must not become JSON prose; JSON code samples must remain literal code.
Table row/cell relationships must survive text projection. Passage selection must not accept stale
vectors. Grounding must not invent an organization for sources without one. Retry must not hide
quota errors or exceed cancellation/deadline limits.

## Progress

- 2026-11-09: quota recovered; frozen 12-case public API evaluation completed with 8/8 positive
  hits, 0/4 negative false positives, no HTTP errors. Original 30-case raw retrieval reevaluated:
  17/20 positive, 0/10 false positives, all HTTP 200. Three remaining raw failures still pass
  through the public API's deterministic paths; do not combine these into one score. Earlier nine
  unverified cases are resolved; raw 90% rollout gate and human sign-off remain outstanding. See
  `docs/audits/2026-11-09-rag-revalidation.md`.

- Pre-flight: editor text projection is consumed by postDocument; chunk fingerprints depend on
  resulting text. Source selection changes do not change the vector profile. Grounding is shared
  with the legacy browser model, so Blog tests and build cover that consumer too.

- Review: malformed envelope shapes, shared-URL document mixing, and source ordering findings
  reproduced RED and fixed GREEN; suite 680 tests, lint/types/build passed. No deferred minor
  findings.
- Ruling: add a read-only projection rather than widen editing/rendering contracts; pre-existing
  rendering limitations remain outside this RAG fix.
- Ruling: stop at confirmed free-tier daily quota exhaustion, with no billing/project bypass.
  Regression 3/3 and source-injection 3/3 passed; new questions 3/3 measured successfully before the
  fourth returned429. Nine cases remain unverified, as does the full original raw-search
  reevaluation.
- Evidence: docs/audits/2026-11-07-rag-answer-fix.md and JSON. Candidate coverage580/580;104 newly
  embedded. Production activation not performed.
