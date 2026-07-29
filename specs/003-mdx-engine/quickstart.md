# Quickstart: Markdown/MDX Engine

## 목적

이 문서는 `Markdown/MDX Engine` 구현 후 기능이 end-to-end로 동작하는지 검증하는 절차다.

## Prerequisites

- repository root에서 `pnpm install`이 완료되어 있어야 한다.
- `content/posts/hello-world.mdx` 샘플 글이 존재해야 한다.
- `packages/markdown` package가 workspace에 포함되어 있어야 한다.

## Validation Commands

```sh
pnpm --filter @blog-platform/markdown typecheck
pnpm --filter @blog-platform/markdown lint
pnpm --filter @blog-platform/markdown test
```

## Scenario 1: 유효한 MDX 분석

1. 유효한 frontmatter와 여러 heading을 가진 MDX fixture를 준비한다.
2. `analyzeMdx`를 실행한다.
3. 결과가 `success: true`인지 확인한다.
4. `frontmatter`, `body`, `headings`, `toc`, `readingTime`이 모두 반환되는지 확인한다.

Expected outcome:

- heading은 본문 순서대로 추출된다.
- TOC는 허용 depth만 포함한다.
- reading time은 양수 단어 수와 사람이 읽을 수 있는 label을 가진다.

## Scenario 2: 중복 heading slug

1. 같은 heading text가 두 번 이상 등장하는 MDX fixture를 준비한다.
2. `extractHeadings`를 실행한다.

Expected outcome:

- 모든 heading slug가 같은 문서 안에서 고유하다.
- 같은 입력을 반복 실행해도 slug 목록은 동일하다.

## Scenario 3: 안전하지 않은 MDX 차단

1. `<script>`, event handler, `import`, unsupported component를 각각 포함한 fixture를 준비한다.
2. `validateMdxSafety` 또는 `analyzeMdx`를 실행한다.

Expected outcome:

- 위험 fixture는 `success: false`를 반환한다.
- failure code는 `contracts/mdx-safety-policy.md`의 required error code와 일치한다.
- public/renderable 결과에 실행 가능한 위험 요소가 남지 않는다.

## Scenario 4: frontmatter round-trip

1. 대표 metadata object를 `serializeFrontmatter`로 변환한다.
2. 변환 결과를 `parseMdxDocument`가 읽을 수 있는 MDX source로 다시 구성한다.
3. parsing된 metadata가 원래 metadata와 같은 의미를 가지는지 확인한다.

Expected outcome:

- array, string, date-like string이 안정적으로 보존된다.
- 지원하지 않는 값은 명확한 validation failure를 반환한다.

## Scenario 5: 전체 workspace 검증

```sh
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

Expected outcome:

- `packages/markdown` 변경이 workspace의 다른 package와 app build를 깨뜨리지 않는다.
- 공개 블로그와 CMS가 아직 직접 렌더링을 연결하지 않았더라도 shared package contract는 build 가능한
  상태다.

## 구현 메모

- MDX runtime evaluation API는 노출하지 않는다.
- `analyzeMdx`는 syntax 확인, safety validation, heading/TOC, reading time, code block metadata를
  반환한다.
- 지원하지 않는 code block language는 `text`로 fallback한다.
