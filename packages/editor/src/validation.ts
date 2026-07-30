import type { EditorDocument, EditorIssue, EditorNode } from "./document.js";
import { createEditorIssue } from "./document.js";
import { isSupportedBlock, isSupportedMark } from "./supported-format.js";

function isUnsafeUrl(value: string): boolean {
  return /^\s*(javascript|data|blob):/i.test(value);
}

function validateNode(node: EditorNode, index: number): EditorIssue[] {
  const issues: EditorIssue[] = [];
  if (!isSupportedBlock(node.type)) {
    issues.push(
      createEditorIssue("editor.node.unsupported", "Unsupported editor node", [
        "body",
        String(index),
      ]),
    );
  }
  if ("marks" in node) {
    for (const mark of node.marks ?? []) {
      if (!isSupportedMark(mark)) {
        issues.push(
          createEditorIssue("editor.mark.unsupported", "Unsupported editor mark", [
            "body",
            String(index),
            mark,
          ]),
        );
      }
    }
  }
  if ("href" in node && node.href && isUnsafeUrl(node.href)) {
    issues.push(
      createEditorIssue("editor.link.unsafe", "Unsafe link URL", ["body", String(index), "href"]),
    );
  }
  if (node.type === "image" && isUnsafeUrl(node.src)) {
    issues.push(
      createEditorIssue("editor.image.unsafe", "Unsafe image URL", ["body", String(index), "src"]),
    );
  }
  if (
    node.type === "heading" &&
    "depth" in node &&
    node.depth &&
    (node.depth < 1 || node.depth > 6)
  ) {
    issues.push(
      createEditorIssue("editor.heading.depth", "Heading depth must be between 1 and 6", [
        "body",
        String(index),
        "depth",
      ]),
    );
  }
  return issues;
}

export function validateEditorDocument(document: EditorDocument): EditorIssue[] {
  const issues: EditorIssue[] = [];
  if (!document.frontmatter.title.trim()) {
    issues.push(
      createEditorIssue("editor.title.required", "Title is required before saving", [
        "frontmatter",
        "title",
      ]),
    );
  }
  if (!["draft", "published", "archived"].includes(document.frontmatter.status)) {
    issues.push(
      createEditorIssue("editor.status.invalid", "Invalid post status", ["frontmatter", "status"]),
    );
  }
  document.body.forEach((node, index) => issues.push(...validateNode(node, index)));
  return issues;
}
