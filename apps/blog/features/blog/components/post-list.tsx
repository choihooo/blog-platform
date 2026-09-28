import { EmptyState } from "@hozui/react";

import type { PostAnalyticsContext } from "./post-analytics-events";
import { PostListItem, PostTile } from "./post-list-items";
import type { PublicPost } from "../server/content-source";

type PostListProps = {
  posts: PublicPost[];
  analyticsContext?: PostAnalyticsContext;
  postClickEvent?: "post_card_click" | "search_result_click";
  replaceLinks?: boolean;
  view?: "tile" | "list";
};

export function PostList({
  analyticsContext,
  postClickEvent = "post_card_click",
  posts,
  replaceLinks = false,
  view = "list",
}: PostListProps) {
  if (posts.length === 0) {
    return (
      <EmptyState
        className="bg-card shadow-sm"
        density="compact"
        description="발행된 글이 생기면 이 목록에 표시됩니다."
        media="icon"
        title="공개된 글이 없습니다."
      />
    );
  }

  if (view === "tile") {
    return (
      <div className="grid gap-6 sm:grid-cols-2">
        {posts.map((post, index) => (
          <PostTile
            analyticsContext={analyticsContext}
            key={post.path}
            post={post}
            postClickEvent={postClickEvent}
            priority={index === 0}
            replaceLinks={replaceLinks}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="bg-card shadow-sm">
      {posts.map((post, index) => (
        <PostListItem
          analyticsContext={analyticsContext}
          key={post.path}
          post={post}
          postClickEvent={postClickEvent}
          priority={index === 0}
          replaceLinks={replaceLinks}
        />
      ))}
    </div>
  );
}
