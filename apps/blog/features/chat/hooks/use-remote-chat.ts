"use client";
import { useEffect, useRef, useState } from "react";
import type { SearchContext } from "../../rag/contracts";
import type { Message } from "../portfolio-chat-types";
import { requestRag } from "../client/rag-client";
import { advanceSearchContext } from "../model/search-context";

export function useRemoteChat() {
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const operation = useRef<AbortController | null>(null);
  const context = useRef<SearchContext | undefined>(undefined);
  useEffect(
    () => () => {
      operation.current?.abort();
      operation.current = null;
    },
    [],
  );
  function cancel() {
    operation.current?.abort();
    operation.current = null;
    setPending(false);
  }
  async function send(value: string) {
    const query = value.trim();
    if (!query || query.length > 600 || operation.current) return;
    const controller = new AbortController();
    operation.current = controller;
    const history: Message[] = [...messages, { role: "user", text: query }];
    setMessages(history);
    setDraft("");
    setError("");
    setPending(true);
    try {
      const result = await requestRag({ query, context: context.current }, controller.signal);
      if (controller.signal.aborted || operation.current !== controller) return;
      context.current = advanceSearchContext(context.current, query, result);
      setMessages([
        ...history,
        { role: "assistant", text: result.answer!, sources: result.sources },
      ]);
    } catch (cause) {
      if (controller.signal.aborted || operation.current !== controller) return;
      setError(
        cause instanceof Error && cause.message === "rate_limited"
          ? "요청이 많아요. 잠시 뒤 다시 질문해 주세요."
          : "답변을 가져오지 못했어요. 잠시 뒤 다시 시도해 주세요.",
      );
    } finally {
      if (operation.current === controller) {
        operation.current = null;
        setPending(false);
      }
    }
  }
  return { draft, setDraft, messages, pending, error, send, cancel };
}
