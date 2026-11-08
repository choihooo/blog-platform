"use client";

import "./chat.css";

import { PortfolioChatRemote } from "./portfolio-chat-remote";
import { PortfolioChatLocal } from "./portfolio-chat-local";

export function PortfolioChat({ diagnostics = false }: { diagnostics?: boolean } = {}) {
  if (process.env.NEXT_PUBLIC_RAG_CHAT_MODE === "remote") return <PortfolioChatRemote />;
  return <PortfolioChatLocal diagnostics={diagnostics} />;
}
