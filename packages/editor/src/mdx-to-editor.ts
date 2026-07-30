import { parseMdxDocument, validateMdxSafety } from "@blog-platform/markdown";

import type {
  EditorDocument,
  EditorFrontmatter,
  EditorNode,
  LoadEditorDocumentResult,
} from "./document.js";
import { createEditorIssue } from "./document.js";

function issueFromUnknown(code: string, message: string) {
  return createEditorIssue(code, message, ["body"]);
}

function frontmatter(data: Record<string, unknown>): EditorFrontmatter {
  const known = new Set([
    "title",
    "status",
    "slug",
    "author",
    "publishedAt",
    "updatedAt",
    "excerpt",
    "coverImage",
    "category",
    "tags",
  ]);
  const extra = Object.fromEntries(Object.entries(data).filter(([key]) => !known.has(key)));
  return {
    title: typeof data.title === "string" ? data.title : "",
    status: data.status === "published" || data.status === "archived" ? data.status : "draft",
    slug: typeof data.slug === "string" ? data.slug : undefined,
    author: typeof data.author === "string" ? data.author : undefined,
    publishedAt: typeof data.publishedAt === "string" ? data.publishedAt : undefined,
    updatedAt: typeof data.updatedAt === "string" ? data.updatedAt : undefined,
    excerpt: typeof data.excerpt === "string" ? data.excerpt : undefined,
    coverImage: typeof data.coverImage === "string" ? data.coverImage : undefined,
    category: typeof data.category === "string" ? data.category : undefined,
    tags: Array.isArray(data.tags)
      ? data.tags.filter((tag): tag is string => typeof tag === "string")
      : undefined,
    extra,
  };
}

function parseImage(line: string): Extract<EditorNode, { type: "image" }> | null {
  const match = /^!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]+)")?\)$/.exec(line);
  if (!match?.[2]) return null;
  return { type: "image", alt: match[1] ?? "", src: match[2], title: match[3] };
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

function bodyToNodes(body: string): EditorNode[] {
  const nodes: EditorNode[] = [];
  const blocks = body.split(/\n{2,}/);
  for (let index = 0; index < blocks.length; index++) {
    const raw = blocks[index] ?? "";
    const block = raw.trim();
    if (!block) continue;
    const image: Extract<EditorNode, { type: "image" }> | null = parseImage(block);
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
  return nodes;
}

export function mdxToEditorDocument(input: {
  path: string;
  source: string;
  sha: string;
  now?: Date;
}): LoadEditorDocumentResult {
  if (/^\s*(import|export)\s/m.test(input.source) || /<\s*[A-Z][A-Za-z0-9.]*/.test(input.source)) {
    return {
      ok: false,
      code: "unsupported-mdx",
      issues: [issueFromUnknown("mdx.unsupported", "Unsupported MDX cannot be edited safely")],
      rawSource: input.source,
    };
  }
  const parsed = parseMdxDocument({ path: input.path, source: input.source });
  if (!parsed.success || !parsed.data) {
    return {
      ok: false,
      code: "invalid-frontmatter",
      issues: parsed.issues.map((issue) =>
        createEditorIssue(issue.code, issue.message, issue.path),
      ),
      rawSource: input.source,
    };
  }
  const safety = validateMdxSafety(parsed.data.body);
  if (!safety.success) {
    return {
      ok: false,
      code: "unsafe-mdx",
      issues: safety.issues.map((issue) =>
        createEditorIssue(issue.code, issue.message, issue.path),
      ),
      rawSource: input.source,
    };
  }
  const now = input.now ?? new Date();
  const document: EditorDocument = {
    id: input.path,
    path: input.path,
    sourceSha: input.sha,
    frontmatter: frontmatter(parsed.data.frontmatter),
    body: bodyToNodes(parsed.data.body),
    dirty: false,
    lastLoadedAt: now.toISOString(),
  };
  return { ok: true, document, warnings: [] };
}
