import { render, screen } from "@testing-library/react";
import { createElement } from "react";
import { describe, expect, it } from "vitest";

import { PostsPageView } from "./page";

const decision = {
  status: "authorized" as const,
  nextAction: "continue" as const,
  adminIdentity: { githubLogin: "ho", githubUserId: "123", sourcePath: "content/site.json" },
  session: { githubLogin: "ho", githubUserId: "123", expiresAt: "2099-01-01T00:00:00.000Z" },
};

describe("PostsPageView", () => {
  function postSummary(index: number) {
    return {
      path: `db/posts/post-${index}`,
      slug: `post-${index}`,
      title: `Post ${index}`,
      status: "published",
      sha: `sha-${index}`,
      publishedAt: `2026-07-${String(index).padStart(2, "0")}T00:00:00.000Z`,
      updatedAt: `2026-08-${String(index).padStart(2, "0")}T00:00:00.000Z`,
    };
  }

  it("renders post list and active posts navigation", () => {
    render(
      createElement(PostsPageView, {
        decision,
        posts: [
          {
            path: "db/posts/hello-world",
            slug: "hello-world",
            title: "Hello World",
            status: "published",
            sha: "sha",
            publishedAt: "2026-07-31T00:00:00.000Z",
            updatedAt: "2026-08-01T00:00:00.000Z",
          },
        ],
      }),
    );
    expect(screen.getByRole("heading", { level: 2, name: "모든 글" })).toBeTruthy();
    expect(screen.getByRole("columnheader", { name: "제목" })).toBeTruthy();
    expect(screen.getByRole("columnheader", { name: "상태" })).toBeTruthy();
    expect(screen.getByRole("columnheader", { name: "발행일" })).toBeTruthy();
    expect(screen.getByRole("columnheader", { name: "수정일" })).toBeTruthy();
    expect(screen.getByRole("columnheader", { name: "경로" })).toBeTruthy();
    expect(screen.getByRole("columnheader", { name: "바로가기" })).toBeTruthy();
    expect(screen.getByLabelText("Sort posts")).toBeTruthy();
    const postLinks = screen.getAllByRole("link", { name: /Hello World/ });
    expect(postLinks[0]).toBeTruthy();
    expect(postLinks[0]?.getAttribute("href")).toBe("/posts/hello-world");
    expect(screen.getByRole("link", { name: /새 초안/ })).toBeTruthy();
    expect(screen.queryByRole("button", { name: /Publish/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /Upload/i })).toBeNull();
    expect(screen.getByRole("link", { name: /Posts/ }).getAttribute("aria-current")).toBe("page");
  });

  it("renders post search controls and result count", () => {
    render(
      createElement(PostsPageView, {
        decision,
        query: "AI",
        posts: [
          {
            path: "db/posts/tistory-39",
            slug: "tistory-39",
            title: "검증 가능한 AI UI 설계하기",
            status: "published",
            sha: "sha",
            publishedAt: "2026-07-31T00:00:00.000Z",
            updatedAt: "2026-08-01T00:00:00.000Z",
          },
        ],
      }),
    );

    expect(screen.getAllByLabelText("Search posts").at(-1)).toBeTruthy();
    expect(screen.getByDisplayValue("AI")).toBeTruthy();
    expect(screen.getAllByDisplayValue("최신순").at(-1)).toBeTruthy();
    expect(screen.getByText('"AI" 검색 결과 1개')).toBeTruthy();
    expect(screen.getByRole("link", { name: "초기화" }).getAttribute("href")).toBe("/posts");
  });

  it("renders pagination controls for paged post lists", () => {
    render(
      createElement(PostsPageView, {
        decision,
        posts: Array.from({ length: 10 }, (_, index) => postSummary(index + 1)),
        currentPage: 2,
        totalPages: 3,
        totalCount: 25,
      }),
    );

    expect(screen.getByText("2 / 3 페이지")).toBeTruthy();
    const previous = screen.getAllByRole("button", { name: "이전" }).at(-1);
    const next = screen.getAllByRole("button", { name: "다음" }).at(-1);
    expect(previous?.closest("form")?.getAttribute("action")).toBe("/posts");
    expect(next?.closest("form")?.getAttribute("action")).toBe("/posts");
    expect(next?.closest("form")?.querySelector('input[name="page"]')?.getAttribute("value")).toBe(
      "3",
    );
    expect(screen.getAllByRole("link", { name: /^Post \d+$/ })).toHaveLength(10);
  });

  it("keeps updated sort in pagination links", () => {
    render(
      createElement(PostsPageView, {
        decision,
        posts: Array.from({ length: 10 }, (_, index) => postSummary(index + 1)),
        currentPage: 2,
        totalPages: 3,
        totalCount: 25,
        sort: "updated",
      }),
    );

    expect(screen.getAllByDisplayValue("최근 수정순").at(-1)).toBeTruthy();
    const previous = screen.getAllByRole("button", { name: "이전" }).at(-1);
    const next = screen.getAllByRole("button", { name: "다음" }).at(-1);
    expect(
      previous?.closest("form")?.querySelector('input[name="sort"]')?.getAttribute("value"),
    ).toBe("updated");
    expect(next?.closest("form")?.querySelector('input[name="sort"]')?.getAttribute("value")).toBe(
      "updated",
    );
    expect(next?.closest("form")?.querySelector('input[name="page"]')?.getAttribute("value")).toBe(
      "3",
    );
  });

  it("renders empty state message when no posts exist", () => {
    render(
      createElement(PostsPageView, {
        decision,
        posts: [],
      }),
    );

    expect(screen.getByText(/표시할 글이 없습니다./)).toBeTruthy();
    expect(screen.getByText(/D1 연결을 확인하거나 첫 초안을 만들어보세요./)).toBeTruthy();
  });
});
