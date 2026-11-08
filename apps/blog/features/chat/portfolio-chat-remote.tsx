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
import { useRemoteChat } from "./hooks/use-remote-chat";

export function PortfolioChatRemote() {
  const [open, setOpen] = useState(false);
  const { draft, setDraft, messages, pending, error, send, cancel } = useRemoteChat();
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLElement>(null);
  const body = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) panel.current?.querySelector("textarea")?.focus();
  }, [open]);
  useEffect(() => {
    if (body.current) body.current.scrollTop = body.current.scrollHeight;
  }, [open, messages, pending]);

  function close() {
    cancel();
    setOpen(false);
    trigger.current?.focus();
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
