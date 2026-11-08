import Link from "next/link";

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
export function ChatAnswer({ text }: { text: string }) {
  const blocks = text
    .replace(/\n(?=#{2,3} )/g, "\n\n")
    .split(/\n\s*\n/)
    .filter(Boolean);
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
          const heading = /^(#{2,3}) (.+)$/.exec(lines[0] ?? "");
          if (heading) lines.shift();
          const groups: { list: boolean; lines: string[] }[] = [];
          for (const line of lines) {
            const list = line.startsWith("- ");
            const previous = groups.at(-1);
            if (previous?.list === list) previous.lines.push(line);
            else groups.push({ list, lines: [line] });
          }
          return (
            <div className="chat-answer-block" key={i}>
              {heading?.[1] === "##" && <h3>{heading[2]}</h3>}
              {heading?.[1] === "###" && <h4>{heading[2]}</h4>}
              {groups.map((group, groupIndex) =>
                group.list ? (
                  <ul key={groupIndex}>
                    {group.lines.map((line, j) => (
                      <li key={j}>{inlineLinks(line.slice(2))}</li>
                    ))}
                  </ul>
                ) : (
                  <p
                    key={groupIndex}
                    className={
                      heading?.[1] === "###" && groupIndex === 0 ? "chat-answer-meta" : undefined
                    }
                  >
                    {inlineLinks(group.lines.join("\n"))}
                  </p>
                ),
              )}
            </div>
          );
        })
      ) : (
        <p>답변을 준비하고 있어요…</p>
      )}
    </div>
  );
}
