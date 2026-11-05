"use client";

import { lazy, Suspense } from "react";
import { PortfolioChatRemote } from "./portfolio-chat-remote";

const LocalChat = lazy(() =>
  import("./portfolio-chat-local").then((module) => ({ default: module.PortfolioChatLocal })),
);

export function PortfolioChat({ diagnostics = false }: { diagnostics?: boolean } = {}) {
  if (process.env.NEXT_PUBLIC_RAG_CHAT_MODE === "remote") return <PortfolioChatRemote />;
  return (
    <Suspense fallback={null}>
      <LocalChat diagnostics={diagnostics} />
    </Suspense>
  );
}
