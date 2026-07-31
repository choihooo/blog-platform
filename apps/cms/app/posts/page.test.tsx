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
          },
        ],
      }),
    );
    expect(screen.getByRole("heading", { level: 2, name: "모든 글" })).toBeTruthy();
    expect(screen.getByRole("columnheader", { name: "제목" })).toBeTruthy();
    expect(screen.getByRole("columnheader", { name: "상태" })).toBeTruthy();
    expect(screen.getByRole("columnheader", { name: "경로" })).toBeTruthy();
    expect(screen.getByRole("columnheader", { name: "바로가기" })).toBeTruthy();
    const postLinks = screen.getAllByRole("link", { name: /Hello World/ });
    expect(postLinks[0]).toBeTruthy();
    expect(postLinks[0]?.getAttribute("href")).toBe("/posts/hello-world");
    expect(screen.getByRole("link", { name: /새 초안/ })).toBeTruthy();
    expect(screen.queryByRole("button", { name: /Publish/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /Upload/i })).toBeNull();
    expect(screen.getByRole("link", { name: /Posts/ }).getAttribute("aria-current")).toBe("page");
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
