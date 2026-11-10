import Link from "next/link";
import { MessageBubble } from "@hozui/react/chat";

import { ChatAnswer } from "./chat-answer";
import type { Message } from "./portfolio-chat-types";

export function PortfolioChatMessages({ messages }: { messages: Message[] }) {
  return (
    <>
      {messages.map((message, index) => (
        <MessageBubble
          key={index}
          role={message.role}
          contentType={message.role === "assistant" ? "rich" : "text"}
        >
          {message.role === "assistant" ? (
            <ChatAnswer text={message.text} />
          ) : (
            <span className="chat-message-text">{message.text}</span>
          )}
          {message.sources && message.sources.length > 0 && (
            <details className="chat-sources">
              <summary>참고 자료 · {new Set(message.sources.map((s) => s.url)).size}개</summary>
              {message.sources
                .filter((source, i, all) => all.findIndex((s) => s.url === source.url) === i)
                .map((source, sourceIndex) => (
                  <div key={`${source.url}-${sourceIndex}`}>
                    {source.url.startsWith("/") ? (
                      <Link href={source.url}>{source.title} ↗</Link>
                    ) : (
                      <a href={source.url} target="_blank" rel="noopener noreferrer">
                        {source.title} ↗
                      </a>
                    )}
                  </div>
                ))}
            </details>
          )}
        </MessageBubble>
      ))}
    </>
  );
}
