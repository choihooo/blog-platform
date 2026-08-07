"use client";

import { SearchBar } from "@hozui/react";

export function BlogSearchForm({
  activeCategory,
  query,
  view,
}: {
  activeCategory?: string;
  query: string;
  view: "tile" | "list";
}) {
  return (
    <form action="/" className="relative mx-auto w-full max-w-xl">
      {activeCategory ? <input name="category" type="hidden" value={activeCategory} /> : null}
      {view === "list" ? <input name="view" type="hidden" value="list" /> : null}
      <SearchBar
        aria-label="검색어"
        defaultValue={query}
        name="q"
        placeholder="검색어를 입력하세요"
        size="lg"
        submitLabel="검색"
        variant="submit"
      />
    </form>
  );
}
