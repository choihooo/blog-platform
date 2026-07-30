import { render, screen } from "@testing-library/react";
import { createElement } from "react";
import { describe, expect, it } from "vitest";

import { LoginPageView } from "./page";

describe("LoginPageView", () => {
  it("renders sign-in state", () => {
    render(createElement(LoginPageView));
    expect(screen.getByRole("heading", { name: "GitHub Login" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "GitHub로 로그인" }).getAttribute("href")).toBe(
      "/api/auth/signin/github",
    );
  });

  it("renders denied state", () => {
    render(createElement(LoginPageView, { state: "denied" }));
    expect(screen.getByText(/일치하지 않습니다/)).toBeTruthy();
  });

  it("renders setup-error state", () => {
    render(createElement(LoginPageView, { state: "setup-error" }));
    expect(screen.getByText(/관리자 설정/)).toBeTruthy();
  });
});
