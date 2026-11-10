# Stable nickname-linked animal avatars

**Goal:** Show one of eight simple neutral animal avatars based on nickname; randomize nickname and animal together, persist first assignment and later changes on reload, and derive each existing comment's avatar from its stored nickname.

**Scope:** Add a small consistent SVG icon family and a tested profile helper. No D1 migration is needed: comment nickname is already immutable and determines the avatar. Existing page styles outside avatar remain unchanged.

- [x] Test all eight animal mappings, initial assignment persistence, repeat loads without rerolling, invalid/missing storage, blocked storage and changing to a different animal.
- [x] Implement profile helper, nickname-linked avatar component and integrate composer/list independently. Initialize browser profile separately from API load; disable randomization until initialized.
- [x] Verify randomize/reload and existing-comment stability in browser; run tests/lint/typecheck/build and update relevant design docs and baseline hashes.

User steering: remove visible optimistic mutation loading labels; selected likes use #FF6F0F primary background with #171717 text/heart. Retain native single-flight disabled behavior without dimming while a like request is pending. No D1 schema or existing comment data changed. Tests21 engagement plus3 article plus5 post tests pass; lint/typecheck/build pass.

Browser verified profile+animal persistence on reload, guaranteed changed animal on randomize, saved comment avatar remains after composer randomization, immediate normal comment display with no mutation loading labels, primary orange like pending state opacity1 and503 rollback,390px dark mode without overflow. All test POSTs mocked; real D1 data untouched.
