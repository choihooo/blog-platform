"use client";

import { SearchBar } from "@hozui/react";
import { useFormStatus } from "react-dom";

export function BlogSearchForm({
  className,
  query,
  size = "lg",
}: {
  className?: string;
  query: string;
  size?: "sm" | "md" | "lg";
}) {
  return (
    <form action="/blog/search" className={className ?? "relative mx-auto w-full max-w-xl"}>
      <BlogSearchBar query={query} size={size} />
    </form>
  );
}

function BlogSearchBar({ query, size }: { query: string; size: "sm" | "md" | "lg" }) {
  const { pending } = useFormStatus();

  return (
    <SearchBar
      aria-label="검색어"
      defaultValue={query}
      loading={pending}
      name="q"
      placeholder="검색어를 입력하세요"
      size={size}
      submitLabel="검색"
      variant="submit"
    />
  );
}

export function BlogHeaderSearchForm() {
  return <BlogSearchForm className="hidden w-56 md:block lg:w-72" query="" size="sm" />;
}
