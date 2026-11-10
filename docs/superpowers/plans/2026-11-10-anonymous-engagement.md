# Anonymous comments and likes implementation plan

**Goal:** Add login-free article comments and reversible article likes, stored in Cloudflare D1, with a Toss-inspired anonymous comment form.

**Architecture:** Existing Next.js on Node stays intact. Same-origin route handlers query D1 through its server-only REST API, so no hosting migration is needed. An explicit development-only SQLite mode shares exactly the same SQL; production refuses that mode. Signed HttpOnly browser identities provide idempotent likes and comment cooldowns, without accounts.

**Spec:** User's attached comment form and https://toss.tech/article/taste; root DESIGN.md. Preserve all existing typography, page width, spacing and article content. Extend only article footer. New controls inherit the monochrome palette.

## Task 1: Persistence and API
- [x] Write failing node tests for SQL persistence, pagination, atomic comment cooldown, request validation, cross-origin rejection, signed identity, idempotent likes and D1 failures.
- [x] Implement `lib/engagement/` with parameterized SQL, D1 REST transport, explicit local SQLite transport and request handlers; integrate `app/api/engagement/[slug]/route.ts` with existing published slug discovery.
- [x] Verify tests, add schema and setup documentation. Never log secrets or raw IP addresses; HMAC IP rate keys with a server secret. Reject missing configuration with 503, never simulate a success.

## Task 2: Article footer
- [x] Add accessible comment form with random nickname/change control, 1–1000 character plain text comments, loading/empty/error states, retry and pagination; article likes use server state and explicit desired state.
- [x] Mount in common blog layout with pathname-based slug and abort stale requests on navigation. Preserve draft on request failure and protect against duplicate submissions.
- [x] Verify keyboard submission/focus, mobile overflow, article-to-home navigation, dark mode, real local persistence and like reload/cancellation.

## Task 3: Verification and documentation
- [x] Run existing tests, engagement tests, lint, typecheck and production build.
- [x] Review changed files, update DESIGN.md and relevant baseline hashes only, document D1 schema application, least-privilege secrets, moderation SQL and anonymous identity limits.

## Review focus
Test malicious input and SQL injection as literal text; huge/invalid payloads; nonexistent slugs; cleared or forged cookies; concurrent duplicate requests; provider failures; count/list pagination races; persistence after reload; configured production never falling back to local storage.

## Execution decisions
Work in the current directory because the current app is part of an uncommitted migration; a HEAD-based worktree would restore the old app. Preserve all unrelated changes. Implement in this session; do not commit or deploy unless asked. Until the user's comment-editing answer arrives, persistence is append-only as in the supplied reference.

## Verification evidence
11 engagement tests, 3 article tests, 5 post tests passed. Reviewer found initial-load timeout was replaced by navigation cancellation; a regression reproduced the stuck request, then passed after combining both signals. Real D1 HTTP round trip verified comments/likes/reload/cancellation. Browser QA verified comment submission, nickname change, persistence, article isolation, keyboard navigation and 390px overflow. Production deployment is outside this implementation; local OAuth must be replaced with a scoped API token before deployment.
