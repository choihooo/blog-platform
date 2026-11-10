import { parseFragment, type DefaultTreeAdapterTypes } from "parse5";
import type { EditorInline, EditorNode, EditorTableCell, EditorTextNode } from "./document.js";
import { normalizeInline } from "./inline-content.js";

type HtmlNode = DefaultTreeAdapterTypes.ChildNode;
type Element = DefaultTreeAdapterTypes.Element;
const ignored = new Set(["script", "style", "noscript", "template", "iframe", "object", "embed"]);
const blocks = new Set([
  "p",
  "div",
  "section",
  "article",
  "figure",
  "pre",
  "blockquote",
  "ul",
  "ol",
  "table",
  "hr",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
]);
const tag = (node: HtmlNode) => ("tagName" in node ? node.tagName : "");
const children = (node: HtmlNode) => ("childNodes" in node ? node.childNodes : []);
const attr = (node: HtmlNode, name: string) =>
  "attrs" in node ? node.attrs.find((a) => a.name === name)?.value : undefined;
export function isSafeContentUrl(value: string, image = false) {
  const url = value.trim();
  if (
    !url ||
    [...url].some((char) => char.charCodeAt(0) <= 32 || char.charCodeAt(0) === 127) ||
    url.startsWith("//")
  )
    return false;
  return image
    ? /^(https?:\/\/|\/media\/)/i.test(url)
    : /^(https?:\/\/|mailto:|tel:|\/(?!\/)|#)/i.test(url);
}
function text(node: HtmlNode): string {
  if (node.nodeName === "#text") return (node as DefaultTreeAdapterTypes.TextNode).value;
  if (tag(node) === "br") return "\n";
  if (ignored.has(tag(node))) return "";
  return children(node).map(text).join("");
}
function descendants(node: HtmlNode, name: string): Element[] {
  return children(node).flatMap((child) =>
    tag(child) === name ? [child as Element] : descendants(child, name),
  );
}
function inline(nodes: HtmlNode[], inherited: Omit<EditorInline, "text"> = {}): EditorInline[] {
  const result: EditorInline[] = [];
  for (const node of nodes) {
    const name = tag(node);
    if (ignored.has(name) || name === "img" || name === "figcaption") continue;
    const marks = [...(inherited.marks ?? [])];
    if (name === "strong" || name === "b") marks.push("bold");
    if (name === "em" || name === "i") marks.push("italic");
    if (name === "code") marks.push("inlineCode");
    const href =
      name === "a" && attr(node, "href") && isSafeContentUrl(attr(node, "href")!)
        ? attr(node, "href")
        : inherited.href;
    if (node.nodeName === "#text" || name === "br") {
      const value = text(node);
      if (value)
        result.push({
          text: value,
          ...(marks.length ? { marks: [...new Set(marks)] } : {}),
          ...(href ? { href } : {}),
        });
    } else
      result.push(
        ...inline(children(node), {
          ...(marks.length ? { marks } : {}),
          ...(href ? { href } : {}),
        }),
      );
  }
  return normalizeInline(result);
}
function nativeText(type: EditorTextNode["type"], content: EditorInline[]): EditorTextNode {
  const value = content.map((run) => run.text).join("");
  return { type, text: value, content };
}
export type HtmlContentOptions = {
  mapImage?: (src: string) => string | undefined;
  rootClass?: string;
};

/** Parse HTML structure before decoding text. Never run tag removal over decoded code. */
export function htmlToEditorNodes(html: string, options: HtmlContentOptions = {}): EditorNode[] {
  function image(node: HtmlNode, href?: string): EditorNode[] {
    const original = attr(node, "src") ?? "";
    const src = options.mapImage ? options.mapImage(original) : original;
    if (!src || !isSafeContentUrl(src, true)) return [];
    return [
      {
        type: "image",
        src,
        alt: attr(node, "alt") ?? "",
        ...(attr(node, "title") ? { title: attr(node, "title") } : {}),
        ...(href && isSafeContentUrl(href) ? { href } : {}),
      },
    ];
  }
  function walk(nodes: HtmlNode[], inherited: Omit<EditorInline, "text"> = {}): EditorNode[] {
    const result: EditorNode[] = [];
    let pending: HtmlNode[] = [];
    const flush = () => {
      const runs = inline(pending, inherited);
      pending = [];
      if (runs.some((r) => r.text.trim())) result.push(nativeText("paragraph", runs));
    };
    for (const node of nodes) {
      const name = tag(node);
      if (ignored.has(name)) continue;
      if (name === "img") {
        flush();
        result.push(...image(node, inherited.href));
        continue;
      }
      if (name === "a" && descendants(node, "img").length) {
        flush();
        result.push(...walk(children(node), { ...inherited, href: attr(node, "href") }));
        continue;
      }
      if (!blocks.has(name) && descendants(node, "img").length) {
        flush();
        result.push(...walk(children(node), inherited));
        continue;
      }
      if (!blocks.has(name)) {
        pending.push(node);
        continue;
      }
      flush();
      if (name === "pre") {
        const code = descendants(node, "code")[0] ?? node;
        const language =
          attr(code, "class")?.match(/(?:language|lang)-([^\s]+)/)?.[1] ??
          attr(node, "data-ke-language");
        result.push({ type: "codeBlock", text: text(code), ...(language ? { language } : {}) });
      } else if (/^h[1-6]$/.test(name)) {
        const heading = nativeText("heading", inline(children(node)));
        if (heading.text.trim()) result.push({ ...heading, depth: Number(name[1]) });
      } else if (name === "hr") result.push({ type: "horizontalRule" });
      else if (name === "ul" || name === "ol") {
        const items = children(node)
          .filter((c) => tag(c) === "li")
          .map((c) => {
            const body = walk(children(c));
            return body.length ? body : [{ type: "paragraph" as const, text: "", content: [] }];
          });
        result.push({
          type: name === "ol" ? "orderedList" : "bulletList",
          text: items
            .flat()
            .map((n) => ("text" in n ? n.text : ""))
            .join("\n"),
          items,
          ...(name === "ol" ? { start: Number(attr(node, "start")) || 1 } : {}),
        });
      } else if (name === "blockquote") {
        const body = walk(children(node));
        result.push({
          type: "blockquote",
          text: body.map((n) => ("text" in n ? n.text : "")).join("\n"),
          children: body,
        });
      } else if (name === "table") {
        const rows = descendants(node, "tr")
          .map((row) =>
            children(row)
              .filter((c) => ["td", "th"].includes(tag(c)))
              .map((cell): EditorTableCell => ({
                body: walk(children(cell)).length
                  ? walk(children(cell))
                  : [{ type: "paragraph", text: "", content: [] }],
                ...(tag(cell) === "th" ? { header: true } : {}),
                ...(Number(attr(cell, "colspan")) > 1
                  ? { colspan: Number(attr(cell, "colspan")) }
                  : {}),
                ...(Number(attr(cell, "rowspan")) > 1
                  ? { rowspan: Number(attr(cell, "rowspan")) }
                  : {}),
              })),
          )
          .filter((row) => row.length);
        if (rows.length) result.push({ type: "table", rows });
      } else if (name === "figure") {
        const body = walk(children(node).filter((c) => tag(c) !== "figcaption"));
        const caption = descendants(node, "figcaption")[0];
        const last = [...body].reverse().find((n) => n.type === "image");
        if (last?.type === "image" && caption) {
          last.caption = text(caption).trim();
          last.captionContent = inline(children(caption));
        }
        result.push(...body);
      } else result.push(...walk(children(node), inherited));
    }
    flush();
    return result;
  }
  const fragment = parseFragment(html);
  if (options.rootClass) {
    const find = (nodes: HtmlNode[]): HtmlNode | undefined => {
      for (const node of nodes) {
        if (attr(node, "class")?.split(/\s+/).includes(options.rootClass!)) return node;
        const child = find(children(node));
        if (child) return child;
      }
      return undefined;
    };
    const root = find(fragment.childNodes);
    if (!root) throw new Error("Article root not found");
    return walk(children(root));
  }
  return walk(fragment.childNodes);
}

export function htmlInlineContent(html: string): EditorInline[] {
  return inline(parseFragment(html).childNodes);
}
