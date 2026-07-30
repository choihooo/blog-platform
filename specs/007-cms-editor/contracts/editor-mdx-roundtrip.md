# Contract: Editor MDX Round-Trip

## Purpose

`packages/editor`가 supported editor document와 repository MDX file 사이의 변환을 제공한다. 변환은
손실 가능성이 있을 때 성공으로 위장하지 않는다.

## Load MDX

```ts
type LoadEditorDocumentInput = {
  path: string;
  source: string;
  sha: string;
};

type LoadEditorDocumentResult =
  | {
      ok: true;
      document: EditorDocument;
      warnings: EditorIssue[];
    }
  | {
      ok: false;
      code: "unsupported-mdx" | "invalid-frontmatter" | "unsafe-mdx";
      issues: EditorIssue[];
      rawSource: string;
    };
```

## Serialize MDX

```ts
type SerializeEditorDocumentInput = {
  document: EditorDocument;
};

type SerializeEditorDocumentResult =
  | {
      ok: true;
      source: string;
      frontmatter: Record<string, unknown>;
      body: string;
    }
  | {
      ok: false;
      code: "validation-failure" | "unsupported-format";
      issues: EditorIssue[];
    };
```

## Round-Trip Rules

- Supported paragraph, heading, list, blockquote, horizontal rule, link, image reference, inline
  code, code block, bold, and italic content must preserve the same meaning after
  `MDX -> EditorDocument -> MDX -> EditorDocument`.
- Frontmatter fields not edited by the CMS but accepted by the content model should be preserved
  unless they conflict with the editor's explicit save inputs.
- Unsupported MDX import/export, arbitrary JSX, unsafe HTML, event handler, and runtime expression
  must return a blocked result.
- Unsafe URL schemes must return a blocked result.
- Code blocks must preserve language when present and use fallback behavior when language is absent.

## Validation Scenarios

- Paragraph-only draft round-trips.
- Heading hierarchy round-trips and remains available for TOC generation.
- Bullet and ordered lists round-trip.
- Blockquote and horizontal rule round-trip.
- Link mark round-trips with safe URL.
- Image reference round-trips only when src is an existing public path.
- Code block round-trips with language and fallback cases.
- Unsupported MDX component returns `unsupported-mdx`.
- Import/export and script-like content return blocked results.
