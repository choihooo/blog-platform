# Contract: Markdown Package MDX Engine API

## 목적

`packages/markdown`는 MDX 글을 분석하고 공개 블로그와 CMS preview가 공유할 수 있는 deterministic
metadata를 생성한다. 이 계약은 렌더링 UI를 직접 정의하지 않고, 이후 app phase가 사용할 안정적인 입력
및 검증 결과를 정의한다.

## Public Types

```ts
interface MdxDocumentInput {
  path: string;
  source: string;
}

interface Heading {
  depth: number;
  text: string;
  slug: string;
}

interface TocItem {
  depth: number;
  text: string;
  slug: string;
}

interface ReadingTimeResult {
  minutes: number;
  words: number;
  label: string;
}

interface MdxAnalysis {
  path: string;
  frontmatter: Record<string, unknown>;
  body: string;
  headings: Heading[];
  toc: TocItem[];
  readingTime: ReadingTimeResult;
  warnings: ValidationIssue[];
}
```

## Public Functions

### `parseMdxDocument(input)`

```ts
parseMdxDocument(input: MdxDocumentInput): ValidationResult<{
  path: string;
  frontmatter: Record<string, unknown>;
  body: string;
}>
```

### Contract

- frontmatter와 body를 분리한다.
- frontmatter parsing 실패는 `mdx.frontmatter.invalid`로 반환한다.
- 반환된 body는 leading/trailing whitespace 정책을 일관되게 적용한다.

### `serializeFrontmatter(metadata)`

```ts
serializeFrontmatter(metadata: Record<string, unknown>): ValidationResult<string>
```

### Contract

- 저장 가능한 frontmatter block을 반환한다.
- 지원하지 않는 값 형태는 `mdx.frontmatter.unsupported-value`로 실패한다.
- serialize 후 다시 parse했을 때 같은 metadata 의미를 유지해야 한다.

### `analyzeMdx(input, options?)`

```ts
analyzeMdx(
  input: MdxDocumentInput,
  options?: {
    tocMinDepth?: number;
    tocMaxDepth?: number;
    allowedComponents?: string[];
  },
): ValidationResult<MdxAnalysis>
```

### Contract

- frontmatter/body 분리, MDX syntax 확인, safety validation, heading 추출, TOC 생성, reading time
  계산을 한 번에 수행한다.
- blocking safety failure가 있으면 `success: false`를 반환한다.
- 같은 입력과 option은 같은 결과를 반환해야 한다.

### `extractHeadings(body)`

```ts
extractHeadings(body: string): ValidationResult<Heading[]>
```

### Contract

- MDX body에서 Markdown heading을 순서대로 추출한다.
- duplicate heading text는 고유 slug로 disambiguation한다.
- code block 안의 `#` 텍스트는 heading으로 취급하지 않는다.

### `generateToc(headings, options?)`

```ts
generateToc(
  headings: Heading[],
  options?: { minDepth?: number; maxDepth?: number },
): TocItem[]
```

### Contract

- 허용 depth 범위의 heading만 포함한다.
- 입력 순서를 유지한다.
- heading이 없으면 빈 배열을 반환한다.

### `calculateReadingTime(body)`

```ts
calculateReadingTime(body: string): ReadingTimeResult
```

### Contract

- 본문 텍스트 기준으로 단어 수와 예상 분을 반환한다.
- 같은 입력에 대해 deterministic해야 한다.
- 표시 label은 운영자와 독자가 이해할 수 있는 짧은 문자열이어야 한다.

### `validateMdxSafety(body, options?)`

```ts
validateMdxSafety(
  body: string,
  options?: { allowedComponents?: string[] },
): ValidationResult<{ warnings: ValidationIssue[] }>
```

### Contract

- unsafe HTML, inline script, event handler, import/export, runtime evaluation, unsupported
  component를 차단한다.
- 실패는 [mdx-safety-policy.md](./mdx-safety-policy.md)의 error code를 사용한다.

## Required Error Codes

- `mdx.frontmatter.invalid`
- `mdx.frontmatter.unsupported-value`
- `mdx.syntax.invalid`
- `mdx.heading.invalid`
- `mdx.component.unsupported`
- `mdx.import-export.disallowed`
- `mdx.script.disallowed`
- `mdx.event-handler.disallowed`
- `mdx.html.unsafe`
- `mdx.runtime-evaluation.disallowed`

## Non-Goals

- 공개 블로그 route 구현
- CMS editor UI 구현
- Tiptap JSON과 MDX round-trip 구현
- GitHub write mutation
- SEO score 계산
- RSS, Sitemap, JSON-LD, OG image 생성
