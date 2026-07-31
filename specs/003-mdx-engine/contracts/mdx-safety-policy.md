# Contract: MDX Safety Policy

## 목적

MDX engine은 repository 글을 공개 블로그와 CMS preview에 넘기기 전에 MVP 안전 경계를 검증한다. 이
정책은 허용된 콘텐츠와 차단할 콘텐츠를 명확히 정의한다.

## 허용 콘텐츠

- 표준 Markdown paragraph, emphasis, strong, link, list, blockquote, thematic break
- Markdown heading
- fenced code block과 inline code
- Markdown table과 task list
- 허용 schema에 맞는 안전한 HTML element
- allowlist에 포함된 MDX component

## 차단 콘텐츠

- inline `<script>` 또는 script와 동등한 실행 요소
- HTML event handler attribute
- 위험한 URL scheme을 가진 link 또는 image source
- MDX `import`와 `export`
- JavaScript expression 기반 runtime evaluation
- allowlist에 없는 JSX component
- raw HTML injection 목적의 prop
- function prop 또는 event handler prop

## 처리 정책

- blocking risk는 validation failure로 처리하고 public/renderable 결과를 반환하지 않는다.
- harmless unsupported syntax는 가능하면 warning으로 보고하되, 출력에 실행 가능한 위험 요소를 남기지
  않는다.
- allowlist 밖 component는 MVP에서 기본적으로 blocking failure다.
- code block language가 없거나 알 수 없는 값이면 글 전체를 실패시키지 않고 일반 code block으로
  fallback할 수 있다.

## Required Error Codes

- `mdx.component.unsupported`: allowlist 밖 component가 발견되었다.
- `mdx.import-export.disallowed`: MDX `import` 또는 `export`가 발견되었다.
- `mdx.script.disallowed`: script 실행 요소가 발견되었다.
- `mdx.event-handler.disallowed`: event handler attribute 또는 prop이 발견되었다.
- `mdx.html.unsafe`: 허용 schema 밖 HTML 또는 위험 attribute가 발견되었다.
- `mdx.runtime-evaluation.disallowed`: runtime evaluation에 해당하는 JavaScript 표현이 발견되었다.
- `mdx.url.unsafe`: link 또는 image에 허용되지 않은 URL scheme이 발견되었다.

## Acceptance Examples

### Markdown heading

```md
## 안전한 제목
```

Expected: heading으로 추출되고 TOC 대상이 될 수 있다.

### Duplicate heading

```md
## Intro

## Intro
```

Expected: 두 heading 모두 고유 slug를 가진다.

### Script

```mdx
<script>alert("x")</script>
```

Expected: `mdx.script.disallowed` failure.

### Event handler

```mdx
<button onClick={() => alert("x")}>Click</button>
```

Expected: `mdx.event-handler.disallowed` failure.

### Import

```mdx
import Widget from "./Widget";
```

Expected: `mdx.import-export.disallowed` failure.
