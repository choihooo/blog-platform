"use client";

import { SearchBar } from "@hozui/react";

export function BlogSearchForm({
  activeCategory,
  className,
  query,
  size = "lg",
  view,
}: {
  activeCategory?: string;
  className?: string;
  query: string;
  size?: "sm" | "md" | "lg";
  view: "tile" | "list";
}) {
  return (
    <form action="/" className={className ?? "relative mx-auto w-full max-w-xl"}>
      {activeCategory ? <input name="category" type="hidden" value={activeCategory} /> : null}
      {view === "list" ? <input name="view" type="hidden" value="list" /> : null}
      <SearchBar
        aria-label="검색어"
        defaultValue={query}
        name="q"
        placeholder="검색어를 입력하세요"
        size={size}
        submitLabel="검색"
        variant="submit"
      />
    </form>
  );
}

export function BlogHeaderSearchForm() {
  return <BlogSearchForm className="hidden w-56 md:block lg:w-72" query="" size="sm" view="tile" />;
}
