# SDD ledger — plan: docs/superpowers/plans/2026-11-05-project-video-ribbon.md

Base: 3a5a6a8. Existing isolated worktree codex/scroll-story-home.

Ruling: User superseded the dark palette: ivory #f5f3ed, blue #3d6ed5, ink #172c52, muted #53647b, line rgba(23,44,82,.18). Apply locally; preserve saved global theme.
Ruling: Skill helper scripts are absent; maintain task briefs, TDD evidence and ledger manually.
Ruling: Build and validate the experiment first; plan Task 6 requires user review of the concrete experiment before replacing /projects.
Pre-flight: Tasks 1→3→4 share RibbonItem, identity is slug; Task 2→3→4 share CSS pixel rectangles and progress; no Three imports in server data or timeline. Task 3 owns rendering/resources, Task 4 owns navigation/fallback.

Task 1: data extraction passed 14 tests with project-content suite. Task 2 pure math/rail passed; Task 3 media policy passed. No completed ribbon UI.
Ruling: User explicitly chose Interactive Portfolio instead of ribbon. Cancel remaining ribbon implementation. Archive source/patch at task outputs/abandoned-ribbon; remove unused Three dependencies. Preserve shared project asset extraction.
New plan: docs/superpowers/plans/2026-11-05-desktop-portfolio.md.
Desktop: state tests RED→GREEN (4 tests), SSR page RED→GREEN, experimental shell RED then fix. Proceed to browser validation.
