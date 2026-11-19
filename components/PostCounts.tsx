"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { Heart, MessageCircle } from "lucide-react";
import { requestJson } from "@/lib/engagement/request.mjs";

type Counts = Record<string, { commentCount: number; likeCount: number }>;
const CountsContext = createContext<{ counts: Counts | null; failed: boolean }>({ counts: null, failed: false });

export function PostCountsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ counts: Counts | null; failed: boolean }>({ counts: null, failed: false });
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const counts: Counts = await requestJson("/api/engagement", undefined, controller.signal);
        if (!controller.signal.aborted) setState({ counts, failed: false });
      } catch {
        if (!controller.signal.aborted) setState({ counts: null, failed: true });
      }
    }
    void load();
    return () => controller.abort();
  }, []);
  return <CountsContext value={state}>{children}</CountsContext>;
}

export function PostCounts({ slug }: { slug: string }) {
  const { counts, failed } = useContext(CountsContext);
  const value = counts?.[slug];
  const pending = failed ? "—" : "…";
  return (
    <span className="post-counts" title={failed ? "반응 수를 불러오지 못했어요." : undefined}>
      <span role="img" aria-label={`댓글 ${value ? `${value.commentCount}개` : failed ? "조회 실패" : "불러오는 중"}`}>
        <MessageCircle size={14} strokeWidth={1.7} aria-hidden="true" /><span aria-hidden="true">{value?.commentCount ?? pending}</span>
      </span>
      <span role="img" aria-label={`좋아요 ${value ? `${value.likeCount}개` : failed ? "조회 실패" : "불러오는 중"}`}>
        <Heart size={14} strokeWidth={1.7} aria-hidden="true" /><span aria-hidden="true">{value?.likeCount ?? pending}</span>
      </span>
    </span>
  );
}
