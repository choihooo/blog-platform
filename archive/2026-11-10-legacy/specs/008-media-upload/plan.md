# Implementation Plan: Media Upload

**Branch**: `008-media-upload` | **Date**: 2026-07-30 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/008-media-upload/spec.md`

## Summary

CMS editor에 본문 이미지와 커버 이미지 업로드 흐름을 추가한다. 기존 `ContentAdapter.commitMedia`
경계를 재사용해 미디어는 `public/media` 아래 repository 파일로 commit하고, editor document와
frontmatter에는 업로드 성공 후 공개 경로만 반영한다. 이미지 검증, 파일명 생성, 변환, 실패 mapping은
CMS media upload helper와 server action으로 분리하고, editor UI는 업로드 상태와 재시도 판단을
보여준다.

## Technical Context

**Language/Version**: TypeScript, React 19, Next.js App Router, Node.js

**Primary Dependencies**: 기존 `@blog-platform/editor`, `@blog-platform/design-system`,
`apps/cms/lib/content-adapter`, `apps/cms/lib/auth`; 이미지 정규화용 `sharp` 추가

**Storage**: GitHub repository 파일. 글은 `content/posts/*.mdx`, 미디어는 `public/media/covers/`와
`public/media/posts/<slug>/` 아래 저장

**Testing**: Vitest, Testing Library, package별 `typecheck`, `lint`, `test`

**Target Platform**: 단일 운영자 CMS web app, Vercel/Node.js runtime

**Project Type**: 모노레포 web application feature

**Performance Goals**: 2MB 이하 대표 이미지는 일반 로컬/개발 환경에서 10초 이내 성공 또는 실패
상태를 반환한다.

**Constraints**: 파일당 2MB 제한, 허용 확장자 `webp/png/jpg/jpeg`, 가능한 경우 webp 정규화,
blob/data URL 저장 금지, object storage 금지, 미사용 파일 자동 삭제 제외

**Scale/Scope**: 단일 운영자 MVP. CMS editor의 본문 이미지와 커버 이미지 업로드만 포함하고 publish,
SEO scoring, analytics dashboard, AI 생성은 제외한다.

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- **MVP 범위 규율**: 통과. object storage, 예약 발행, AI 생성, 분석 대시보드, 다중 작성자 기능을
  도입하지 않는다.
- **파일 기반 콘텐츠 권위**: 통과. 미디어는 `public/media` 아래 repository 파일로 저장하고 글 원본은
  계속 MDX/frontmatter다.
- **공유 패키지 소유권**: 통과. editor document의 이미지 참조 모델은 `packages/editor`, CMS upload
  orchestration은 `apps/cms`, 저장 adapter는 기존 `apps/cms/lib/content-adapter`가 소유한다.
- **안전한 발행 경계**: 통과. CMS mutation은 기존 관리자 guard를 통과해야 하며, 공개 출력에는 성공한
  public path만 남긴다.
- **생성형 SEO 및 분석 산출물**: 통과. OG/SEO/analytics 산출물 생성은 이번 feature 범위 밖이다.
- **한국어 문서화 및 완료 workflow**: 통과. 산출물은 한국어로 작성하고 완료 시 변경사항을
  commit한다.

## Project Structure

### Documentation (this feature)

```text
specs/008-media-upload/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── media-upload-action.md
│   └── editor-media-state.md
└── tasks.md
```

### Source Code (repository root)

```text
apps/cms/
├── app/actions/
│   ├── editor-actions.ts
│   └── editor-actions.test.ts
├── components/editor/
│   ├── editor-screen.tsx
│   ├── editor-toolbar.tsx
│   ├── frontmatter-panel.tsx
│   ├── media-upload-control.tsx
│   ├── media-upload-control.test.tsx
│   ├── media-upload-status.tsx
│   └── media-upload-status.test.tsx
└── lib/
    ├── content-adapter/
    │   ├── commit-intent.ts
    │   ├── local-adapter.ts
    │   ├── github-adapter.ts
    │   ├── media.test.ts
    │   └── types.ts
    └── editor/
        ├── editor-media.ts
        ├── editor-media.test.ts
        ├── media-file.ts
        ├── media-file.test.ts
        ├── media-path.ts
        ├── media-path.test.ts
        └── index.ts

packages/editor/
└── src/
    ├── document.ts
    ├── editor-to-mdx.ts
    ├── validation.ts
    └── *.test.ts

public/media/
├── covers/
└── posts/
```

**Structure Decision**: 기존 CMS editor와 content adapter 경계를 유지한다. 이미지 파일 검증/경로
생성은 CMS 전용 helper가 담당하고, editor package는 저장 가능한 이미지 참조와 MDX 직렬화 규칙만
소유한다.

## Complexity Tracking

헌법 위반이 없어 추가 복잡도 정당화 항목은 없다.

## Phase 0: Research

See [research.md](./research.md).

## Phase 1: Design & Contracts

See [data-model.md](./data-model.md), [media-upload-action.md](./contracts/media-upload-action.md),
[editor-media-state.md](./contracts/editor-media-state.md), and [quickstart.md](./quickstart.md).

## Post-Design Constitution Check

- **MVP 범위 규율**: 통과. contracts는 repository media commit과 editor 상태 반영만 다룬다.
- **파일 기반 콘텐츠 권위**: 통과. data model의 `MediaFile`은 public repository path를 canonical
  참조로 사용한다.
- **공유 패키지 소유권**: 통과. image node 확장은 `packages/editor`, 인증/commit orchestration은
  `apps/cms`에 남긴다.
- **안전한 발행 경계**: 통과. contract는 auth failure, session expiry, forbidden 상태에서 repository
  mutation과 저장 가능한 document 변경을 모두 차단한다.
- **생성형 SEO 및 분석 산출물**: 통과. SEO/analytics는 quickstart 검증 범위에 포함하지 않는다.
- **한국어 문서화 및 완료 workflow**: 통과. 모든 산출물은 한국어로 작성됐다.
