import { fireEvent, render, screen } from "@testing-library/react";
import { createElement } from "react";
import { describe, expect, it } from "vitest";

import { normalizeSiteConfig } from "../../lib/site-config";
import { SettingsPageView } from "./page";

const decision = {
  status: "authorized" as const,
  nextAction: "continue" as const,
  adminIdentity: { githubLogin: "ho", githubUserId: "123", sourcePath: "content/site.json" },
  session: { githubLogin: "ho", githubUserId: "123", expiresAt: "2099-01-01T00:00:00.000Z" },
};

describe("SettingsPageView", () => {
  it("renders readiness state and active settings navigation", () => {
    render(
      createElement(SettingsPageView, {
        decision,
        siteConfig: normalizeSiteConfig({
          siteName: "Ho's Blog",
          siteUrl: "https://blog.hozorica.com",
          adminGithubLogin: "choihooo",
          adminGithubUserId: "67588757",
          github: { owner: "choihooo", repo: "blog-platform", branch: "main" },
          analytics: { provider: "ga4", ga4PropertyId: "replace-me" },
        }),
        taxonomy: {
          categories: [
            {
              id: "cat_engineering",
              name: "Engineering",
              slug: "engineering",
              parentId: null,
              parentSlug: null,
              depth: 1,
              postCount: 6,
              createdAt: "2026-07-31T00:00:00.000Z",
            },
            {
              id: "cat_engineering_fe",
              name: "FE",
              slug: "engineering/fe",
              parentId: "cat_engineering",
              parentSlug: "engineering",
              depth: 2,
              postCount: 4,
              createdAt: "2026-07-31T00:00:00.000Z",
            },
          ],
          tags: [],
        },
      }),
    );
    expect(screen.getByRole("heading", { level: 2, name: "사이트 설정" })).toBeTruthy();
    expect(screen.getByText("Ho's Blog")).toBeTruthy();
    expect(screen.getByText("choihooo/blog-platform")).toBeTruthy();
    expect(screen.getAllByText("Engineering").length).toBeGreaterThan(0);
    expect(screen.getByText("FE")).toBeTruthy();
    expect(screen.getByText("engineering")).toBeTruthy();
    expect(screen.getByText("fe")).toBeTruthy();
    expect(screen.getByText("상위: engineering")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Add child" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Engineering 접기" }));
    expect(screen.queryByText("상위: engineering")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Engineering 펼치기" }));
    expect(screen.getByText("상위: engineering")).toBeTruthy();
    expect(screen.getByRole("button", { name: "FE 삭제" })).toHaveProperty("disabled", false);
    expect(screen.getByRole("link", { name: /Settings/ }).getAttribute("aria-current")).toBe(
      "page",
    );
    fireEvent.click(screen.getByRole("button", { name: "FE 수정" }));
    expect(screen.getByRole("heading", { name: "카테고리 수정" })).toBeTruthy();
    expect(screen.getByDisplayValue("FE")).toBeTruthy();
    expect(screen.getByDisplayValue("fe")).toBeTruthy();
  });
});
