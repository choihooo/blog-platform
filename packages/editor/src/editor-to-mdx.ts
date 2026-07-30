import { serializeFrontmatter } from "@blog-platform/markdown";

import type { EditorDocument, EditorNode, SerializeEditorDocumentResult } from "./document.js";
import { createEditorIssue } from "./document.js";
import { validateEditorDocument } from "./validation.js";

function metadata(document: EditorDocument): Record<string, unknown> {
  const { extra = {}, ...frontmatter } = document.frontmatter;
  return Object.fromEntries(
    Object.entries({ ...extra, ...frontmatter }).filter(([, value]) => {
      if (Array.isArray(value)) return value.length > 0;
      return value !== undefined && value !== "";
    }),
  );
}

function inlineText(node: Extract<EditorNode, { text: string }>): string {
  let value = node.text;
  for (const mark of node.marks ?? []) {
    if (mark === "bold") value = `**${value}**`;
    if (mark === "italic") value = `_${value}_`;
    if (mark === "inlineCode") value = `\`${value}\``;
  }
  if (node.href) value = `[${value}](${node.href})`;
  return value;
}

function nodeToMdx(node: EditorNode): string {
  if (node.type === "horizontalRule") return "---";
  if (node.type === "image") {
    const image = `![${node.alt ?? ""}](${node.src}${node.title ? ` "${node.title}"` : ""})`;
    return node.caption ? `${image}\n\n${node.caption}` : image;
  }
  if (node.type === "heading") return `${"#".repeat(node.depth ?? 2)} ${inlineText(node)}`;
  if (node.type === "bulletList" || node.type === "listItem") return `- ${inlineText(node)}`;
  if (node.type === "orderedList") return `1. ${inlineText(node)}`;
  if (node.type === "blockquote") return `> ${inlineText(node)}`;
  if (node.type === "codeBlock") return `\`\`\`${node.language ?? ""}\n${node.text}\n\`\`\``;
  return inlineText(node);
}

export function editorDocumentToMdx(document: EditorDocument): SerializeEditorDocumentResult {
  const issues = validateEditorDocument(document);
  if (issues.length > 0) return { ok: false, code: "validation-failure", issues };

  const body = document.body.map(nodeToMdx).join("\n\n").trim();
  const serialized = serializeFrontmatter(metadata(document));
  if (!serialized.success || !serialized.data) {
    return {
      ok: false,
      code: "unsupported-format",
      issues: serialized.issues.map((issue) =>
        createEditorIssue(issue.code, issue.message, issue.path, issue.severity ?? "error"),
      ),
    };
  }

  return {
    ok: true,
    frontmatter: metadata(document),
    body,
    source: `${serialized.data}\n\n${body}\n`,
  };
}
