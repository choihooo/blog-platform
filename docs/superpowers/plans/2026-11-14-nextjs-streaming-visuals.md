# Next.js streaming visuals implementation plan

> Native execution in the current authorized task. Follow the blog-diagrams-and-demos skill and implement test-first; no commit, publication, or independent agent dispatch is requested.

**Goal:** Show response timing, HTML replacement, and Suspense grouping using the approved blog example.

**Architecture:** Article-local pure state model and client playback component; reuse the approved TypeScript article Frame and visual tokens. A static server-rendered diagram handles HTML-to-DOM relationships. The MDX only gains imports, inserts, and necessary connecting sentences.

**Tech stack:** Next.js 16.3.4, React 19, CSS Modules, lucide-react, Node 24 node:test.

**Spec:** /Users/choiho/.codex/skills/blog-diagrams-and-demos/SKILL.md and app/blog/_drafts/nextjs-streaming-ui/page.mdx.

## Constraints

- Preserve existing prose voice, 13 code blocks, four tables, and the provisional publication date.
- Reuse SUIT 700 and the existing frame, status colors, control styles, and 14/12/11/10px visual type sizes. No global CSS changes.
- Times 0.2s and 3s are illustrative assumptions, not measurements. No real API or React server renderer runs inside the demos.
- Playback runs once when entering the viewport (updated by the author's autoplay request); pause outside the viewport or hidden tab, replay when the slow area changes, finish statically with reduced motion.
- Default deliverable remains private. Temporarily expose only for QA and remove that route afterwards.

## Review focus

1. Reversed readiness: independent comments may show before the body; nested comments cannot.
2. Thresholds: completion becomes visible exactly at 200ms/3000ms, including zero comments being data rather than a missing result.
3. Playback: seeking pauses; replay restarts; invalid or excessive elapsed time cannot run past completion.
4. Mobile/keyboard: controls remain reachable and previews do not overflow the article.
5. Reduced motion and hidden content: no background clock advancement or decorative repeating animations.

## Tasks

### 1. State model

Files: visuals/model.ts and lib/streaming-visuals.test.mjs.

- [x] Write tests for grouped, independent, nested, reversed readiness, clamping, seeking, replay and inactive ticks.
- [x] Run node --test lib/streaming-visuals.test.mjs and observe the missing-model failure.
- [x] Implement viewAt(mode, time, delays) and playbackReducer(state, action).
- [x] Run pnpm test and confirm all scenarios pass.

### 2. Article visuals

Files: visuals/StreamingDemo.tsx, visuals/HtmlStreamFlow.tsx, visuals/streaming.module.css and the draft page.mdx.

- [x] Build comparison and boundary demos around the tested state model; share playback and controls.
- [x] Add the static HTML replacement diagram using the approved Frame and icon/card structure.
- [x] Insert each at the corresponding explanation without deleting the original examples.

### 3. Verification

- [x] Run pnpm test, pnpm lint, pnpm exec tsc --noEmit and pnpm build on Node 24.
- [x] Verify desktop/mobile, keyboard, scrub/play/pause/replay, reversed slow area, offscreen pausing, reduced motion, TOC exclusion and code copy in the real local browser.
- [x] Remove temporary preview routes, rebuild, and record evidence and simulation limits in SOURCES.md.

## Follow-up: match the requested animation reference

Reference: https://yunbh.vercel.app/blog/animation . This is a scoped refinement of the two interactive demos, not a redesign of the blog.

- Focal moment: skeletons give way to readable body/comments at the model's readiness thresholds.
- Continuity: keep identical miniature blog viewports for direct side-by-side comparison.
- Feedback: compact corner play/pause/replay, 0.97 pressed scale, fine time slider; retain selector focus when resetting.
- Budget: opacity 220ms and translateY 6px/260ms ease-out, no animation library, no automatic repeating scenes. Reduced motion displays final content statically.
- Verification: retain the tested state model; check the real desktop/mobile/dark/reduced-motion scenes and controls in one batch, then fix only concrete issues and confirm once if necessary.

## Follow-up: formal prose and autoplay

Convert narrative/title/table prose to 입니다·합니다 while preserving fenced code. Remove the range input and its CSS/reducer seek action. Initialize playback as playing, let the existing visibility gates start it on viewport entry, stop after one run, and restart on scenario changes. Keep manual pause/replay and the reduced-motion final state. Synchronize the retained local preview. Add a failing autoplay behavior test before implementation, then run the full suite and browser checks.

## Follow-up: repeat with a passive progress bar

The latest request supersedes one-shot playback: start at 20% viewport visibility, play for 3 seconds, hold completion for 2 seconds, then repeat. Freeze both playback and rest while outside the viewport or while the document is hidden. Preserve manual pause/replay, scenario reset and static reduced-motion completion. Show a noninteractive progressbar below each demo; do not restore a slider.

- [x] Observe failing tests for the repeat boundary, pause during rest and crossing several cycles, then implement the loop model.
- [x] Add passive progress and completion-wait feedback using existing design tokens.
- [x] Pass 90 tests, lint, TypeScript and production build; verify viewport start, completion hold/repeat, manual pause, offscreen freeze, selector focus, mobile overflow and reduced motion in the browser.
- [x] Retain localhost preview and record evidence in SOURCES.md.
