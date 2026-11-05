import type { EditorInline, EditorNode, EditorTextNode } from "./document.js";
import { groupEditorLists, parseInlineMarkdown } from "./rich-content.js";
import { normalizeInline } from "./inline-content.js";

/** Structural subset of Tiptap JSON; the shared package has no UI dependency. */
export type EditorJson = {
  type?: string;
  text?: string;
  attrs?: Record<string, unknown>;
  marks?: { type: string; attrs?: Record<string, unknown> }[];
  content?: EditorJson[];
};
function runs(json: EditorJson): EditorInline[] {
  return normalizeInline(
    (json.content ?? []).flatMap((child) => {
      if (child.type !== "text" && child.type !== "hardBreak")
        throw new Error(`Unsupported inline node: ${child.type}`);
      const marks: NonNullable<EditorInline["marks"]> = [];
      let href: string | undefined;
      for (const mark of child.marks ?? []) {
        if (mark.type === "bold") marks.push("bold");
        else if (mark.type === "italic") marks.push("italic");
        else if (mark.type === "code") marks.push("inlineCode");
        else if (mark.type === "link") href = String(mark.attrs?.href ?? "");
        else throw new Error(`Unsupported inline mark: ${mark.type}`);
      }
      return [
        {
          text: child.type === "hardBreak" ? "\n" : (child.text ?? ""),
          ...(marks.length ? { marks } : {}),
          ...(href ? { href } : {}),
        },
      ];
    }),
  );
}
function textNode(type: EditorTextNode["type"], json: EditorJson): EditorTextNode {
  const content = runs(json);
  return { type, text: content.map((r) => r.text).join(""), content };
}
export function tiptapToEditorNodes(json: EditorJson): EditorNode[] {
  const result = (json.content ?? []).map((node): EditorNode => {
    if (node.type === "paragraph") return textNode("paragraph", node);
    if (node.type === "heading")
      return { ...textNode("heading", node), depth: Number(node.attrs?.level ?? 2) };
    if (node.type === "horizontalRule") return { type: "horizontalRule" };
    if (node.type === "image")
      return {
        type: "image",
        src: String(node.attrs?.src ?? ""),
        alt: String(node.attrs?.alt ?? ""),
        ...(node.attrs?.title ? { title: String(node.attrs.title) } : {}),
        ...(node.attrs?.caption ? { caption: String(node.attrs.caption) } : {}),
        ...(Array.isArray(node.attrs?.captionContent)
          ? { captionContent: node.attrs.captionContent as EditorInline[] }
          : {}),
        ...(node.attrs?.href ? { href: String(node.attrs.href) } : {}),
      };
    if (node.type === "codeBlock")
      return {
        type: "codeBlock",
        text: (node.content ?? []).map((c) => c.text ?? "").join(""),
        ...(node.attrs?.language ? { language: String(node.attrs.language) } : {}),
      };
    if (node.type === "blockquote") {
      const children = tiptapToEditorNodes(node);
      return {
        type: "blockquote",
        text: children.map((n) => ("text" in n ? n.text : "")).join("\n"),
        children,
      };
    }
    if (node.type === "bulletList" || node.type === "orderedList") {
      const items = (node.content ?? []).map((item) => tiptapToEditorNodes(item));
      return {
        type: node.type,
        text: items
          .flat()
          .map((n) => ("text" in n ? n.text : ""))
          .join("\n"),
        items,
        ...(node.type === "orderedList" ? { start: Number(node.attrs?.start ?? 1) } : {}),
      };
    }
    if (node.type === "table")
      return {
        type: "table",
        rows: (node.content ?? []).map((row) =>
          (row.content ?? []).map((cell) => ({
            body: tiptapToEditorNodes(cell),
            ...(cell.type === "tableHeader" ? { header: true } : {}),
            ...(Number(cell.attrs?.colspan) > 1 ? { colspan: Number(cell.attrs?.colspan) } : {}),
            ...(Number(cell.attrs?.rowspan) > 1 ? { rowspan: Number(cell.attrs?.rowspan) } : {}),
          })),
        ),
      };
    throw new Error(`Unsupported editor block: ${node.type}`);
  });
  // Tiptap appends an empty cursor paragraph after an image/table.
  if (
    json.type === "doc" &&
    result.at(-1)?.type === "paragraph" &&
    "text" in result[result.length - 1]! &&
    !(result[result.length - 1] as EditorTextNode).text
  )
    result.pop();
  return result;
}
function inlineJson(content: EditorInline[]): EditorJson[] {
  return content.flatMap((run) => {
    const marks: NonNullable<EditorJson["marks"]> = (run.marks ?? [])
      .filter((m) => m !== "link")
      .map((m) => ({ type: m === "inlineCode" ? "code" : m }));
    if (run.href) marks.push({ type: "link", attrs: { href: run.href } });
    return run.text
      .split("\n")
      .flatMap((part, i) => [
        ...(i ? [{ type: "hardBreak", ...(marks.length ? { marks } : {}) }] : []),
        ...(part ? [{ type: "text", text: part, ...(marks.length ? { marks } : {}) }] : []),
      ]);
  });
}
export function editorNodeInline(node: EditorTextNode): EditorInline[] {
  return (
    node.content ??
    (node.marks?.length || node.href
      ? [{ text: node.text, marks: node.marks, href: node.href }]
      : parseInlineMarkdown(node.text))
  );
}
export function editorNodesToTiptap(nodes: EditorNode[]): EditorJson {
  const content = groupEditorLists(nodes).map((node): EditorJson => {
    if (node.type === "horizontalRule") return { type: "horizontalRule" };
    if (node.type === "image")
      return {
        type: "image",
        attrs: {
          src: node.src,
          alt: node.alt ?? "",
          title: node.title ?? null,
          caption: node.caption ?? null,
          captionContent: node.captionContent ?? null,
          href: node.href ?? null,
        },
      };
    if (node.type === "table")
      return {
        type: "table",
        content: node.rows.map((row) => ({
          type: "tableRow",
          content: row.map((cell) => ({
            type: cell.header ? "tableHeader" : "tableCell",
            attrs: { colspan: cell.colspan ?? 1, rowspan: cell.rowspan ?? 1 },
            content: editorNodesToTiptap(cell.body).content,
          })),
        })),
      };
    if (node.type === "codeBlock")
      return {
        type: "codeBlock",
        attrs: { language: node.language ?? null },
        content: node.text ? [{ type: "text", text: node.text }] : [],
      };
    if (node.type === "bulletList" || node.type === "orderedList")
      return {
        type: node.type,
        ...(node.type === "orderedList" ? { attrs: { start: node.start ?? 1 } } : {}),
        content: (node.items ?? []).map((item) => ({
          type: "listItem",
          content: editorNodesToTiptap(item).content,
        })),
      };
    if (node.type === "blockquote")
      return {
        type: "blockquote",
        content: editorNodesToTiptap(
          node.children ?? [{ ...node, type: "paragraph", children: undefined }],
        ).content,
      };
    return {
      type: node.type === "heading" ? "heading" : "paragraph",
      ...(node.type === "heading" ? { attrs: { level: node.depth ?? 2 } } : {}),
      content: inlineJson(editorNodeInline(node)),
    };
  });
  return { type: "doc", content: content.length ? content : [{ type: "paragraph" }] };
}
