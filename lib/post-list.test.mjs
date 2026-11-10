import assert from "node:assert/strict";
import test from "node:test";
import { filterPosts, groupPostsByYear } from "./post-list.ts";

const posts = [
  { slug: "old", title: "React 기록", description: "컴포넌트 설계", date: "2024-12-31" },
  { slug: "ai", title: "AI에 대한 호기심", description: "작은 React 프로젝트", date: "2026-01-02" },
  { slug: "new", title: "여백의 역할", description: "읽기 좋은 블로그", date: "2026-11-10" },
  { slug: "middle", title: "개발 회고", description: "배운 것을 기록하기", date: "2025-05-01" },
];

test("groups years and posts newest first without mutating the source", () => {
  const before = structuredClone(posts);
  const groups = groupPostsByYear(posts);
  assert.deepEqual(groups.map(g => g.year), ["2026", "2025", "2024"]);
  assert.deepEqual(groups[0].posts.map(p => p.slug), ["new", "ai"]);
  assert.deepEqual(posts, before);
});

test("searches Korean title and description, normalizes case and requires every term", () => {
  assert.deepEqual(filterPosts(posts, "  ai   REACT  ").map(p => p.slug), ["ai"]);
  assert.deepEqual(filterPosts(posts, "읽기").map(p => p.slug), ["new"]);
  assert.deepEqual(filterPosts(posts, "회고").map(p => p.slug), ["middle"]);
  assert.deepEqual(filterPosts(posts, "ＡＩ").map(p => p.slug), ["ai"]);
});

test("empty queries preserve all posts; empty results produce no year headings", () => {
  assert.deepEqual(filterPosts(posts, " \n "), posts);
  assert.deepEqual(groupPostsByYear(filterPosts(posts, "없는 검색어")), []);
  assert.deepEqual(groupPostsByYear([]), []);
});
