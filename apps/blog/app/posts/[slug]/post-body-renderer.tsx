import Link from "next/link";
import { Fragment, type ReactNode } from "react";
import {
  editorNodeInline,
  groupEditorLists,
  isSafeContentUrl,
  parseInlineMarkdown,
  type EditorInline,
  type EditorNode,
} from "@blog-platform/core/content";
import { CodeCopyButton } from "@/features/blog/components/code-copy-button";

function slugify(value: string) {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9가-힣ㄱ-ㅎㅏ-ㅣ]+/g, "-")
      .replace(/^-+|-+$/g, "") || "section"
  );
}
function contentLink(href: string, content: ReactNode) {
  if (!isSafeContentUrl(href)) return content;
  return href.startsWith("/") || href.startsWith("#") ? (
    <Link href={href}>{content}</Link>
  ) : (
    <a href={href} rel="noopener noreferrer" target="_blank">
      {content}
    </a>
  );
}
function inlineContent(runs: EditorInline[]) {
  return runs.map((run, index) => {
    let content: ReactNode = run.text.includes("\n") ? (
      <span style={{ whiteSpace: "pre-wrap" }}>{run.text}</span>
    ) : (
      run.text
    );
    for (const mark of run.marks ?? []) {
      if (mark === "bold") content = <strong>{content}</strong>;
      if (mark === "italic") content = <em>{content}</em>;
      if (mark === "inlineCode") content = <code>{content}</code>;
    }
    if (run.href) content = contentLink(run.href, content);
    return <Fragment key={index}>{content}</Fragment>;
  });
}

export function PostBodyRenderer({
  analyticsContext,
  nodes,
}: {
  analyticsContext: Parameters<typeof CodeCopyButton>[0]["context"];
  nodes: EditorNode[];
}) {
  const seen = new Map<string, number>();
  function renderBlocks(body: EditorNode[], path = "body"): ReactNode {
    return groupEditorLists(body).map((node, index) => {
      const key = path + "-" + index;
      if (node.type === "horizontalRule") return <hr key={key} />;
      if (node.type === "image") {
        if (!isSafeContentUrl(node.src, true)) return null;
        let image: ReactNode = (
          <img
            alt={node.alt ?? ""}
            decoding="async"
            loading="lazy"
            src={node.src}
            title={node.title}
          />
        );
        if (node.href) image = contentLink(node.href, image);
        return (
          <figure key={key}>
            {image}
            {node.caption ? (
              <figcaption>
                {inlineContent(node.captionContent ?? parseInlineMarkdown(node.caption))}
              </figcaption>
            ) : null}
          </figure>
        );
      }
      if (node.type === "table")
        return (
          <div className="post-table-scroll" key={key} role="region" aria-label="표" tabIndex={0}>
            <table>
              <tbody>
                {node.rows.map((row, r) => (
                  <tr key={r}>
                    {row.map((cell, c) => {
                      const Cell = cell.header ? "th" : "td";
                      return (
                        <Cell
                          key={c}
                          colSpan={cell.colspan}
                          rowSpan={cell.rowspan}
                          scope={cell.header ? "col" : undefined}
                        >
                          {renderBlocks(cell.body, key + "-" + r + "-" + c)}
                        </Cell>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      if (node.type === "heading") {
        const base = slugify(node.text),
          count = seen.get(base) ?? 0;
        seen.set(base, count + 1);
        const depth = Math.max(1, Math.min(6, node.depth ?? 2));
        const Heading = ("h" + depth) as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
        return (
          <Heading id={count === 0 ? base : base + "-" + (count + 1)} key={key}>
            {inlineContent(editorNodeInline(node))}
          </Heading>
        );
      }
      if (node.type === "codeBlock")
        return (
          <div className="group relative" key={key}>
            <div className="absolute right-3 top-3 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
              <CodeCopyButton context={analyticsContext} target={key} text={node.text} />
            </div>
            <pre>
              <code className={node.language ? "language-" + node.language : undefined}>
                {node.text}
              </code>
            </pre>
          </div>
        );
      if (node.type === "blockquote")
        return (
          <blockquote key={key}>
            {node.children
              ? renderBlocks(node.children, key)
              : inlineContent(editorNodeInline(node))}
          </blockquote>
        );
      if (node.type === "bulletList" || node.type === "orderedList") {
        const items = (node.items ?? []).map((item, i) => (
          <li key={i}>{renderBlocks(item, key + "-" + i)}</li>
        ));
        return node.type === "orderedList" ? (
          <ol key={key} start={node.start}>
            {items}
          </ol>
        ) : (
          <ul key={key}>{items}</ul>
        );
      }
      return <p key={key}>{inlineContent(editorNodeInline(node))}</p>;
    });
  }
  return <>{renderBlocks(nodes)}</>;
}
