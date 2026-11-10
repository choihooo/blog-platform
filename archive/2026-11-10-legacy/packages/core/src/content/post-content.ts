import type { EditorDocument, EditorFrontmatter, EditorNode, PreviewResult } from "./document.js";
import { createEditorIssue } from "./document.js";
import { validateEditorDocument } from "./validation.js";
import { markdownToEditorNodes } from "./rich-content.js";

export type StructuredPostContent = {
  version: 1;
  nodes: EditorNode[];
};

export type PostRecordLike = {
  id: string;
  slug: string;
  title: string;
  content: string;
  summary: string;
  categoryPath?: string | null;
  heroImageKey?: string | null;
  publishedAt?: string | null;
  updatedAt: string;
  isPublished: 0 | 1;
  viewCount: number;
  tags?: string[];
};

const WORD_RE = /[\p{L}\p{N}_'-]+/gu;

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isEditorNode(value: unknown): value is EditorNode {
  if (!isObject(value) || typeof value.type !== "string") return false;
  if (value.type === "horizontalRule") return true;
  if (value.type === "image") return typeof value.src === "string";
  if (value.type === "table")
    return (
      Array.isArray(value.rows) &&
      value.rows.every(
        (row) =>
          Array.isArray(row) &&
          row.every(
            (cell) => isObject(cell) && Array.isArray(cell.body) && cell.body.every(isEditorNode),
          ),
      )
    );
  return typeof value.text === "string";
}

function normalizeNode(node: EditorNode): EditorNode {
  if (node.type === "horizontalRule") return { type: "horizontalRule" };
  if (node.type === "table")
    return {
      type: "table",
      rows: node.rows.map((row) =>
        row.map((cell) => ({ ...cell, body: cell.body.map(normalizeNode) })),
      ),
    };
  if (node.type === "image") {
    return {
      type: "image",
      src: node.src,
      alt: node.alt,
      title: node.title,
      caption: node.caption,
      captionContent: node.captionContent,
      href: node.href,
    };
  }
  return {
    type: node.type,
    text: node.text,
    depth: node.depth,
    language: node.language,
    marks: node.marks,
    href: node.href,
    content: node.content,
    items: node.items?.map((item) => item.map(normalizeNode)),
    start: node.start,
    children: node.children?.map(normalizeNode),
  };
}

function isUnsafeMediaUrl(value: string): boolean {
  return /^\s*(javascript|data|blob|file|attachment):/i.test(value);
}

function isLocalMediaPath(value: string): boolean {
  return /^([a-z]:[\\/]|\/(?!media\/))/i.test(value);
}

function isPersistedMediaUrl(value: string): boolean {
  return !isUnsafeMediaUrl(value) && !isLocalMediaPath(value);
}

function sanitizeEditorNode(node: EditorNode): EditorNode | undefined {
  const normalized = normalizeNode(node);
  if (normalized.type === "image" && !isPersistedMediaUrl(normalized.src)) return undefined;
  return normalized;
}

function sanitizeMediaUrl(value: string | null | undefined): string | undefined {
  if (!value || !isPersistedMediaUrl(value)) return undefined;
  return value;
}

export function editorDocumentToPostContent(document: EditorDocument): StructuredPostContent {
  return {
    version: 1,
    nodes: document.body.map(normalizeNode),
  };
}

export function serializePostContent(content: StructuredPostContent): string {
  return JSON.stringify({ version: 1, nodes: content.nodes.map(normalizeNode) });
}

export function parsePostContent(source: string): StructuredPostContent | undefined {
  try {
    const parsed = JSON.parse(source) as unknown;
    if (
      isObject(parsed) &&
      parsed.version === 1 &&
      Array.isArray(parsed.nodes) &&
      parsed.nodes.every(isEditorNode)
    ) {
      return { version: 1, nodes: parsed.nodes.map((node) => normalizeNode(node)) };
    }
  } catch {
    return undefined;
  }
  return undefined;
}

export function legacyMarkdownToPostContent(source: string): StructuredPostContent {
  return { version: 1, nodes: markdownToEditorNodes(source) };
}

export function loadPostContent(source: string): StructuredPostContent {
  return parsePostContent(source) ?? legacyMarkdownToPostContent(source);
}

/** Read-only projection of persisted rich content; does not widen the editable model. */
export function textFromPostContent(source: string): string {
  let parsed: unknown;
  try {
    parsed = JSON.parse(source);
  } catch {
    // A broken editor envelope is not Markdown prose.
    if (/^\s*\{/.test(source) && /"nodes"\s*:/.test(source)) return "";
  }
  if (!isObject(parsed) || (!("nodes" in parsed) && parsed.version !== 1))
    return textFromEditorNodes(loadPostContent(source).nodes);
  if (parsed.version !== 1 || !Array.isArray(parsed.nodes)) return "";
  function text(value: unknown, depth = 0): string {
    if (depth > 40) return "";
    if (Array.isArray(value))
      return value
        .map((v) => text(v, depth + 1))
        .filter(Boolean)
        .join("\n\n");
    if (!isObject(value) || value.type === "horizontalRule") return "";
    if (value.type === "table" && Array.isArray(value.rows))
      return value.rows
        .map((row) =>
          Array.isArray(row)
            ? row.map((cell) => text(cell, depth + 1).replace(/\s+/g, " ")).join(" | ")
            : "",
        )
        .filter(Boolean)
        .join("\n");
    if (value.type === "image")
      return [value.alt, value.title, value.caption].filter((v) => typeof v === "string").join(" ");
    if (typeof value.text === "string") return value.text;
    return text(value.body ?? value.content ?? value.items ?? value.children, depth + 1);
  }
  return text(parsed.nodes);
}

function postStatus(post: PostRecordLike): EditorFrontmatter["status"] {
  if (post.isPublished === 1) return "published";
  return post.publishedAt ? "archived" : "draft";
}

export function postRecordToEditorDocument(post: PostRecordLike, now = new Date()): EditorDocument {
  const content = loadPostContent(post.content);
  const nodes = content.nodes.flatMap((node) => {
    const sanitized = sanitizeEditorNode(node);
    return sanitized ? [sanitized] : [];
  });
  return {
    id: post.id || post.slug,
    path: `db/posts/${post.slug}`,
    sourceSha: `${post.updatedAt}:${post.slug}`,
    frontmatter: {
      title: post.title,
      status: postStatus(post),
      slug: post.slug,
      author: "db",
      publishedAt: post.publishedAt ?? undefined,
      updatedAt: post.updatedAt,
      excerpt: post.summary,
      coverImage: sanitizeMediaUrl(post.heroImageKey),
      category: post.categoryPath ?? undefined,
      tags: post.tags,
    },
    body: nodes,
    dirty: false,
    lastLoadedAt: now.toISOString(),
    lastSavedAt: post.updatedAt,
  };
}

export function textFromEditorNodes(nodes: EditorNode[]): string {
  return nodes
    .map((node) => {
      if (node.type === "horizontalRule") return "";
      if (node.type === "table")
        return node.rows
          .map((row) => row.map((cell) => textFromEditorNodes(cell.body)).join(" | "))
          .join("\n");
      if ("items" in node && node.items) return node.items.map(textFromEditorNodes).join("\n");
      if ("children" in node && node.children) return textFromEditorNodes(node.children);
      if (node.type === "image")
        return [node.alt, node.title, node.caption].filter(Boolean).join(" ");
      return node.text;
    })
    .filter(Boolean)
    .join("\n\n");
}

function slugify(value: string) {
  const ascii = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣ㄱ-ㅎㅏ-ㅣ]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return ascii || "section";
}

export function calculateReadingTime(text: string): PreviewResult["readingTime"] {
  const words = [...text.matchAll(WORD_RE)].length;
  const minutes = Math.max(1, Math.ceil(words / 220));
  return { minutes, words, label: `${minutes} min read` };
}

export function analyzeEditorNodes(nodes: EditorNode[]): PreviewResult {
  const headings: PreviewResult["headings"] = [];
  const codeBlocks: PreviewResult["codeBlocks"] = [];
  const seen = new Map<string, number>();

  const flatten = (body: EditorNode[]): EditorNode[] =>
    body.flatMap((node) => [
      node,
      ...(node.type === "table"
        ? node.rows.flatMap((row) => row.flatMap((cell) => flatten(cell.body)))
        : "items" in node && node.items
          ? node.items.flatMap(flatten)
          : "children" in node && node.children
            ? flatten(node.children)
            : []),
    ]);
  for (const node of flatten(nodes)) {
    if (node.type === "heading") {
      const base = slugify(node.text);
      const count = seen.get(base) ?? 0;
      seen.set(base, count + 1);
      headings.push({
        depth: node.depth ?? 2,
        text: node.text,
        slug: count === 0 ? base : `${base}-${count + 1}`,
      });
    }
    if (node.type === "codeBlock") {
      codeBlocks.push({ language: node.language ?? "text", fallback: !node.language });
    }
  }

  const text = textFromEditorNodes(nodes);

  return {
    headings,
    codeBlocks,
    readingTime: calculateReadingTime(text),
    warnings: [],
  };
}

export function previewEditorDocumentFromNodes(document: EditorDocument): PreviewResult {
  const issues = validateEditorDocument(document);
  if (issues.length > 0) {
    return {
      headings: [],
      codeBlocks: [],
      readingTime: { minutes: 0, words: 0, label: "0 min read" },
      warnings: issues,
    };
  }
  return analyzeEditorNodes(document.body);
}

export function validationFailure(message = "Editor document cannot be saved") {
  return createEditorIssue("editor.validation", message, ["body"]);
}
