"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Post } from "@/lib/posts";
import { filterPosts } from "@/lib/post-list";
import { createDebouncedTask } from "@/lib/debounce";
import { highlightSearchMatches } from "@/lib/search-highlight";
import { trackEvent } from "@/lib/analytics";

function SearchText({ text, query }: { text: string; query: string }) {
  return highlightSearchMatches(text, query).map((part, index) => part.matched
    ? <mark key={index} className="blog-search-highlight">{part.text}</mark>
    : part.text);
}

export function BlogSearch({ posts }: { posts: Post[] }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const composing = useRef(false);
  const trackedQuery = useRef("");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCompletion, setSearchCompletion] = useState(0);
  const search = useMemo(() => createDebouncedTask<string>(value => {
    setSearchQuery(value);
    setSearchCompletion(current => current + 1);
  }, 300), []);
  const searching = searchQuery.trim().length > 0;
  const pending = open && query.trim().length > 0 && query !== searchQuery;
  const matches = useMemo(() => searching ? filterPosts(posts, searchQuery) : [], [posts, searchQuery, searching]);

  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!open || pending || composing.current || !trimmed || trackedQuery.current === trimmed) return;
    trackedQuery.current = trimmed;
    trackEvent("blog_search", { query_length: Array.from(trimmed).length, result_count: matches.length });
  }, [searchCompletion, open, pending, searchQuery, matches.length]);

  useEffect(() => () => search.cancel(), [search]);

  function updateQuery(value: string) {
    setQuery(value);
    search.cancel();
    if (!value.trim()) { setSearchQuery(""); trackedQuery.current = ""; }
    else search.schedule(value);
  }

  useEffect(() => {
    if (!open) return;
    const previous = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => { document.documentElement.style.overflow = previous; };
  }, [open]);

  function openSearch() {
    dialog.current?.showModal();
    setOpen(true);
    input.current?.focus();
    trackEvent("search_open", {});
  }

  function closeSearch() {
    search.cancel();
    dialog.current?.close();
  }

  return (
    <>
      <button ref={trigger} type="button" className="writing-search-toggle"
        aria-label="글 검색 열기" aria-haspopup="dialog" aria-expanded={open}
        aria-controls="blog-search-dialog" onClick={openSearch}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 4 4" />
        </svg>
        검색
      </button>
      <dialog ref={dialog} id="blog-search-dialog" className="blog-search-dialog"
        aria-labelledby="blog-search-title"
        onCancel={event => { if (composing.current) event.preventDefault(); }}
        onClose={() => {
          setOpen(false);
          search.cancel();
          setQuery("");
          setSearchQuery("");
          trackedQuery.current = "";
          composing.current = false;
          trigger.current?.focus();
        }}
        onClick={event => {
          if (event.target !== event.currentTarget) return;
          const rect = event.currentTarget.getBoundingClientRect();
          if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeSearch();
        }}>
        <div className="blog-search-header">
          <h2 id="blog-search-title" className="sr-only">글 검색</h2>
          <label className="sr-only" htmlFor="blog-search-query">글 검색</label>
          <div className="blog-search-input-wrap">
          <input ref={input} id="blog-search-query" className="writing-search-input" type="search" autoComplete="off"
            placeholder="글 검색" value={query} aria-busy={pending}
            onChange={event => updateQuery(event.target.value)}
            onKeyDown={event => {
              if (event.key === "Escape" && !event.nativeEvent.isComposing && !composing.current) {
                event.preventDefault();
                closeSearch();
              }
            }}
            onCompositionStart={() => {
              composing.current = true;
            }}
            onCompositionEnd={event => {
              composing.current = false;
              updateQuery(event.currentTarget.value);
            }} />
          </div>
          <button type="button" className="blog-search-close" onClick={closeSearch} aria-label="검색 닫기">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
          </button>
        </div>
        <p role="status" aria-live="polite" aria-atomic="true" className="sr-only">
          {pending ? "검색 중" : searching ? `검색 결과 ${matches.length}개` : ""}
        </p>
        {(searching || pending) && <div className="blog-search-results" aria-busy={pending}>
          {pending ? (
            <div className="blog-search-loading" aria-label="검색 중">
              <svg className="blog-search-spinner" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <circle cx="10" cy="10" r="7" opacity="0.2" />
                <path d="M10 3a7 7 0 0 1 7 7" strokeLinecap="round" />
              </svg>
            </div>
          ) : matches.length === 0 ? (
            <p className="blog-search-empty">일치하는 글이 없습니다. 다른 단어로 검색해 보세요.</p>
          ) : (
            <ul>
              {matches.map((post, index) => (
                <li key={post.slug}>
                  <Link href={`/blog/${post.slug}`} onClick={() => {
                    trackEvent("search_result_click", { article_slug: post.slug, result_position: index + 1 });
                    closeSearch();
                  }}>
                    <span className="blog-search-result-title"><SearchText text={post.title} query={searchQuery} /></span>
                    <span className="blog-search-result-description"><SearchText text={post.description} query={searchQuery} /></span>
                    <time dateTime={post.date}>{post.date.replaceAll("-", ".")}</time>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>}
      </dialog>
    </>
  );
}
