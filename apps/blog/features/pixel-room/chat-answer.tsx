import type { RagSource } from "../rag/contracts";

export type ChatArticle = { source: RagSource; summary: string };

/** Only headings and bullet lines from our factual formatter; never interpret HTML. */
export function ChatAnswer({ text, articles }: { text: string; articles?: ChatArticle[] }) {
  if (articles?.length)
    return (
      <ol className="chat-articles">
        {articles.map(({ source, summary }) => (
          <li key={source.url}>
            <a href={source.url} target="_blank" rel="noopener noreferrer">
              {source.title}
              <span aria-hidden="true"> ↗</span>
            </a>
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
          return (
            <div className="chat-answer-block" key={i}>
              {lines[0]?.startsWith("## ") && <h3>{lines.shift()!.slice(3)}</h3>}
              {lines.length > 0 &&
                (lines.every((line) => line.startsWith("- ")) ? (
                  <ul>
                    {lines.map((line, j) => (
                      <li key={j}>{line.slice(2)}</li>
                    ))}
                  </ul>
                ) : (
                  <p>{lines.join("\n")}</p>
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
