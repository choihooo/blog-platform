# Keychain article visuals implementation plan

> **For agentic workers:** Execute inline in this ongoing article task. Follow test-driven-development and verification-before-completion; request one final scoped code review.

**Goal:** Add all three approved explanatory visuals to the existing private MDX draft and update its title and date from GitHub history.

**Architecture:** Reuse the approved TypeScript article's Frame, AnimatedFlow, FlowNode, and CSS without changing them. Keep article-specific scenario models, controls, and tests next to the private draft. All animation describes examples, not recorded runs.

**Tech stack:** React, TypeScript, CSS modules, existing flow engine, Node test runner.

**Spec:** User-approved three-visual proposal in the current chat; blog-diagrams-and-demos/SKILL.md and root DESIGN.md.

## Global constraints

- Preserve site typography, spacing, colors, and shared design baseline.
- Keep the article in app/blog/_drafts/self-hosted-runner-macos-keychain; use a temporary public route only for verification.
- Use no new dependencies, invented measurements, success guarantees, commits, pushes, or deployment.
- Set date to 2026-06-19 from the original repository's isolation and locking commits; keep current workflow checks distinct from historical experience.

## Review focus

- A cleanup must preserve B's Keychain in the owned-removal example.
- A signing failure must still reach cleanup; cleanup execution must not imply successful state verification.
- PR and manual branch runs must not activate release build/upload; dry-run must stop before release output.
- Manual tag runs must publish latest only when selected, while tag push publishes it after successful preceding steps.
- Changing options must reset animation; reduced motion, hidden tabs, mobile overflow, keyboard focus, and article tools must remain usable.

## Task 1: Scenario behavior

Files: create visuals/model.ts and lib/keychain-visuals.test.mjs.

- [x] Write behavioral tests for snapshot restoration losing B, owned removal retaining B, failure reaching cleanup, and release trigger/dry-run/latest combinations.
- [x] Run node --test lib/keychain-visuals.test.mjs and observe missing-feature failure.
- [x] Implement getSearchListScenario(mode), getSigningNodes(outcome), and getReleaseNodes(trigger, options) using FlowNode[] and immutable arrays.
- [x] Run the tests and confirm expected active nodes and final Keychain lists.

## Task 2: Visuals and article

Files: create visuals/KeychainVisuals.tsx, importing approved visual components and styles. Modify only the new draft's page.mdx for title/date/imports/three insertions.

- [x] Render a two-mode search-list comparison with playback, a success/failure lifecycle, and a PR/tag/manual route with dry-run/latest controls.
- [x] Use accessible figure names and descriptions; do not add captions beneath diagrams. Put any example context in the article prose.
- [x] Preserve all three code excerpts and both images. Record date evidence in the existing hidden source comment.

## Task 3: Verification

- [x] Run pnpm test, pnpm lint, pnpm exec tsc --noEmit, pnpm build.
- [x] Use a temporary public route for desktop/mobile browser QA: scenario switches, pause/replay, reduced motion, no page overflow, copy button, TOC, and navigation.
- [x] Obtain one scoped independent code review; fix material findings with a regression check.
- [x] Remove the temporary public route and verify the final build does not expose the draft.

## Execution notes

Continuing in the current workspace preserves the user's uncommitted article and site work. Only the new draft, its scenario tests, and this plan are in scope. Existing unrelated changes remain untouched.

Verification: scenario tests RED (missing model) → GREEN 6/6; full suite 60/60, lint, tsc, preview build and final draft-only build passed. Browser checked all three visuals, scenario gates, reduced motion, mobile containment (375px page / 375px viewport), keyboard focus and internal scroll, copy, TOC9, and home/article navigation. Independent review found one option-reset edge case; reproduced in browser before fix, then confirmed passing after keying the flow by all control values. No shared visual code/styles changed. Environment reports Node25.3.0 against the repository Node24 engine declaration.
