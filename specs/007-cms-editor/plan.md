# Implementation Plan: CMS Editor

**Branch**: `007-cms-editor` | **Date**: 2026-07-30 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/007-cms-editor/spec.md`

## Summary

CMS의 Posts 영역을 실제 작성 표면으로 확장한다. 인증된 단일 운영자는 새 초안을 만들거나 기존 글을
열어 제목, frontmatter, 본문을 편집하고, 지원되는 서식은 MDX로 안전하게 저장 및 재열기할 수 있어야
한다. 변환 규칙과 편집 문서 모델은 `packages/editor`가 소유하고, CMS app은 protected content
operation을 통해 repository 저장, 충돌 표시, 임시 편집 복구, preview UI를 연결한다.

## Technical Context

**Language/Version**: TypeScript 6.0.3, React 19.2.8, Next.js 16.2.12

**Primary Dependencies**: `@blog-platform/editor`, `@blog-platform/markdown`,
`@blog-platform/design-system`, `next-auth`, `lucide-react`, Tiptap editor family, ProseMirror
Markdown utilities, local browser draft storage helper

**Storage**: repository MDX files under `content/posts/*.mdx` through the existing CMS content
adapter; temporary unsaved editor backup in browser-local storage with 30 day TTL

**Testing**: Vitest, Testing Library, package-level TypeScript checks, ESLint, root Turborepo
validation commands

**Target Platform**: Next.js CMS web app running on Node.js/Vercel, with public blog remaining
read-only and local-content based

**Project Type**: monorepo web application with shared editor and markdown packages

**Performance Goals**: editor loads an existing representative post and becomes interactive within
15 seconds after authenticated navigation; preview updates remain responsive for ordinary single
operator blog posts up to 20,000 words

**Constraints**: single-operator MVP only; no database, object storage, collaborative editing, AI
generation, media upload workflow, publish workflow, SEO scoring, analytics dashboard, or scheduled
publishing in this feature

**Scale/Scope**: one protected CMS editor flow, supported MVP MDX subset, local backup for active
drafts, repository optimistic locking via existing SHA contract

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- **I. MVP 범위 규율**: PASS. Scope is limited to editor creation/editing, MDX round-trip, preview,
  and local recovery. Post-MVP and later MVP phases remain excluded.
- **II. 파일 기반 콘텐츠 권위**: PASS. Repository MDX remains canonical. Temporary backup is only a
  recovery aid and never replaces `content/posts/*.mdx`.
- **III. 공유 패키지 소유권**: PASS. Editor document model and MDX round-trip rules belong in
  `packages/editor`; Markdown validation/safety remains in `packages/markdown`; reusable UI remains
  in `packages/design-system`.
- **IV. 안전한 발행 경계**: PASS. Unsupported or unsafe MDX is rejected for edit mode instead of
  being silently transformed. Save operations remain behind existing CMS auth/mutation guards.
- **V. 생성형 SEO 및 분석 산출물**: PASS. SEO score, generated outputs, analytics, and AI generation
  are explicitly out of scope.
- **Documentation and Completion Workflow**: PASS. Planning artifacts are written in Korean, with
  technical identifiers preserved where accuracy requires them.

## Project Structure

### Documentation (this feature)

```text
specs/007-cms-editor/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── editor-document.md
│   ├── editor-mdx-roundtrip.md
│   └── editor-save-recovery.md
└── tasks.md
```

### Source Code (repository root)

```text
apps/cms/
├── app/
│   ├── posts/
│   │   ├── page.tsx
│   │   ├── new/page.tsx
│   │   └── [slug]/page.tsx
│   └── actions/
│       └── editor-actions.ts
├── components/
│   ├── editor/
│   │   ├── editor-screen.tsx
│   │   ├── editor-toolbar.tsx
│   │   ├── frontmatter-panel.tsx
│   │   ├── recovery-banner.tsx
│   │   └── save-status.tsx
│   └── shell/
└── lib/
    ├── auth/
    ├── content-adapter/
    └── editor/
        ├── editor-loader.ts
        ├── editor-save.ts
        └── draft-backup.ts

packages/editor/
└── src/
    ├── document.ts
    ├── mdx-to-editor.ts
    ├── editor-to-mdx.ts
    ├── supported-format.ts
    ├── validation.ts
    └── index.ts

packages/markdown/
└── src/
    └── existing frontmatter, MDX safety, heading, reading-time, and validation helpers

packages/design-system/
└── src/ui/
    └── existing primitives plus only required missing shared primitives
```

**Structure Decision**: `packages/editor` owns reusable editor document, format support, validation,
and MDX conversion. `apps/cms` owns authenticated pages, server actions, protected adapter calls,
local recovery UI, and shell composition. Existing `packages/markdown` helpers remain the source for
frontmatter serialization, MDX safety checks, and blog-compatible analysis.

## Phase 0: Research

Research output is captured in [research.md](./research.md). All technical context choices are
resolved; no `NEEDS CLARIFICATION` items remain.

## Phase 1: Design & Contracts

Design outputs:

- [data-model.md](./data-model.md)
- [contracts/editor-document.md](./contracts/editor-document.md)
- [contracts/editor-mdx-roundtrip.md](./contracts/editor-mdx-roundtrip.md)
- [contracts/editor-save-recovery.md](./contracts/editor-save-recovery.md)
- [quickstart.md](./quickstart.md)

## Constitution Check: Post-Design

- **I. MVP 범위 규율**: PASS. Contracts exclude media upload, publish/revalidation, SEO scoring,
  analytics dashboard, AI generation, collaboration, approval workflow, and scheduled publishing.
- **II. 파일 기반 콘텐츠 권위**: PASS. Data model defines `MdxContent` as canonical and backup as
  temporary non-authoritative state.
- **III. 공유 패키지 소유권**: PASS. Contracts separate `packages/editor` conversion/model behavior
  from CMS screen/action behavior.
- **IV. 안전한 발행 경계**: PASS. Unsupported MDX and unsafe content are explicit rejection states;
  mutations must use existing protected content operations.
- **V. 생성형 SEO 및 분석 산출물**: PASS. SEO/analytics outputs are not introduced.
- **Documentation and Completion Workflow**: PASS. All generated artifacts are Korean-first.

## Complexity Tracking

No constitution violations.
