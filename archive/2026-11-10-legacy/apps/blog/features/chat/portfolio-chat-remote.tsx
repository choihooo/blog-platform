"use client";

import { useEffect, useRef, useState } from "react";
import { FAB } from "@hozui/react/fab";
import { IconButton } from "@hozui/react/icon-button";
import {
  ChatPanel,
  ChatPanelHeader,
  ChatPanelBody,
  ChatPanelFooter,
  ChatComposer,
} from "@hozui/react/chat";
import {
  X as CloseIcon,
  Bot as RobotIcon,
  Plus as PlusIcon,
  Square as StopIcon,
} from "lucide-react";
import { PortfolioChatMessages } from "./portfolio-chat-messages";
import { useRemoteChat } from "./hooks/use-remote-chat";
import { chatPrompts } from "./chat-prompts";

export function PortfolioChatRemote() {
  const [open, setOpen] = useState(false);
  const { draft, setDraft, messages, pending, error, send, cancel, reset } = useRemoteChat();
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
  function startNewConversation() {
    reset();
    panel.current?.querySelector("textarea")?.focus();
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
            title="호조리카 AI"
            subtitle="글과 프로젝트 안내"
            avatar={<RobotIcon aria-hidden="true" />}
            actions={
              <>
                <IconButton
                  aria-label="새 대화"
                  icon={<PlusIcon />}
                  variant="ghost"
                  onClick={startNewConversation}
                />
                <IconButton
                  aria-label="채팅 닫기"
                  icon={<CloseIcon />}
                  variant="ghost"
                  onClick={close}
                />
              </>
            }
          />
          <ChatPanelBody ref={body} aria-label="대화 내용">
            {!messages.length && (
              <div className="chat-welcome">
                <RobotIcon className="chat-welcome-icon" aria-hidden="true" />
                <h2>
                  어떤 이야기가
                  <br />
                  궁금하세요?
                </h2>
                <p>공개된 글과 개발 경험을 물어보세요.</p>
                <div className="chat-suggestions" role="group" aria-label="추천 질문">
                  {chatPrompts.map(({ label, description, query }) => (
                    <button type="button" key={label} onClick={() => void send(query)}>
                      <strong>{label}</strong>
                      <span>{description}</span>
                    </button>
                  ))}
                </div>
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
              placeholder="궁금한 점을 물어보세요"
              value={draft}
              loading={pending}
              onValueChange={setDraft}
              onSubmit={(value) => void send(value)}
              layout="multiline"
              maxRows={3}
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
            <div className="chat-composer-meta">
              <span>AI 답변은 참고 원문과 함께 확인해 주세요.</span>
              <span aria-label={`${draft.length}자, 최대 600자`}>{draft.length} / 600</span>
            </div>
          </ChatPanelFooter>
        </ChatPanel>
      )}
      <FAB
        ref={trigger}
        className="portfolio-chat-trigger"
        size="md"
        icon={open ? <CloseIcon /> : <RobotIcon />}
        aria-label={open ? "채팅 닫기" : "채팅 열기"}
        aria-expanded={open}
        aria-controls="portfolio-chat-panel"
        onClick={() => (open ? close() : setOpen(true))}
      />
    </aside>
  );
}
