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
  it("renders readiness state and active posts navigation", () => {
    render(createElement(PostsPageView, { decision }));
    expect(screen.getByRole("heading", { level: 2, name: "Posts" })).toBeTruthy();
    expect(screen.getByText(/다음 phase/)).toBeTruthy();
    expect(screen.getByRole("link", { name: /Posts/ }).getAttribute("aria-current")).toBe("page");
  });
});
