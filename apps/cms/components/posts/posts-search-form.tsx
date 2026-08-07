"use client";

import { SearchBar } from "@hozui/react";
import { useFormStatus } from "react-dom";

export function PostsSearchForm({ query, sort }: { query: string; sort: "published" | "updated" }) {
  return (
    <form action="/posts" className="flex max-w-3xl flex-wrap gap-2">
      <PostsSearchBar query={query} />
      <select
        aria-label="Sort posts"
        className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground"
        defaultValue={sort}
        name="sort"
      >
        <option value="published">최신순</option>
        <option value="updated">최근 수정순</option>
      </select>
      {query ? (
        <a
          className="inline-flex h-10 items-center rounded-md px-3 text-sm font-medium text-muted-foreground hover:text-foreground"
          href="/posts"
        >
          초기화
        </a>
      ) : null}
    </form>
  );
}

function PostsSearchBar({ query }: { query: string }) {
  const { pending } = useFormStatus();

  return (
    <SearchBar
      aria-label="Search posts"
      defaultValue={query}
      loading={pending}
      name="q"
      placeholder="제목, slug, 상태, 본문 검색"
      submitLabel="검색"
      variant="submit"
    />
  );
}
