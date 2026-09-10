# Markdown Package

`packages/markdown`는 heading, TOC, reading time, slug 정책처럼 문서 변환에 필요한 순수 함수를
소유한다. 콘텐츠 저장과 editor 문서 변환은 각각 `apps/blog/features/blog`와
`@blog-platform/editor`가 담당한다.

## Content Model API

```ts
import {
  calculateReadingTime,
  createSlugCandidate,
  extractHeadings,
  generateToc,
  validateUniqueSlug,
} from "@blog-platform/markdown";
```

- `extractHeadings`: Markdown heading을 heading 목록으로 추출한다.
- `generateToc`: heading 목록에서 목차를 생성한다.
- `calculateReadingTime`: 본문 기반 예상 읽기 시간을 계산한다.
- `createSlugCandidate`: 제목에서 URL segment 후보를 만든다.
- `validateUniqueSlug`: 저장 또는 발행 전 slug 충돌을 확인한다.

## Validation

```sh
pnpm --filter @blog-platform/markdown typecheck
pnpm --filter @blog-platform/markdown lint
pnpm --filter @blog-platform/markdown test
```

검증 실패는 `ValidationIssue`의 `code`, `message`, `path`로 보고한다.
