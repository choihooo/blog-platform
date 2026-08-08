import type { EditorDocument, EditorFrontmatter, EditorNode, PreviewResult } from "./document.js";
import { createEditorIssue } from "./document.js";
import { validateEditorDocument } from "./validation.js";

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
  return typeof value.text === "string";
}

function normalizeNode(node: EditorNode): EditorNode {
  if (node.type === "horizontalRule") return { type: "horizontalRule" };
  if (node.type === "image") {
    return {
      type: "image",
      src: node.src,
      alt: node.alt,
      title: node.title,
      caption: node.caption,
    };
  }
  return {
    type: node.type,
    text: node.text,
    depth: node.depth,
    language: node.language,
    marks: node.marks,
    href: node.href,
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

function parseInline(
  line: string,
): Pick<Extract<EditorNode, { text: string }>, "text" | "marks" | "href"> {
  const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(line);
  if (link?.[1] && link[2]) return { text: link[1], href: link[2] };
  if (/^\*\*.*\*\*$/.test(line)) return { text: line.slice(2, -2), marks: ["bold"] };
  if (/^_.*_$/.test(line)) return { text: line.slice(1, -1), marks: ["italic"] };
  if (/^`.*`$/.test(line)) return { text: line.slice(1, -1), marks: ["inlineCode"] };
  return { text: line };
}

function parseImage(line: string): Extract<EditorNode, { type: "image" }> | undefined {
  const match = /^!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]+)")?\)$/.exec(line);
  if (!match?.[2]) return;
  return { type: "image", alt: match[1] ?? "", src: match[2], title: match[3] };
}

export function legacyMarkdownToPostContent(source: string): StructuredPostContent {
  const nodes: EditorNode[] = [];
  const body = source.replace(/^---\n[\s\S]*?\n---\n?/, "");
  const blocks = body.split(/\n{2,}/);

  for (let index = 0; index < blocks.length; index++) {
    const block = (blocks[index] ?? "").trim();
    if (!block) continue;

    const image = parseImage(block);
    if (image) {
      const next = blocks[index + 1]?.trim();
      if (next && !parseImage(next) && !/^```/.test(next) && !/^(#{1,6})\s+/.test(next)) {
        image.caption = next;
        index++;
      }
      nodes.push(image);
      continue;
    }

    const code = /^```([^\n]*)\n([\s\S]*?)\n```$/.exec(block);
    if (code) {
      nodes.push({ type: "codeBlock", language: code[1] || undefined, text: code[2] ?? "" });
      continue;
    }
    if (/^---+$/.test(block)) {
      nodes.push({ type: "horizontalRule" });
      continue;
    }
    const heading = /^(#{1,6})\s+(.+)$/.exec(block);
    if (heading?.[1] && heading[2]) {
      nodes.push({ type: "heading", depth: heading[1].length, ...parseInline(heading[2]) });
      continue;
    }
    if (block.startsWith("> ")) {
      nodes.push({ type: "blockquote", ...parseInline(block.slice(2)) });
      continue;
    }
    if (block.startsWith("- ")) {
      nodes.push({ type: "bulletList", ...parseInline(block.slice(2)) });
      continue;
    }
    if (/^\d+\.\s+/.test(block)) {
      nodes.push({ type: "orderedList", ...parseInline(block.replace(/^\d+\.\s+/, "")) });
      continue;
    }
    nodes.push({ type: "paragraph", ...parseInline(block) });
  }

  return { version: 1, nodes };
}

export function loadPostContent(source: string): StructuredPostContent {
  return parsePostContent(source) ?? legacyMarkdownToPostContent(source);
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

export function analyzeEditorNodes(nodes: EditorNode[]): PreviewResult {
  const headings: PreviewResult["headings"] = [];
  const codeBlocks: PreviewResult["codeBlocks"] = [];
  const seen = new Map<string, number>();

  for (const node of nodes) {
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
  const words = [...text.matchAll(WORD_RE)].length;
  const minutes = Math.max(1, Math.ceil(words / 220));

  return {
    headings,
    codeBlocks,
    readingTime: {
      minutes,
      words,
      label: `${minutes} min read`,
    },
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
