# Markdown Package

`packages/markdown`는 Markdown/MDX parsing, rendering, metadata extraction, TOC, reading time 같은
content transformation behavior를 소유한다.

Phase 1에서는 content model validation을 제공한다. MDX rendering, syntax highlighting, sanitizer는
Phase 2 Markdown/MDX Engine에서 구현한다.

## Content Model API

```ts
import {
  createSlugCandidate,
  getPublishedPosts,
  parsePostFile,
  validateContentCollection,
  validateUniqueSlug,
} from "@blog-platform/markdown";
```

- `parsePostFile`: `content/posts/*.mdx` frontmatter와 body를 상태별 post로 검증한다.
- `validateContentCollection`: posts, authors, categories, tags, site config를 함께 검증한다.
- `getPublishedPosts`: `published` 글만 반환한다.
- `createSlugCandidate`: 제목에서 URL segment 후보를 만든다.
- `validateUniqueSlug`: 저장 또는 발행 전 slug 충돌을 확인한다.

## Validation

```sh
pnpm --filter @blog-platform/markdown typecheck
pnpm --filter @blog-platform/markdown lint
pnpm --filter @blog-platform/markdown test
```

검증 실패는 `ValidationIssue`의 `code`, `message`, `path`로 보고한다.
