import { cleanup, render, screen } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, describe, expect, it } from "vitest";

import { PostsPageView } from "./page";

const decision = {
  status: "authorized" as const,
  nextAction: "continue" as const,
  adminIdentity: { githubLogin: "ho", githubUserId: "123", sourcePath: "content/site.json" },
  session: { githubLogin: "ho", githubUserId: "123", expiresAt: "2099-01-01T00:00:00.000Z" },
};

afterEach(() => {
  cleanup();
});

describe("PostsPageView", () => {
  it("renders category navigation, search, and view controls", () => {
    render(
      createElement(PostsPageView, {
        decision,
        posts: [
          {
            path: "db/posts/hello-world",
            slug: "hello-world",
            title: "Hello World",
            status: "published",
            excerpt: "Sample post",
            category: "engineering",
            publishedAt: "2026-07-30",
            sha: "sha",
          },
        ],
      }),
    );
    expect(screen.getByRole("heading", { level: 2, name: "카테고리" })).toBeTruthy();
    expect(screen.getByRole("searchbox", { name: "검색어" })).toBeTruthy();
    expect(screen.getByRole("link", { name: /전체보기 \(1\)/ })).toBeTruthy();
    expect(screen.getByRole("link", { name: /Engineering \(1\)/ })).toBeTruthy();
    expect(screen.getByRole("link", { name: "타일뷰" }).getAttribute("aria-current")).toBe("page");
    expect(screen.getByRole("link", { name: "리스트뷰" })).toBeTruthy();
    const postLinks = screen.getAllByRole("link", { name: /Hello World/ });
    expect(postLinks[0]).toBeTruthy();
    expect(postLinks[0]?.getAttribute("href")).toBe("/posts/hello-world");
    expect(screen.getByRole("link", { name: /새 초안/ })).toBeTruthy();
    expect(screen.queryByRole("button", { name: /Publish/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /Upload/i })).toBeNull();
    expect(screen.getByRole("link", { name: /Posts/ }).getAttribute("aria-current")).toBe("page");
  });

  it("filters posts by query and selected category", () => {
    render(
      createElement(PostsPageView, {
        decision,
        searchParams: { category: "engineering", q: "react", view: "list" },
        posts: [
          {
            path: "db/posts/react-note",
            slug: "react-note",
            title: "React Note",
            status: "published",
            excerpt: "Component memo",
            category: "engineering",
            sha: "sha-1",
          },
          {
            path: "db/posts/other",
            slug: "other",
            title: "Other",
            status: "published",
            excerpt: "Different category",
            category: "memo",
            sha: "sha-2",
          },
        ],
      }),
    );

    expect(screen.getByRole("link", { name: "리스트뷰" }).getAttribute("aria-current")).toBe(
      "page",
    );
    expect(screen.getByRole("link", { name: /React Note/ })).toBeTruthy();
    expect(screen.queryByRole("link", { name: /Other/ })).toBeNull();
    expect(screen.getByDisplayValue("react")).toBeTruthy();
  });

  it("renders empty state message when no posts exist", () => {
    render(
      createElement(PostsPageView, {
        decision,
        posts: [],
      }),
    );

    expect(screen.getByText(/표시할 글이 없습니다./)).toBeTruthy();
    expect(screen.getByText(/검색어를 바꾸거나 다른 카테고리를 선택해보세요./)).toBeTruthy();
  });
});
