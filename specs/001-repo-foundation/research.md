# Research: Repo Foundation

## Decision: Use the constitution-defined monorepo shape as the source of truth

**Rationale**: The project constitution and roadmap already converge on two applications (`apps/blog`, `apps/cms`) plus shared packages under `packages/`. Using that structure avoids inventing alternate ownership boundaries and lets later phases map directly to documented package responsibilities.

**Alternatives considered**:

- Single app with admin routes: rejected because it blurs public blog and private CMS responsibilities.
- Separate repositories: rejected because shared Markdown, preview, SEO, analytics, and design behavior would be harder to keep consistent.

## Decision: Keep Phase 0 app shells minimal and dependency-light

**Rationale**: The foundation must prove that both apps are runnable independently without requiring content files, authentication, GitHub credentials, or publishing flows that belong to later phases. Minimal shells provide an executable boundary while keeping Phase 0 focused.

**Alternatives considered**:

- Build real CMS dashboard and blog views immediately: rejected because that belongs to later content, auth, rendering, and editor phases.
- Add mocked auth/content systems: rejected because mocks would create early contracts before the content and auth specs exist.

## Decision: Use root workspace validation as the primary foundation contract

**Rationale**: The feature's main value is proving that all apps and packages participate in one build, type-check, lint, and format path. Root commands give contributors and future tasks one stable validation entry point.

**Alternatives considered**:

- Validate each package manually: rejected because it is slower, inconsistent, and easier to forget.
- Defer validation commands until feature code exists: rejected because missing package participation should be caught before later phases depend on it.

## Decision: Preserve `docs/` as documentation only

**Rationale**: The roadmap and constitution state that `docs/` remains a Markdown documentation folder, not a separate app. Preserving existing documents protects current planning context and avoids expanding platform scope.

**Alternatives considered**:

- Generate a docs website: rejected because it is outside the MVP roadmap.
- Move docs into an app package: rejected because it conflicts with the documented structure.

## Decision: Treat shared packages as skeleton boundaries in Phase 0

**Rationale**: Later phases define real package contracts for editor, Markdown, SEO, analytics, AI flags, and design system behavior. Phase 0 only needs discoverable package ownership and participation in validation.

**Alternatives considered**:

- Implement package logic early: rejected because behavior belongs to later feature specs.
- Omit unused packages until needed: rejected because the constitution requires these ownership boundaries and future phases depend on stable locations.
