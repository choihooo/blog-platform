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

## 2026-11-07 authorized live evaluation

- Subsequent explicit user requests authorized local API setup, remote candidate index creation and
  reembedding, then calibration and quality evaluation. The earlier implementation-only boundary
  above describes the previous phase; production deployment remains outside the current scope.
- Candidate index: 790 vectors fully reflected; see `docs/audits/2026-11-07-gemini-reembedding.md`.
- Calibration: 10 separate cases, cutoff frozen at 0.7 before holdout. Positive 6/7, negative 0/3.
- Raw retrieval holdout: Gemini 17/20 positive, 0/10 negative false positives; BGE 16/20, 1/10. All
  60 requests HTTP 200, identical current contentRevision, all expected URLs exist.
- Public API: 38/38 HTTP 200, positive URLs 20/20, one strict empty-URL failure for an intentional
  false-premise correction. Agent semantic review found a GGUF article instruction echo and
  insufficient detail in one follow-up. Some source excerpts contain editor JSON.
- Synthetic source injection: marker/link ignored in 3/3, but explicit company attribution omitted
  in 2/3. Raw evidence and unchanged automatic human-review flags are retained in the quality JSON.
- Ruling: keep 0.7 as a local candidate and report failed rollout gates, rather than retuning on
  holdout or relabeling expected URLs — the evaluation request does not justify hiding failures;
  cost is deferring production activation until retrieval/context/generation fixes and new holdout.
- Task 6 live evaluation complete; production transition, publication-state mutation tests, human
  sign-off and rollback rehearsal remain pending. No application source changes in this phase.
