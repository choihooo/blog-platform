<!--
Sync Impact Report
Version change: template -> 1.0.0
Modified principles:
- Principle 1 placeholder -> I. MVP Scope Discipline
- Principle 2 placeholder -> II. File-Based Content Authority
- Principle 3 placeholder -> III. Shared Package Ownership
- Principle 4 placeholder -> IV. Secure Publishing Boundary
- Principle 5 placeholder -> V. Generated SEO and Analytics Outputs
Added sections:
- Platform Constraints
- Development Workflow
Removed sections:
- None
Follow-up TODOs:
- None
-->
# Blog Platform Constitution

## Core Principles

### I. MVP Scope Discipline
The platform MUST optimize for a single-operator technical blog MVP. Initial work MUST NOT
introduce multi-tenant SaaS behavior, public user accounts, comments, newsletters, payments,
subscriptions, multi-author permissions, complex approval chains, localization, object storage,
PostgreSQL, a separate CMS database, scheduled publishing, AI content generation, internal link
automation, or integrated GA4/Search Console API dashboards. Any post-MVP capability MUST be
feature-flagged or isolated so it does not complicate the MVP architecture.

Rationale: The product goal is a reliable writing, preview, publish, SEO, and analytics-linking
flow for one operator. Premature platform features increase risk without serving the MVP user.

### II. File-Based Content Authority
The GitHub repository MUST remain the source of truth for content. Posts MUST be stored as
`content/posts/*.mdx`, publication state MUST come from frontmatter, and media MUST live under
`public/media` unless the constitution is amended. The public blog MUST read only local content
files at runtime and MUST NOT require GitHub API credentials. The CMS MUST use GitHub Contents API
mutations with file SHA optimistic locking for writes.

Rationale: File-backed content keeps the public blog fast, auditable, deployable on Vercel, and
simple to recover through Git history.

### III. Shared Package Ownership
Markdown, MDX rendering, SEO, analytics, editor, AI flags, and shared UI logic MUST live in
packages under `packages/` when used by more than one app. `apps/blog` and `apps/cms` MUST consume
these packages rather than duplicating domain logic. Package APIs MUST define clear ownership,
stable inputs and outputs, and focused tests for schemas, transformations, and generated metadata.

Rationale: The blog and CMS need identical content parsing, preview, SEO, and analytics behavior.
Shared packages prevent drift between what the operator previews and what readers see.

### IV. Secure Publishing Boundary
Drafts, archived posts, unsafe MDX, and private CMS actions MUST be blocked from public exposure.
Published public pages, RSS, Sitemap, JSON-LD, and OG images MUST include only `status: published`
content. Preview access MUST use stateless HMAC tokens with a 30-minute TTL. CMS access MUST be
limited to the configured GitHub administrator identity using both immutable user ID and login.
MDX rendering MUST sanitize unsafe HTML, script tags, event handlers, arbitrary runtime evaluation,
and unsupported interactive components.

Rationale: The repository contains unpublished editorial work and privileged publishing controls.
The public blog must remain readable without exposing drafts, credentials, or unsafe content.

### V. Generated SEO and Analytics Outputs
SEO-critical outputs MUST be generated from validated post and site metadata instead of manually
maintained per post. This includes slug policy, canonical metadata, Open Graph metadata, OG images,
JSON-LD, Table of Contents, reading time, RSS, Sitemap, and robots.txt. SEO scoring MUST be
rule-based for MVP and produce deterministic 0-100 results. Analytics MUST emit the agreed GA4/GTM
events and the CMS MUST provide external console links instead of storing analytics data in MVP.

Rationale: The platform exists to remove repetitive SEO and publishing chores while preserving
predictable, inspectable behavior.

## Platform Constraints

The implementation MUST use TypeScript, pnpm, Turborepo, Next.js App Router, Node.js, and Vercel as
the default deployment target unless a constitution amendment changes the stack. The target
workspace structure is:

```txt
apps/
  blog/
  cms/

packages/
  editor/
  seo-engine/
  markdown/
  design-system/
  analytics/
  ai/
```

The editor MUST be based on Tiptap and MUST only support nodes and marks that can round-trip
reliably between Tiptap JSON and MDX in MVP. The Markdown and MDX pipeline MUST wrap established
libraries such as unified, remark, rehype, MDX, gray-matter, Zod, and a syntax highlighter instead
of implementing custom parsers. UI work MUST use shadcn/ui, Tailwind CSS, Radix primitives, and
lucide-react through `packages/design-system`; MVP color choices MUST stay within the default
shadcn/ui palette.

## Development Workflow

Every phase MUST preserve the documented app boundaries: `apps/blog` is public and read-only,
`apps/cms` performs authenticated content mutation, and `docs/` remains a Markdown documentation
folder rather than a separate app. Feature work MUST define validation and tests proportional to
the affected contract. Required test coverage includes content schema validation, slug uniqueness,
published-only filtering, MDX sanitization, heading and TOC generation, reading time, SEO scoring,
generated outputs, GitHub write conflict handling, preview token validation, and analytics event
emission when those areas are implemented.

Implementation plans MUST explicitly call out any deviation from the constitution. A deviation
requires written rationale, a migration or rollback path, and constitution amendment approval
before code depending on the deviation is accepted.

## Governance

This constitution supersedes conflicting project practices, plans, and implementation preferences.
Feature specifications, implementation plans, task lists, code reviews, and releases MUST verify
compliance with the Core Principles, Platform Constraints, and Development Workflow sections.

Amendments MUST be proposed as documentation changes to this file. Each amendment MUST describe the
reason for change, affected principles or sections, migration impact, and required follow-up work.
Governance changes use semantic versioning:

- MAJOR: removes or redefines a core principle or permits previously prohibited architecture.
- MINOR: adds a principle or materially expands governance requirements.
- PATCH: clarifies wording, fixes mistakes, or makes non-semantic refinements.

Compliance review is required before implementation phases are considered complete. Any unresolved
constitutional conflict MUST be documented in the relevant spec or plan and resolved before
shipping production-facing behavior.

**Version**: 1.0.0 | **Ratified**: 2026-07-30 | **Last Amended**: 2026-07-30
