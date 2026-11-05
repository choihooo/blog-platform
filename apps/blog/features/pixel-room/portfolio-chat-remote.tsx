"use client";

import { useEffect, useRef, useState } from "react";
import { FAB } from "@hozui/react/fab";
import { Button } from "@hozui/react/button";
import { IconButton } from "@hozui/react/icon-button";
import {
  ChatPanel,
  ChatPanelHeader,
  ChatPanelBody,
  ChatPanelFooter,
  ChatComposer,
  MessageBubble,
} from "@hozui/react/chat";
import { X as CloseIcon, Bot as RobotIcon, Square as StopIcon } from "lucide-react";
import { PortfolioChatMessages } from "./portfolio-chat-messages";
import type { Message } from "./portfolio-chat-types";
import { isRagResult } from "../rag/contracts";
import type { SearchContext } from "../rag/follow-up";

export function PortfolioChatRemote() {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const operation = useRef<AbortController | null>(null);
  const context = useRef<SearchContext | undefined>(undefined);
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLElement>(null);
  const body = useRef<HTMLDivElement>(null);

  useEffect(
    () => () => {
      operation.current?.abort();
      operation.current = null;
    },
    [],
  );
  useEffect(() => {
    if (open) panel.current?.querySelector("textarea")?.focus();
  }, [open]);
  useEffect(() => {
    if (body.current) body.current.scrollTop = body.current.scrollHeight;
  }, [open, messages, pending]);

  function cancel() {
    operation.current?.abort();
    operation.current = null;
    setPending(false);
  }
  function close() {
    cancel();
    setOpen(false);
    trigger.current?.focus();
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
      const response = await fetch("/api/rag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, context: context.current }),
        signal: AbortSignal.any([controller.signal, AbortSignal.timeout(40000)]),
      });
      if (!response.ok) throw new Error(response.status === 429 ? "rate_limited" : "unavailable");
      const result: unknown = await response.json();
      if (controller.signal.aborted || operation.current !== controller) return;
      if (!isRagResult(result) || !result.answer) throw new Error("invalid_answer");
      if (result.sources.length) {
        const previous = context.current;
        context.current = {
          query: result.resolvedQuery ?? query,
          titles: [...new Set(result.sources.map((source) => source.title))].slice(0, 3),
          history: [
            ...(previous?.history ?? []),
            ...(previous ? [{ query: previous.query, titles: previous.titles }] : []),
          ].slice(-5),
        };
      }
      setMessages([
        ...history,
        { role: "assistant", text: result.answer, sources: result.sources },
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

  return (
    <aside className="portfolio-chat" aria-label="포트폴리오 채팅">
      {open && (
        <ChatPanel
          ref={panel}
          id="portfolio-chat-panel"
          className="portfolio-chat-panel"
          role="region"
          aria-label="작업실 안내 채팅"
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.stopPropagation();
              close();
            }
          }}
        >
          <ChatPanelHeader
            title="작업실 안내"
            actions={
              <IconButton
                aria-label="채팅 닫기"
                icon={<CloseIcon />}
                variant="ghost"
                size="sm"
                onClick={close}
              />
            }
          />
          <ChatPanelBody ref={body} aria-label="대화 내용">
            <MessageBubble role="assistant">
              안녕하세요. 공개된 글과 개발 경험을 물어보세요.
              <br />
              공개된 프로젝트·블로그·이력서를 검색해 답하고, 참고한 원문을 함께 보여드려요.
            </MessageBubble>
            {!messages.length && (
              <div className="chat-suggestions" role="group" aria-label="추천 질문">
                {["대표 프로젝트", "기술 스택", "개발 경험"].map((text) => (
                  <Button
                    key={text}
                    label={text}
                    size="sm"
                    variant="secondary"
                    onClick={() => void send(text)}
                  />
                ))}
              </div>
            )}
            <PortfolioChatMessages messages={messages} />
            {pending && <p role="status">자료를 확인하고 답변을 준비하고 있어요.</p>}
            {error && (
              <p className="chat-model-error" role="alert">
                {error}
              </p>
            )}
          </ChatPanelBody>
          <ChatPanelFooter>
            <ChatComposer
              label="메시지"
              placeholder="궁금한 점을 입력하세요"
              value={draft}
              loading={pending}
              onValueChange={setDraft}
              onSubmit={(value) => void send(value)}
              layout="singleLine"
              sendAriaLabel="메시지 보내기"
              textareaProps={{ maxLength: 600 }}
              trailingActions={
                pending && (
                  <button
                    type="button"
                    className="hods-chat-composer__send chat-stop-button"
                    aria-label="답변 중지"
                    onClick={cancel}
                  >
                    <StopIcon
                      className="hods-chat-composer__send-icon"
                      fill="currentColor"
                      aria-hidden="true"
                    />
                  </button>
                )
              }
            />
          </ChatPanelFooter>
        </ChatPanel>
      )}
      <FAB
        ref={trigger}
        className="portfolio-chat-trigger"
        size="lg"
        icon={open ? <CloseIcon /> : <RobotIcon />}
        aria-label={open ? "채팅 닫기" : "채팅 열기"}
        aria-expanded={open}
        aria-controls="portfolio-chat-panel"
        onClick={() => (open ? close() : setOpen(true))}
      />
    </aside>
  );
}
