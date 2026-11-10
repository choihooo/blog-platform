# Optimistic engagement and production D1 credentials

**Goal:** Reflect likes and comments before the server responds, roll back failures without losing drafts, replace temporary D1 credentials with a production token, and settle random avatar direction with the user.

**Scope:** ArticleEngagement component and small tested state transitions only; preserve surrounding blog design. Tokens remain server-only in ignored local configuration; do not deploy.

- [x] Test immediate like/count updates, rollback preserving unrelated comments, pending comments with counts, replacement by confirmed server records, removal/restored draft on failure, deduplication when a request already reached the server.
- [x] Integrate transitions before requests, retain single-flight locks and stable comment IDs, expose pending/success/failure clearly.
- [x] Create account-scoped D1 Edit token and verify read-only access, preserving unrelated configuration and never outputting secrets; report authentication blockers if present.
- [x] Recommend avatar direction: simple animal faces matching nickname, near-neutral backgrounds, stable on reload and randomized with nickname. User asked for a recommendation; no avatar replacement was selected or applied.
- [x] Verify delayed success and failure in the browser, run tests/lint/typecheck/build, update only related design documentation and baseline hashes.

Review: independent read-only reviewer found no actionable issues in optimistic transitions/integration. Production token configured in private ignored local environment, actual D1 SELECT1 passed; the initially exposed token was revoked and actual D1 requests with it return401. Replacement same narrow account D1 scope, verified with no secret output. App not deployed.

Verification: 24 tests passed (16 engagement,3 article,5 posts), lint/typecheck/build passed. Browser controllable POST responses verified immediate filled heart/count,503 rollback, immediate pending comment/count, exact draft restoration on503,stable retry ID and one confirmed row with server timestamp. Test POSTs were mocked; real D1 data was preserved. Native browser fetch restored and globals removed afterward.
