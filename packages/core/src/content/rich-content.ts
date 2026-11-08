import MarkdownIt from "markdown-it";
import type { EditorInline, EditorNode } from "./document.js";
import { htmlInlineContent, htmlToEditorNodes } from "./html-content.js";

const markdown = new MarkdownIt({ html: false, breaks: true, linkify: false });
export function markdownToEditorNodes(source: string): EditorNode[] {
  return htmlToEditorNodes(
    markdown.render(source.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, "")),
  ).map((node) =>
    node.type === "codeBlock" ? { ...node, text: node.text.replace(/\n$/, "") } : node,
  );
}
export function parseInlineMarkdown(source: string): EditorInline[] {
  return htmlInlineContent(markdown.renderInline(source));
}
/** Old flat list nodes remain readable, but adjacent items share one list. */
export function groupEditorLists(nodes: EditorNode[]): EditorNode[] {
  const result: EditorNode[] = [];
  for (const node of nodes) {
    if ((node.type === "bulletList" || node.type === "orderedList") && !node.items) {
      const previous = result.at(-1);
      const item: EditorNode = {
        type: "paragraph",
        text: node.text,
        content: node.content,
        marks: node.marks,
        href: node.href,
      };
      if (previous?.type === node.type && previous.items && !node.start)
        previous.items.push([item]);
      else result.push({ ...node, items: [[item]] });
    } else result.push(node);
  }
  return result;
}
