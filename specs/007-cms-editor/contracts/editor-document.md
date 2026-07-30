# Contract: Editor Document

## Purpose

`packages/editor`가 CMS rich editor와 MDX 저장 형식 사이에서 공유하는 document contract다. CMS UI는
이 contract를 기준으로 toolbar state, dirty state, preview, save validation을 판단한다.

## Supported Format

```ts
type SupportedBlock =
  | "paragraph"
  | "heading"
  | "bulletList"
  | "orderedList"
  | "listItem"
  | "blockquote"
  | "horizontalRule"
  | "codeBlock"
  | "image";

type SupportedMark = "bold" | "italic" | "link" | "inlineCode";
```

## Document Shape

```ts
type EditorDocument = {
  id: string;
  path?: string;
  sourceSha?: string;
  frontmatter: EditorFrontmatter;
  body: EditorNode[];
  dirty: boolean;
  lastLoadedAt: string;
  lastSavedAt?: string;
};

type EditorFrontmatter = {
  title: string;
  status: "draft" | "published" | "archived";
  slug?: string;
  author?: string;
  publishedAt?: string;
  updatedAt?: string;
  excerpt?: string;
  coverImage?: string;
  category?: string;
  tags?: string[];
};
```

## Required Behaviors

- `createEmptyEditorDocument` creates a draft document with an empty title, empty body, temporary
  id, and no repository path.
- `validateEditorDocument` returns blocking issues for empty title on save, unsupported nodes,
  unsafe links, blob/data image references, and invalid status transitions.
- `getSupportedToolbarState` reports whether each supported command is active, available, or
  disabled.
- `EditorDocument` must not contain arbitrary executable expressions, MDX imports/exports, or
  unsupported JSX nodes.

## Exclusions

- Media file upload and conversion are not part of this contract.
- Publish/unpublish/archive mutations are not part of this contract.
- SEO scoring and generated metadata are not part of this contract.
