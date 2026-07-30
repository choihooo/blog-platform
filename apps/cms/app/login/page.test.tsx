import { render, screen } from "@testing-library/react";
import { createElement } from "react";
import { describe, expect, it, vi } from "vitest";

import { LoginPageView } from "./page";

vi.mock("next-auth/react", () => ({
  signIn: vi.fn(),
}));

describe("LoginPageView", () => {
  it("renders sign-in state", () => {
    render(createElement(LoginPageView));
    expect(screen.getByRole("heading", { name: "GitHub Login" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "GitHub로 로그인" })).toBeTruthy();
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
