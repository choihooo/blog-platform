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

## MDX Engine API

```ts
import {
  analyzeMdx,
  calculateReadingTime,
  extractHeadings,
  generateToc,
  parseMdxDocument,
  serializeFrontmatter,
  validateMdxSafety,
} from "@blog-platform/markdown";
```

- `parseMdxDocument`: MDX source를 frontmatter와 body로 분리한다.
- `serializeFrontmatter`: metadata를 저장 가능한 frontmatter block으로 만든다.
- `analyzeMdx`: syntax, safety, heading, TOC, reading time, code block metadata를 한 번에 만든다.
- `extractHeadings`: code fence 밖의 Markdown heading을 고유 slug와 함께 추출한다.
- `generateToc`: heading depth 기준으로 TOC를 만든다.
- `calculateReadingTime`: 같은 body에서 deterministic한 reading time을 반환한다.
- `validateMdxSafety`: script, event handler, import/export, unsafe URL, unsupported component를
  차단한다.

MVP에서는 MDX runtime evaluation API를 노출하지 않는다. 지원하지 않는 code block language는 `text`로
fallback한다.
