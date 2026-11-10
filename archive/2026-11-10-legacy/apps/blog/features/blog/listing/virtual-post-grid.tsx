"use client";

import { Check } from "lucide-react";
import type { PostSummary } from "../model/post-summary";
import { useVirtualPostGrid } from "./use-virtual-post-grid";
import { PostCard } from "./post-card";

export function VirtualPostGrid({
  posts,
  labels,
  basePath = "/blog",
}: {
  posts: PostSummary[];
  labels: Record<string, string>;
  basePath?: string;
}) {
  const {
    listRef,
    sentinelRef,
    rows,
    virtualizer,
    ready,
    loading,
    hasMore,
    columns,
    visible,
    setFocusedRow,
    margin,
  } = useVirtualPostGrid(posts);

  const renderRow = (index: number) =>
    (rows[index] ?? []).map((post, column) => (
      <PostCard
        key={post.slug}
        post={post}
        basePath={basePath}
        label={labels[post.category ?? ""] ?? "기록"}
        priority={index === 0 && column < 2}
      />
    ));

  return (
    <>
      <div
        ref={listRef}
        className="rounded-blog-virtual-list"
        data-loaded={Math.min(visible, posts.length)}
      >
        {ready ? (
          <div style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
            {virtualizer.getVirtualItems().map((row) => (
              <div
                key={row.key}
                ref={virtualizer.measureElement}
                data-index={row.index}
                onFocusCapture={() => setFocusedRow(row.index)}
                onBlurCapture={(event) => {
                  if (!event.currentTarget.contains(event.relatedTarget as Node | null))
                    setFocusedRow(null);
                }}
                className="rounded-blog-grid rounded-blog-virtual-row"
                style={{ transform: `translateY(${row.start - margin}px)` }}
              >
                {renderRow(row.index)}
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-blog-grid">{rows.flatMap((_, index) => renderRow(index))}</div>
        )}
      </div>
      {hasMore ? (
        <div ref={sentinelRef} className="rounded-blog-load-trigger" aria-busy={loading}>
          {loading && (
            <>
              <span role="status" className="sr-only">
                다음 글을 불러오는 중이에요.
              </span>
              <div className="rounded-blog-grid" aria-hidden="true">
                {Array.from({ length: columns }, (_, index) => (
                  <div className="rounded-blog-skeleton" key={index}>
                    <div className="rounded-blog-skeleton-cover" />
                    <div className="rounded-blog-skeleton-copy">
                      <i />
                      <i />
                      <i />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      ) : (
        <p className="rounded-blog-end">
          <Check size={14} aria-hidden="true" /> 모든 글을 확인했어요.
        </p>
      )}
    </>
  );
}
