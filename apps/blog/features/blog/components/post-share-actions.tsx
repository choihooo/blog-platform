"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Share2 } from "lucide-react";

import type { PostAnalyticsContext } from "./post-analytics-events";
import { sharePost } from "./post-share";

export function PostShareActions({ context }: { context: PostAnalyticsContext }) {
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    setCanNativeShare(typeof navigator.share === "function");
  }, []);

  async function onCopyLink() {
    await sharePost({ context, mode: "copy-link" });
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  async function onNativeShare() {
    try {
      await sharePost({ context, mode: "native" });
    } catch {
      await onCopyLink();
    }
  }

  return (
    <section className="blog-detail__share mt-16 border-t border-border pt-8" aria-label="글 공유">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="blog-detail__share-copy">
          <h2 className="blog-detail__section-title text-xl font-semibold tracking-normal">공유</h2>
          <p className="mt-1 text-sm text-muted-foreground">{context.title}</p>
        </div>
        <div className="blog-detail__share-actions flex flex-wrap items-center gap-2">
          {canNativeShare ? (
            <button
              className="blog-detail__share-button blog-detail__share-button--primary inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-transform hover:-translate-y-0.5"
              onClick={() => void onNativeShare()}
              type="button"
            >
              <Share2 aria-hidden="true" size={16} />
              공유하기
            </button>
          ) : null}
          <button
            className="blog-detail__share-button inline-flex h-10 items-center gap-2 rounded-md border border-border px-4 text-sm font-medium text-foreground hover:bg-muted"
            onClick={() => void onCopyLink()}
            type="button"
          >
            {copied ? (
              <Check aria-hidden="true" size={16} />
            ) : (
              <Copy aria-hidden="true" size={16} />
            )}
            {copied ? "복사됨" : "링크 복사"}
          </button>
        </div>
      </div>
    </section>
  );
}
