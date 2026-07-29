# Implementation Plan: Repo Foundation

**Branch**: `001-repo-foundation` | **Date**: 2026-07-30 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-repo-foundation/spec.md`

## Summary

Create the initial monorepo foundation for a single-operator blog platform: root workspace commands, public blog app boundary, private CMS app boundary, required shared package boundaries, preserved documentation, and validation paths that prove both apps and all packages participate in the workspace. The implementation follows the project constitution's fixed platform constraints and avoids post-MVP scope.

## Technical Context

**Language/Version**: TypeScript on Node.js

**Primary Dependencies**: pnpm workspace, Turborepo, Next.js App Router, shared TypeScript configuration, ESLint, Prettier

**Storage**: Repository files only for this phase; no database or external storage

**Testing**: Root validation commands for build, type checking, linting, formatting, and local app startup checks

**Target Platform**: Local development and Vercel-compatible web applications

**Project Type**: Monorepo with two web applications and shared packages

**Performance Goals**: A new contributor can identify all app and package boundaries within 2 minutes; both initial apps can be reached locally within 5 minutes after dependency installation

**Constraints**: Preserve `docs/`; do not introduce database, object storage, multi-user permissions, scheduled publishing, AI generation, or integrated analytics dashboards; initial apps must not require GitHub credentials or content files

**Scale/Scope**: One public blog app, one private CMS app, six shared packages, root validation workflow, and existing documentation

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. MVP Scope Discipline**: PASS. This phase creates foundation only and explicitly excludes prohibited MVP expansions.
- **II. File-Based Content Authority**: PASS. No storage system is introduced; later content phases remain repository-file based.
- **III. Shared Package Ownership**: PASS. Required shared package boundaries are part of the plan.
- **IV. Secure Publishing Boundary**: PASS. No public draft, preview, CMS mutation, or publishing behavior is implemented in this phase.
- **V. Generated SEO and Analytics Outputs**: PASS. SEO and analytics output behavior is deferred to later phases while package ownership is reserved.
- **Platform Constraints**: PASS. The plan uses the constitution-defined platform and workspace structure.
- **Development Workflow**: PASS. The plan preserves `apps/blog`, `apps/cms`, and `docs/` boundaries and defines validation proportional to foundation scope.

## Project Structure

### Documentation (this feature)

```text
specs/001-repo-foundation/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── app-routes.md
│   └── workspace-commands.md
└── tasks.md
```

### Source Code (repository root)

```text
apps/
├── blog/
└── cms/

packages/
├── editor/
├── markdown/
├── seo-engine/
├── design-system/
├── analytics/
└── ai/

docs/
├── blog-platform-spec.md
└── implementation-roadmap.md

package.json
pnpm-workspace.yaml
turbo.json
tsconfig.base.json
```

**Structure Decision**: Use the constitution-defined monorepo structure with two applications, six shared packages, and the existing Markdown documentation folder. This directly satisfies the roadmap's Phase 0 boundary requirements and gives later phases stable ownership locations.

## Phase 0: Research

Research is captured in [research.md](./research.md). No unresolved technical clarifications remain.

## Phase 1: Design & Contracts

Design artifacts:

- [data-model.md](./data-model.md): Workspace, application boundary, shared package boundary, validation workflow, and documentation area model.
- [contracts/workspace-commands.md](./contracts/workspace-commands.md): Root command contract for install, validation, build, type check, lint, format, and local development.
- [contracts/app-routes.md](./contracts/app-routes.md): Initial local route contract for the blog and CMS app shells.
- [quickstart.md](./quickstart.md): End-to-end validation guide for the foundation.

## Constitution Check: Post-Design

- **I. MVP Scope Discipline**: PASS. Design artifacts do not add prohibited MVP capabilities.
- **II. File-Based Content Authority**: PASS. No alternate content authority is introduced.
- **III. Shared Package Ownership**: PASS. Shared package boundaries are explicit in data model and validation contracts.
- **IV. Secure Publishing Boundary**: PASS. Initial app shells are non-authenticated placeholders only; no private content or publishing workflow exists yet.
- **V. Generated SEO and Analytics Outputs**: PASS. Generated outputs are not implemented in this phase; ownership locations are reserved for future phases.
- **Platform Constraints**: PASS. Contracts align with the required TypeScript, pnpm, Turborepo, Next.js, and package structure.
- **Development Workflow**: PASS. Quickstart validation is proportional to the foundation scope and preserves documented app boundaries.

## Complexity Tracking

No constitution violations require justification.
