import { expect, it } from "vitest";
import { articleDiscovery } from "./article-discovery";
import type { PublicPost } from "../blog/server/content-source";

const post = (
  slug: string,
  title: string,
  date: string,
  tags: string[],
  status: PublicPost["status"] = "published",
): PublicPost => ({
  path: slug,
  slug,
  title,
  publishedAt: date,
  status,
  tags,
  tagEntries: [],
  author: "최호",
  body: "",
  bodyNodes: [],
  toc: [],
  readingTimeLabel: "1분",
});
it("filters drafts and excluded topics, then sorts by publication date", () => {
  const posts = [
    post("old", "React old", "2025-01-01", ["React"]),
    post("new", "React new", "2026-01-01", ["React"]),
    post("ai", "React AI", "2026-02-01", ["React", "AI"]),
    post("draft", "React draft", "2026-03-01", ["React"], "draft"),
  ];
  expect(articleDiscovery("최근 React 글 AI 제외", posts).sources.map((s) => s.url)).toEqual([
    "/blog/new",
    "/blog/old",
  ]);
  expect(articleDiscovery("최근 AI 글", posts).sources.map((s) => s.url)).toEqual(["/blog/ai"]);
});
