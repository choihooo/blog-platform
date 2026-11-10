import type { EditorDocument, EditorIssue, EditorNode } from "./document.js";
import { createEditorIssue } from "./document.js";
import { isSupportedBlock, isSupportedMark } from "./supported-format.js";
import { isSafeContentUrl } from "./html-content.js";

function isUnsafeUrl(value: string): boolean {
  return /^\s*(javascript|data|blob|file|attachment):/i.test(value);
}

function isLocalPath(value: string): boolean {
  return /^([a-z]:[\\/]|\/(?!media\/))/i.test(value);
}

function validateNode(node: EditorNode, index: number): EditorIssue[] {
  const issues: EditorIssue[] = [];
  if (node.type === "table") {
    for (const row of node.rows)
      for (const cell of row) {
        for (const span of [cell.colspan, cell.rowspan])
          if (span !== undefined && (!Number.isInteger(span) || span < 1 || span > 100))
            issues.push(
              createEditorIssue("editor.table.span", "Invalid table span", ["body", String(index)]),
            );
        cell.body.forEach((child, i) => issues.push(...validateNode(child, i)));
      }
  }
  if ("items" in node)
    node.items?.forEach((item) =>
      item.forEach((child, i) => issues.push(...validateNode(child, i))),
    );
  if ("children" in node)
    node.children?.forEach((child, i) => issues.push(...validateNode(child, i)));
  const content =
    "content" in node ? node.content : node.type === "image" ? node.captionContent : undefined;
  for (const run of content ?? []) {
    if (run.href && !isSafeContentUrl(run.href))
      issues.push(
        createEditorIssue("editor.link.unsafe", "Unsafe link URL", [
          "body",
          String(index),
          "content",
        ]),
      );
    if (run.marks?.some((mark) => !isSupportedMark(mark)))
      issues.push(
        createEditorIssue("editor.mark.unsupported", "Unsupported inline mark", [
          "body",
          String(index),
          "content",
        ]),
      );
  }
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
  if ("href" in node && node.href && !isSafeContentUrl(node.href)) {
    issues.push(
      createEditorIssue("editor.link.unsafe", "Unsafe link URL", ["body", String(index), "href"]),
    );
  }
  if (node.type === "image" && isUnsafeUrl(node.src)) {
    issues.push(
      createEditorIssue("editor.image.unsafe", "Unsafe image URL", ["body", String(index), "src"]),
    );
  }
  if (node.type === "image" && isLocalPath(node.src)) {
    issues.push(
      createEditorIssue("editor.image.local-path", "Image must use a public media path", [
        "body",
        String(index),
        "src",
      ]),
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
  if (
    document.frontmatter.coverImage &&
    (isUnsafeUrl(document.frontmatter.coverImage) || isLocalPath(document.frontmatter.coverImage))
  ) {
    issues.push(
      createEditorIssue("editor.coverImage.unsafe", "Cover image must use a public media path", [
        "frontmatter",
        "coverImage",
      ]),
    );
  }
  document.body.forEach((node, index) => issues.push(...validateNode(node, index)));
  return issues;
}
