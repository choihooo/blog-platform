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
            path: "content/posts/hello-world.mdx",
            slug: "hello-world",
            title: "Hello World",
            status: "published",
            sha: "sha",
          },
        ],
      }),
    );
    expect(screen.getByRole("heading", { level: 2, name: "Posts" })).toBeTruthy();
    expect(screen.getByRole("link", { name: /Hello World/ })).toBeTruthy();
    expect(screen.getByRole("link", { name: /New draft/ })).toBeTruthy();
    expect(screen.queryByRole("button", { name: /Publish/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /Upload/i })).toBeNull();
    expect(screen.getByRole("link", { name: /Posts/ }).getAttribute("aria-current")).toBe("page");
  });
});
