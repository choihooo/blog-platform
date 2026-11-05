# SDD ledger — plan: docs/superpowers/plans/2026-11-06-gemini-rag.md

## Setup

- Isolated branch: codex/gemini-rag; base 850c07b77e85e25dfa1e62e59c88ff350dc79b9f.
- Source checkout's unrelated uncommitted content/editor work remains untouched.
- Ruling: skill task-start/task-done helpers reference missing subagent-driven-development scripts;
  maintain this committed ledger directly with the same RED/GREEN evidence instead.
- Pre-flight 1→2: profile must affect sync, search and stale revalidation together; legacy IDs must
  remain unchanged.
- Pre-flight 2→3: shared retrieval supplies authoritative source arrays; provider failures remain
  429/503.
- Pre-flight 3→4: remote chat requires answer; existing structured answers remain valid.
- Pre-flight 2→5→6: Gemini threshold and rate quota need real evaluation, so keep all defaults on
  legacy and document remote gates as pending.
- Ruling: no remote resources, credentials or deployments will be changed in this implementation.
  Task 6's remote steps remain pending; local code/tests/runbook will be completed.

## Progress

- Baseline: Worker 5 tests passed; Blog initially failed on absent dist exports, resolved by package
  builds (environment preparation).
- Task 1: complete. Missing profile RED; profile isolation and existing rag tests GREEN: 13 tests.
  Legacy SHA pinned to independent literal.
- Baseline after package build: Blog 435 tests passed.
- Task 2: complete. Embedding module missing RED → vector normalization/task type/HTTP/cancel GREEN.
  Worker typegen/typecheck/build dry-run passed.
- Task 3: complete. /answer missing (404) and Next /search routing/missing-answer RED → Worker 25
  tests and Blog targeted 166 tests GREEN.
- Ruling: commit Tasks 2 and 3 together because their Worker pipeline and Gemini transport share the
  same new files; tests exercise both independently.
- Task 4: complete. Missing remote component RED → 5 UI tests GREEN; existing answer rendering tests
  preserved. No new UI dependency.
- Task 5: complete locally. Missing sync/evaluation modules RED → sync pacing/resume and evaluation
  tests GREEN; 48 fixtures (10 calibration, 30 retrieval holdout, 5 follow-up, 3 injection).
- Task 6: local full tests Blog 447/447, Worker 28/28; Blog lint/typecheck, Worker typecheck and
  remote-mode Next production build passed. Remote steps and live Gemini remain pending.
- Final independent review (gpt-6-astra): evidence race, untrusted prose links, generation
  evaluation accepted missing answers. Each reproduced RED and fixed in one pass.
- Final: fixed selected-document evidence changes during generation → 503; exact source URLs only;
  explicit retrieval/generation evaluation mode.
- Final: Ruling: add provider-independent contentRevision after review identified incompatible sync
  revisions — otherwise identical-content comparisons fail; extra dry-run hashing only.
- Final: Ruling: low-quota CLI/CMS sync timeouts are explicit rollout limitations — quotas below
  supported latency need async sync design before activation.
- Final: Ruling: actual model access/quota/Vectorize/activation remain pending; local desktop/mobile
  browser verified factual paths and zero model downloads.
- Final: Ruling: remote UI/local server is unsupported; switch both flags together — mismatch yields
  recoverable error, not local fallback.
- Final: Ruling: legacy customization is unavailable; only fixed legacy profile supported — future
  model changes require a new profile/index.
- Final verification: workspace lint/typecheck/test/build passed; 666 tests total (Blog448,
  Worker31, CMS141, editor17, analytics14, SEO15). Desktop/mobile factual flow and no model
  downloads verified in actual browser. No deferred minor code findings.
- SEO: bundled runtime missing, so source HTML plus regression tests used; pre-existing duplicate H1
  in Nest article recorded separately. No API keys or remote writes performed.
