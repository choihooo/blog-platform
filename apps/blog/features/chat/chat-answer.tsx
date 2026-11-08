import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { RagSource } from "@blog-platform/core/search";

export type ChatArticle = { source: RagSource; summary: string };

function inlineLinks(text: string) {
  return text.split(/(\[[^\]\n]+\]\([^\s)]+\))/g).map((part, i) => {
    const match = /^\[([^\]]+)\]\(([^\s)]+)\)$/.exec(part);
    if (!match) return part;
    const href = match[2]!;
    if (
      !/^(?:https:\/\/|\/(?!\/))/.test(href) ||
      href.includes("\\") ||
      [...href].some((c) => c.charCodeAt(0) < 32)
    )
      return part;
    return href.startsWith("/") ? (
      <Link href={href} key={i}>
        {match[1]}
      </Link>
    ) : (
      <a href={href} key={i} target="_blank" rel="noopener noreferrer">
        {match[1]}
      </a>
    );
  });
}

/** Only headings and bullet lines from our factual formatter; never interpret HTML. */
export function ChatAnswer({ text, articles }: { text: string; articles?: ChatArticle[] }) {
  if (articles?.length)
    return (
      <ol className="chat-articles">
        {articles.map(({ source, summary }) => (
          <li key={source.url}>
            {source.url.startsWith("/") ? (
              <Link href={source.url}>
                {source.title}
                <ArrowUpRight aria-hidden="true" size={14} />
              </Link>
            ) : (
              <a href={source.url} target="_blank" rel="noopener noreferrer">
                {source.title}
                <ArrowUpRight aria-hidden="true" size={14} />
              </a>
            )}
            <p>{summary || "글 내용을 정리하고 있어요…"}</p>
          </li>
        ))}
      </ol>
    );
  const blocks = text.split(/\n\s*\n/).filter(Boolean);
  return (
    <div className="chat-answer">
      {blocks.length ? (
        blocks.map((block, i) => {
          const lines = block.split("\n");
          if (
            lines.length >= 3 &&
            lines.every((line) => line.startsWith("|")) &&
            /^\|[\s:|-]+\|$/.test(lines[1]!)
          ) {
            const cells = (line: string) =>
              line
                .split("|")
                .slice(1, -1)
                .map((s) => s.trim());
            return (
              <div
                key={i}
                style={{ maxWidth: "100%", overflowX: "auto" }}
                tabIndex={0}
                role="region"
                aria-label="답변 비교표"
              >
                <table>
                  <thead>
                    <tr>
                      {cells(lines[0]!).map((s, j) => (
                        <th key={j} scope="col">
                          {s}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {lines.slice(2).map((line, j) => (
                      <tr key={j}>
                        {cells(line).map((s, k) => (
                          <td key={k}>{inlineLinks(s)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          }
          return (
            <div className="chat-answer-block" key={i}>
              {lines[0]?.startsWith("## ") && <h3>{lines.shift()!.slice(3)}</h3>}
              {lines.length > 0 &&
                (lines.every((line) => line.startsWith("- ")) ? (
                  <ul>
                    {lines.map((line, j) => (
                      <li key={j}>{inlineLinks(line.slice(2))}</li>
                    ))}
                  </ul>
                ) : (
                  <p>{inlineLinks(lines.join("\n"))}</p>
                ))}
            </div>
          );
        })
      ) : (
        <p>답변을 준비하고 있어요…</p>
      )}
    </div>
  );
}
