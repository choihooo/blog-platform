# Data Model: Markdown/MDX Engine

## MDX Document

Repository에 저장된 하나의 MDX 글 원본이다.

### Fields

- `path`: repository 기준 파일 경로
- `source`: frontmatter와 본문을 포함한 원문
- `frontmatter`: parsing된 metadata
- `body`: frontmatter를 제외한 MDX 본문

### Validation Rules

- `path`는 비어 있으면 안 된다.
- `source`는 frontmatter parsing 실패를 명확한 validation failure로 반환해야 한다.
- `body`는 draft에서는 비어 있을 수 있지만 published rendering 대상에서는 기존 콘텐츠 모델 검증을
  따라야 한다.

## Frontmatter Metadata

글 상태와 공개 metadata를 표현하는 구조화된 값이다.

### Fields

- `status`: `draft`, `published`, `archived`
- `title`
- `slug`
- `author`
- `publishedAt`
- `updatedAt`
- `excerpt`
- `coverImage`
- `category`
- `tags`

### Validation Rules

- Phase 1의 `Post` validation rules를 재사용한다.
- serialization 결과는 다시 parsing했을 때 같은 metadata 의미를 유지해야 한다.
- 지원하지 않는 metadata field는 보존 정책을 명시하거나 validation failure로 처리해야 한다.

## Rendered Content

안전성 검증을 통과해 공개 블로그나 CMS preview에서 표시 준비가 된 본문 표현이다.

### Fields

- `body`: 검증된 MDX body
- `headings`: 추출된 heading 목록
- `toc`: TOC 항목 목록
- `readingTime`: 예상 읽기 시간
- `codeBlocks`: 표시 준비된 code block metadata
- `warnings`: rendering은 가능하지만 운영자가 확인할 수 있는 비차단 경고

### Validation Rules

- unsafe HTML, script, event handler, import/export, runtime evaluation, unsupported component가
  실행 가능한 출력에 남아서는 안 된다.
- 같은 입력에서 `headings`, `toc`, `readingTime`은 반복 실행마다 동일해야 한다.

## Heading

본문 안의 제목 단위다.

### Fields

- `depth`: heading level
- `text`: 표시 텍스트
- `slug`: 같은 문서 안에서 고유한 anchor

### Validation Rules

- `depth`는 Markdown heading level 범위 안에 있어야 한다.
- `text`가 비어 있으면 TOC 대상에서 제외한다.
- `slug`는 같은 문서 안에서 중복되면 안 된다.

## Table of Contents

게시글 탐색에 사용할 heading metadata 목록이다.

### Fields

- `items`: heading depth, text, slug를 가진 순서 있는 목록
- `minDepth`
- `maxDepth`

### Validation Rules

- `items`는 본문 등장 순서를 유지해야 한다.
- 허용 depth 밖의 heading은 제외한다.
- heading이 없으면 빈 목록을 반환한다.

## Reading Time

본문 길이를 기준으로 계산한 예상 읽기 시간이다.

### Fields

- `minutes`
- `words`
- `label`

### Validation Rules

- 같은 본문은 같은 값을 반환해야 한다.
- 빈 본문은 0 또는 최소 표시 정책 중 하나로 일관되게 표현해야 한다.
- code block과 JSX text 처리 방식은 테스트로 고정해야 한다.

## Allowed Component

MVP에서 렌더링 대상으로 허용한 MDX component다.

### Fields

- `name`
- `allowedProps`
- `fallbackBehavior`

### Validation Rules

- allowlist에 없는 component는 실패 또는 안전한 fallback으로 처리한다.
- function prop, event handler, raw HTML injection prop은 허용하지 않는다.

## Validation Failure

운영자가 수정할 수 있도록 반환되는 실패 사유다.

### Fields

- `code`
- `message`
- `path`
- `severity`

### Validation Rules

- 실패 code는 계약 문서의 required error code 중 하나여야 한다.
- 가능한 경우 `path`는 파일 경로와 field 또는 AST 위치를 포함해야 한다.
- 공개 가능한 출력 생성 전에 blocking failure가 있으면 성공 결과를 반환하지 않는다.
