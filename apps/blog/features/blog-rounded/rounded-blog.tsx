"use client";

import Link from "next/link";
import { ArrowUpRight, Search, X } from "lucide-react";
import { useState } from "react";
import { MainHeader } from "../navigation/main-header";
import {
  filterPreviewPosts,
  matchesCategory,
  type PreviewCategory,
  type PreviewPost,
} from "./preview-model";
import "./rounded-blog.css";
import { VirtualPostGrid } from "./virtual-post-grid";

export function RoundedBlog({
  posts,
  categories,
}: {
  posts: PreviewPost[];
  categories: PreviewCategory[];
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const filtered = filterPreviewPosts(posts, query, category);
  const selectedLabel = categories.find((item) => item.slug === category)?.label ?? "전체 글";
  const available = categories.filter((item) =>
    posts.some((post) => matchesCategory(post, item.slug)),
  );
  const labels = Object.fromEntries(categories.map((item) => [item.slug, item.label]));

  function selectCategory(slug: string) {
    setCategory(slug);
  }

  return (
    <div className="rounded-blog">
      <MainHeader active="blog" />
      <main className="rounded-blog-wrap">
        <h1 className="sr-only">블로그 글 목록</h1>
        <header className="rounded-blog-intro">
          <form
            className="rounded-blog-search"
            role="search"
            onSubmit={(event) => event.preventDefault()}
          >
            <Search size={20} aria-hidden="true" />
            <label className="sr-only" htmlFor="rounded-blog-query">
              제목·태그로 검색
            </label>
            <input
              id="rounded-blog-query"
              type="search"
              placeholder="제목·태그로 검색"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
              }}
            />
            {query && (
              <button
                type="button"
                aria-label="검색어 지우기"
                onClick={() => {
                  setQuery("");
                }}
              >
                <X size={18} />
              </button>
            )}
          </form>
        </header>

        <div className="rounded-blog-layout">
          <aside className="rounded-blog-sidebar" aria-label="카테고리">
            <h2>카테고리</h2>
            <nav>
              <button
                className="rounded-blog-category"
                aria-pressed={!category}
                onClick={() => selectCategory("")}
              >
                <span>전체 글</span>
                <span>{posts.length}</span>
              </button>
              {available.map((item) => (
                <button
                  key={item.slug}
                  className={`rounded-blog-category${item.depth > 1 ? " rounded-blog-category--child" : ""}`}
                  aria-pressed={category === item.slug}
                  onClick={() => selectCategory(item.slug)}
                >
                  <span>{item.label}</span>
                  <span>{posts.filter((post) => matchesCategory(post, item.slug)).length}</span>
                </button>
              ))}
            </nav>
          </aside>

          <section className="rounded-blog-results" aria-label="글 목록">
            <div className="rounded-blog-toolbar">
              <h2>
                {selectedLabel}
                <span aria-live="polite">{filtered.length}</span>
              </h2>
            </div>
            {filtered.length ? (
              <VirtualPostGrid key={`${category}:${query}`} posts={filtered} labels={labels} />
            ) : (
              <div className="rounded-blog-empty">
                <Search size={28} aria-hidden="true" />
                <h3>검색 결과가 없어요.</h3>
                <p>다른 키워드나 카테고리로 찾아보세요.</p>
                <button
                  onClick={() => {
                    setQuery("");
                    selectCategory("");
                  }}
                >
                  전체 글 보기
                </button>
              </div>
            )}
          </section>
        </div>
        <footer className="rounded-blog-footer">
          <span>HOZORICA · BLOG</span>
          <Link href="/blog">
            현재 블로그 보기 <ArrowUpRight size={14} aria-hidden="true" />
          </Link>
        </footer>
      </main>
    </div>
  );
}
