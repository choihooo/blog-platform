"use client";
import { useState } from "react";
import {
  filterPosts,
  matchesCategory,
  type ListingCategory,
  type PostSummary,
} from "../model/post-summary";

export function useBlogFilter(posts: PostSummary[], categories: ListingCategory[]) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  return {
    query,
    category,
    setQuery,
    setCategory,
    filtered: filterPosts(posts, query, category),
    selectedLabel: categories.find((item) => item.slug === category)?.label ?? "전체 글",
    available: categories.filter((item) => posts.some((post) => matchesCategory(post, item.slug))),
    labels: Object.fromEntries(categories.map((item) => [item.slug, item.label])),
  };
}
