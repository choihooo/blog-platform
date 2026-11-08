"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { defaultRangeExtractor, useWindowVirtualizer } from "@tanstack/react-virtual";
import { getImageProps } from "next/image";
import { Check } from "lucide-react";
import { canOptimizePreviewImage, previewImageSizes, type PreviewPost } from "./preview-model";
import { getPostRows } from "./post-rows";
import { PostCard } from "./post-card";
import { createScrollLoadGate } from "./scroll-load-gate";

const batchSize = 8;

export function VirtualPostGrid({
  posts,
  labels,
}: {
  posts: PreviewPost[];
  labels: Record<string, string>;
}) {
  const listRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadGate = useRef(createScrollLoadGate());
  const pendingAnchor = useRef<{ index: string; top: number } | null>(null);
  const pendingCompletion = useRef(false);
  const [visible, setVisible] = useState(batchSize);
  const [columns, setColumns] = useState(2);
  const [margin, setMargin] = useState(0);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedRow, setFocusedRow] = useState<number | null>(null);
  const hasMore = visible < posts.length;
  const rows = getPostRows(posts, visible, columns);
  const virtualizer = useWindowVirtualizer({
    count: rows.length,
    estimateSize: () => (columns === 1 ? 520 : 600),
    overscan: 2,
    scrollMargin: margin,
    getItemKey: (index) => `${columns}:${rows[index]?.[0]?.slug ?? index}`,
    rangeExtractor: (range) => {
      const indexes = defaultRangeExtractor(range);
      if (focusedRow !== null && focusedRow < rows.length && !indexes.includes(focusedRow)) {
        indexes.push(focusedRow);
        indexes.sort((a, b) => a - b);
      }
      return indexes;
    },
  });

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const update = () => {
      setColumns(window.matchMedia("(max-width: 759px)").matches ? 1 : 2);
      setMargin(list.getBoundingClientRect().top + window.scrollY);
    };
    update();
    setReady(true);
    // Changing a filter while far down the list should reveal its first result.
    const top = list.getBoundingClientRect().top + window.scrollY;
    if (window.scrollY > top) window.scrollTo({ top: Math.max(0, top - 140), behavior: "instant" });
    const observer = new ResizeObserver(update);
    observer.observe(list);
    window.addEventListener("resize", update);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  useEffect(() => {
    virtualizer.measure();
  }, [columns, virtualizer]);

  useLayoutEffect(() => {
    const anchor = pendingAnchor.current;
    if (!pendingCompletion.current) return;
    const row = anchor && listRef.current?.querySelector(`[data-index="${anchor.index}"]`);
    if (row && anchor) {
      const offset = row.getBoundingClientRect().top - anchor.top;
      if (offset !== 0) window.scrollBy({ top: offset, behavior: "instant" });
    }
    pendingAnchor.current = null;
    pendingCompletion.current = false;
    loadGate.current.complete(window.scrollY);
  }, [visible]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;
    const requestNext = () => {
      const bounds = sentinel.getBoundingClientRect();
      if (
        bounds.top <= window.innerHeight + 600 &&
        bounds.bottom >= -600 &&
        loadGate.current.request(
          window.scrollY,
          document.documentElement.scrollHeight - window.innerHeight,
        )
      )
        setLoading(true);
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) requestNext();
      },
      { rootMargin: "600px 0px" },
    );
    observer.observe(sentinel);
    const resizeObserver = new ResizeObserver(requestNext);
    if (listRef.current) resizeObserver.observe(listRef.current);
    window.addEventListener("scroll", requestNext, { passive: true });
    window.addEventListener("resize", requestNext);
    return () => {
      observer.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener("scroll", requestNext);
      window.removeEventListener("resize", requestNext);
    };
  }, [hasMore]);

  useEffect(() => {
    if (!loading || !hasMore) return;
    let cancelled = false;
    const images = posts.slice(visible, visible + batchSize).map((post) => {
      const image = new window.Image();
      const src = post.coverImage || "/brand/no-thumbnail.webp";
      const { props } = getImageProps({
        src,
        alt: "",
        fill: true,
        sizes: previewImageSizes,
        unoptimized: !canOptimizePreviewImage(src),
      });
      image.sizes = props.sizes ?? "";
      image.srcset = props.srcSet ?? "";
      image.src = props.src;
      return image.decode().catch(() => undefined);
    });
    let timeout: ReturnType<typeof setTimeout>;
    const deadline = new Promise<void>((resolve) => {
      timeout = setTimeout(resolve, 1500);
    });
    Promise.race([Promise.all(images), deadline]).then(() => {
      clearTimeout(timeout);
      if (cancelled) return;
      pendingCompletion.current = true;
      const mountedRows = Array.from(
        listRef.current?.querySelectorAll<HTMLElement>("[data-index]") ?? [],
      );
      const anchorRow =
        mountedRows.find((row) => row.getBoundingClientRect().bottom > 0) ?? mountedRows.at(-1);
      if (anchorRow)
        pendingAnchor.current = {
          index: anchorRow.dataset.index!,
          top: anchorRow.getBoundingClientRect().top,
        };
      setVisible((count) => Math.min(count + batchSize, posts.length));
      setLoading(false);
    });
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [loading, hasMore, posts, visible]);

  const renderRow = (index: number) =>
    (rows[index] ?? []).map((post, column) => (
      <PostCard
        key={post.slug}
        post={post}
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
