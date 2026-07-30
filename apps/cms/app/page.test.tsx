import { render, screen } from "@testing-library/react";
import { createElement } from "react";
import { describe, expect, it } from "vitest";

import { CmsHomePageView } from "./page";

const decision = {
  status: "authorized" as const,
  nextAction: "continue" as const,
  adminIdentity: { githubLogin: "ho", githubUserId: "123", sourcePath: "content/site.json" },
  session: { githubLogin: "ho", githubUserId: "123", expiresAt: "2099-01-01T00:00:00.000Z" },
};

describe("CmsHomePageView", () => {
  it("renders live content counts and recent posts", () => {
    render(
      createElement(CmsHomePageView, {
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

    expect(screen.getByRole("heading", { name: /최근 글/ })).toBeTruthy();
    expect(screen.getByRole("link", { name: /Hello World/ })).toBeTruthy();
    expect(screen.getByRole("link", { name: /새 초안/ })).toBeTruthy();
    expect(screen.getByRole("link", { name: /Dashboard/ }).getAttribute("aria-current")).toBe(
      "page",
    );
  });
});
