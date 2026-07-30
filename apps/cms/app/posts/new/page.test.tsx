import { render, screen } from "@testing-library/react";
import { createElement } from "react";
import { describe, expect, it, vi } from "vitest";

import { NewPostPageView } from "./page";

vi.mock("../../../app/actions/editor-actions", () => ({
  saveEditorDraftAction: vi.fn(),
}));

const decision = {
  status: "authorized" as const,
  nextAction: "continue" as const,
  adminIdentity: { githubLogin: "ho", githubUserId: "123", sourcePath: "content/site.json" },
  session: { githubLogin: "ho", githubUserId: "123", expiresAt: "2099-01-01T00:00:00.000Z" },
};

describe("NewPostPageView", () => {
  it("renders a protected empty draft editor", () => {
    render(createElement(NewPostPageView, { decision }));
    expect(screen.getByRole("heading", { name: "Editor" })).toBeTruthy();
    expect(screen.getByLabelText("Title")).toBeTruthy();
  });
});
