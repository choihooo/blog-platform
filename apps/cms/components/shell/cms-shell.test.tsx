import { render, screen } from "@testing-library/react";
import { createElement } from "react";
import { describe, expect, it } from "vitest";

import { CmsShell } from "./cms-shell";

const session = {
  githubLogin: "ho",
  githubUserId: "123",
  displayName: "Ho",
  expiresAt: "2099-01-01T00:00:00.000Z",
};

describe("CmsShell", () => {
  it("renders sidebar, top bar, account state, and no later-phase actions", () => {
    render(
      createElement(
        CmsShell,
        { activePath: "/posts", session, title: "Posts" },
        createElement("p", null, "Ready"),
      ),
    );

    expect(screen.getByRole("navigation", { name: "CMS navigation" })).toBeTruthy();
    expect(screen.getByRole("link", { name: /Posts/ }).getAttribute("aria-current")).toBe("page");
    expect(screen.getByRole("button", { name: "Account menu" })).toBeTruthy();
    expect(screen.queryByText(/Publish/i)).toBeNull();
    expect(screen.queryByText(/Upload/i)).toBeNull();
    expect(screen.queryByText(/Editor/i)).toBeNull();
  });
});
