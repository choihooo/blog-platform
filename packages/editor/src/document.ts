export type EditorNodeType =
  | "paragraph"
  | "heading"
  | "bulletList"
  | "orderedList"
  | "listItem"
  | "blockquote"
  | "horizontalRule"
  | "codeBlock"
  | "image";

export type EditorMark = "bold" | "italic" | "link" | "inlineCode";

export type EditorToolbarCommand =
  EditorNodeType | EditorMark | "undo" | "redo" | "preview" | "save";

export type EditorIssue = {
  code: string;
  message: string;
  path: string[];
  severity: "error" | "warning";
};

export type EditorFrontmatter = {
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
  extra?: Record<string, unknown>;
};

export type EditorTextNode = {
  type: Exclude<EditorNodeType, "horizontalRule" | "image">;
  text: string;
  depth?: number;
  language?: string;
  marks?: EditorMark[];
  href?: string;
};

export type EditorNode =
  | EditorTextNode
  | { type: "horizontalRule" }
  | { type: "image"; src: string; alt?: string; title?: string; caption?: string };

export type EditorDocument = {
  id: string;
  path?: string;
  sourceSha?: string;
  frontmatter: EditorFrontmatter;
  body: EditorNode[];
  dirty: boolean;
  lastLoadedAt: string;
  lastSavedAt?: string;
};

export type EditorFailureCode =
  | "unsupported-mdx"
  | "invalid-frontmatter"
  | "unsafe-mdx"
  | "validation-failure"
  | "unsupported-format"
  | "auth-required"
  | "forbidden"
  | "session-expired"
  | "stale-file"
  | "temporary-connectivity"
  | "unknown";

export type LoadEditorDocumentResult =
  | { ok: true; document: EditorDocument; warnings: EditorIssue[] }
  | {
      ok: false;
      code: "unsupported-mdx" | "invalid-frontmatter" | "unsafe-mdx";
      issues: EditorIssue[];
      rawSource: string;
    };

export type SerializeEditorDocumentResult =
  | { ok: true; source: string; frontmatter: Record<string, unknown>; body: string }
  | { ok: false; code: "validation-failure" | "unsupported-format"; issues: EditorIssue[] };

export type PreviewResult = {
  headings: Array<{ depth: number; text: string; slug: string }>;
  codeBlocks: Array<{ language: string; fallback: boolean }>;
  readingTime: { minutes: number; words: number; label: string };
  warnings: EditorIssue[];
};

export function createEditorIssue(
  code: string,
  message: string,
  path: string[],
  severity: "error" | "warning" = "error",
): EditorIssue {
  return { code, message, path, severity };
}

export function createTextNode(
  type: EditorTextNode["type"],
  text: string,
  extra: Omit<EditorTextNode, "type" | "text"> = {},
): EditorTextNode {
  return { type, text, ...extra };
}

export function createEmptyEditorDocument(now = new Date()): EditorDocument {
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `draft-${now.getTime()}`;

  return {
    id,
    frontmatter: { title: "", status: "draft" },
    body: [],
    dirty: false,
    lastLoadedAt: now.toISOString(),
  };
}

export function isEditorFailureCode(value: string): value is EditorFailureCode {
  return [
    "unsupported-mdx",
    "invalid-frontmatter",
    "unsafe-mdx",
    "validation-failure",
    "unsupported-format",
    "auth-required",
    "forbidden",
    "session-expired",
    "stale-file",
    "temporary-connectivity",
    "unknown",
  ].includes(value);
}
