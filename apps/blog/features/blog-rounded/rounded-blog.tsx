"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowDown, ArrowUpRight, Check, Grid2X2, List, Search, X } from "lucide-react";
import { useState } from "react";
import { MainHeader } from "../navigation/main-header";
import { formatPostDate } from "@/shared/date/date-format";
import {
  blogPreviewPath,
  canOptimizePreviewImage,
  filterPreviewPosts,
  matchesCategory,
  type PreviewCategory,
  type PreviewPost,
} from "./preview-model";
import "./rounded-blog.css";
import { PostTags } from "./post-tags";

export function RoundedBlog({
  posts,
  categories,
}: {
  posts: PreviewPost[];
  categories: PreviewCategory[];
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [view, setView] = useState<"tile" | "list">("tile");
  const [visible, setVisible] = useState(8);
  const filtered = filterPreviewPosts(posts, query, category);
  const selectedLabel = categories.find((item) => item.slug === category)?.label ?? "전체 글";
  const available = categories.filter((item) =>
    posts.some((post) => matchesCategory(post, item.slug)),
  );
  const labels = Object.fromEntries(categories.map((item) => [item.slug, item.label]));

  function selectCategory(slug: string) {
    setCategory(slug);
    setVisible(8);
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
                setVisible(8);
              }}
            />
            {query && (
              <button
                type="button"
                aria-label="검색어 지우기"
                onClick={() => {
                  setQuery("");
                  setVisible(8);
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
              <div className="rounded-blog-view" role="group" aria-label="보기 방식">
                <button
                  aria-label="타일 보기"
                  aria-pressed={view === "tile"}
                  onClick={() => setView("tile")}
                >
                  <Grid2X2 size={17} />
                </button>
                <button
                  aria-label="목록 보기"
                  aria-pressed={view === "list"}
                  onClick={() => setView("list")}
                >
                  <List size={19} />
                </button>
              </div>
            </div>
            {filtered.length ? (
              <div className="rounded-blog-grid" data-view={view}>
                {filtered.slice(0, visible).map((post, index) => (
                  <article className="rounded-blog-card" key={post.slug}>
                    <Link
                      href={`${blogPreviewPath}/${post.slug}`}
                      className="rounded-blog-card-link"
                      prefetch={false}
                    >
                      <div className="rounded-blog-cover">
                        <Image
                          src={post.coverImage || "/brand/no-thumbnail.webp"}
                          alt=""
                          fill
                          priority={index < 2}
                          unoptimized={
                            !canOptimizePreviewImage(post.coverImage || "/brand/no-thumbnail.webp")
                          }
                          sizes="(max-width: 759px) calc(100vw - 48px), (max-width: 1100px) calc((100vw - 156px) / 2), (max-width: 1440px) calc((100vw - 386px) / 2), 528px"
                        />
                      </div>
                      <div className="rounded-blog-card-copy">
                        <div className="rounded-blog-card-top">
                          <div className="rounded-blog-taxonomy">
                            <span className="rounded-blog-badge">
                              {labels[post.category ?? ""] ?? "기록"}
                            </span>
                            <PostTags tags={post.tagEntries} />
                          </div>
                          <ArrowUpRight size={20} aria-hidden="true" />
                        </div>
                        <h3 title={post.title}>{post.title}</h3>
                        {post.excerpt && <p className="rounded-blog-excerpt">{post.excerpt}</p>}
                        <div className="rounded-blog-card-meta">
                          <time dateTime={post.publishedAt}>
                            {formatPostDate(post.publishedAt)}
                          </time>
                          <span aria-hidden="true">·</span>
                          <span>{post.readingTimeLabel}</span>
                        </div>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
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
            {visible < filtered.length ? (
              <button
                className="rounded-blog-more"
                onClick={() => setVisible((count) => count + 8)}
              >
                글 더 보기
                <ArrowDown size={17} aria-hidden="true" />
              </button>
            ) : (
              filtered.length > 0 && (
                <p className="rounded-blog-end">
                  <Check size={14} aria-hidden="true" /> 모든 기록을 읽었어요.
                </p>
              )
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
