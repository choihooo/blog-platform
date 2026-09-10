"use client";

import { Grid2X2, List } from "lucide-react";
import { useEffect, useState } from "react";

import type { PublicPost } from "../server/content-source";
import type { PostAnalyticsContext } from "./post-analytics-events";
import { PostList } from "./post-list";

const VIEW_STORAGE_KEY = "blog-list-view";

type ListView = "tile" | "list";

type PostListViewProps = {
  analyticsContext?: PostAnalyticsContext;
  postClickEvent?: "post_card_click" | "search_result_click";
  posts: PublicPost[];
  replaceLinks?: boolean;
  summary: string;
};

export function PostListView({
  analyticsContext,
  postClickEvent,
  posts,
  replaceLinks = false,
  summary,
}: PostListViewProps) {
  const [view, setView] = useState<ListView>("tile");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(VIEW_STORAGE_KEY);
      if (saved === "tile" || saved === "list") setView(saved);
    } catch {
      /* localStorage 접근 불가 시 기본 뷰 유지 */
    }
  }, []);

  function updateView(nextView: ListView) {
    setView(nextView);
    try {
      window.localStorage.setItem(VIEW_STORAGE_KEY, nextView);
    } catch {
      /* 저장 실패는 뷰 전환만 유지 */
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">{summary}</p>
        <div aria-label="보기 방식" className="flex items-center gap-2">
          <button
            aria-label="타일뷰"
            aria-pressed={view === "tile"}
            className={`grid size-10 cursor-pointer place-items-center rounded-md border bg-card ${
              view === "tile"
                ? "border-primary text-primary"
                : "border-border text-muted-foreground"
            }`}
            onClick={() => updateView("tile")}
            type="button"
          >
            <Grid2X2 aria-hidden="true" size={18} />
          </button>
          <button
            aria-label="리스트뷰"
            aria-pressed={view === "list"}
            className={`grid size-10 cursor-pointer place-items-center rounded-md border bg-card ${
              view === "list"
                ? "border-primary text-primary"
                : "border-border text-muted-foreground"
            }`}
            onClick={() => updateView("list")}
            type="button"
          >
            <List aria-hidden="true" size={19} />
          </button>
        </div>
      </div>
      <PostList
        analyticsContext={analyticsContext}
        postClickEvent={postClickEvent}
        posts={posts}
        replaceLinks={replaceLinks}
        view={view}
      />
    </div>
  );
}
