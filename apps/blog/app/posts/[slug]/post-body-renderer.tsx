import Link from "next/link";
import type { ReactNode } from "react";
import type { EditorNode, EditorTextNode } from "@blog-platform/core/content";

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

function renderInlineMarkdown(text: string) {
  const parts: ReactNode[] = [];
  const inlineMarkdown = /(\*\*([^*]+)\*\*|_([^_]+)_|`([^`]+)`|\[([^\]]+)\]\(([^)]+)\))/g;
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = inlineMarkdown.exec(text))) {
    const [raw, , bold, italic, code, label, href] = match;
    if (match.index > cursor) parts.push(text.slice(cursor, match.index));
    const key = `${match.index}-${raw}`;

    if (bold) parts.push(<strong key={key}>{bold}</strong>);
    else if (italic) parts.push(<em key={key}>{italic}</em>);
    else if (code) parts.push(<code key={key}>{code}</code>);
    else if (label && href)
      parts.push(
        href.startsWith("/") ? (
          <Link href={href} key={key}>
            {label}
          </Link>
        ) : (
          <a href={href} key={key} rel="noopener noreferrer" target="_blank">
            {label}
          </a>
        ),
      );

    cursor = match.index + raw.length;
  }

  if (cursor < text.length) parts.push(text.slice(cursor));
  return parts.length > 0 ? parts : text;
}

function inlineContent(node: EditorTextNode) {
  let content: ReactNode =
    node.marks?.length || node.href ? node.text : renderInlineMarkdown(node.text);
  for (const mark of node.marks ?? []) {
    if (mark === "bold") content = <strong>{content}</strong>;
    if (mark === "italic") content = <em>{content}</em>;
    if (mark === "inlineCode") content = <code>{content}</code>;
  }
  if (node.href) {
    content = node.href.startsWith("/") ? (
      <Link href={node.href}>{content}</Link>
    ) : (
      <a href={node.href} rel="noopener noreferrer" target="_blank">
        {content}
      </a>
    );
  }
  return content;
}

function headingTag(depth?: number) {
  if (depth === 1) return "h1" as const;
  if (depth === 3) return "h3" as const;
  if (depth === 4) return "h4" as const;
  if (depth === 5) return "h5" as const;
  if (depth === 6) return "h6" as const;
  return "h2" as const;
}

export function PostBodyRenderer({
  analyticsContext,
  nodes,
}: {
  analyticsContext: Parameters<typeof CodeCopyButton>[0]["context"];
  nodes: EditorNode[];
}) {
  const seen = new Map<string, number>();
  return (
    <>
      {nodes.map((node, index) => {
        if (node.type === "horizontalRule") return <hr key={index} />;
        if (node.type === "image") {
          return (
            <figure key={index}>
              <img
                alt={node.alt ?? ""}
                decoding="async"
                loading="lazy"
                src={node.src}
                title={node.title}
              />
              {node.caption ? <figcaption>{node.caption}</figcaption> : null}
            </figure>
          );
        }
        if (node.type === "heading") {
          const base = slugify(node.text);
          const count = seen.get(base) ?? 0;
          seen.set(base, count + 1);
          const id = count === 0 ? base : `${base}-${count + 1}`;
          const content = inlineContent(node);
          const Heading = headingTag(node.depth);
          return (
            <Heading id={id} key={index}>
              {content}
            </Heading>
          );
        }
        if (node.type === "blockquote")
          return <blockquote key={index}>{inlineContent(node)}</blockquote>;
        if (node.type === "codeBlock") {
          return (
            <div className="group relative" key={index}>
              <div className="absolute right-3 top-3 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
                <CodeCopyButton
                  context={analyticsContext}
                  target={`code-${index}`}
                  text={node.text}
                />
              </div>
              <pre>
                <code>{node.text}</code>
              </pre>
            </div>
          );
        }
        if (node.type === "bulletList")
          return (
            <ul key={index}>
              <li>{inlineContent(node)}</li>
            </ul>
          );
        if (node.type === "orderedList")
          return (
            <ol key={index}>
              <li>{inlineContent(node)}</li>
            </ol>
          );
        return <p key={index}>{inlineContent(node)}</p>;
      })}
    </>
  );
}
