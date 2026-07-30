import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { FrontmatterPanel } from "./frontmatter-panel";

vi.mock("../../app/actions/editor-actions", () => ({
  uploadEditorMediaAction: vi.fn(),
}));

describe("FrontmatterPanel media upload", () => {
  it("renders existing cover and cover upload control", () => {
    render(
      <FrontmatterPanel
        frontmatter={{
          title: "Hello",
          status: "draft",
          coverImage: "/media/covers/hello-a.webp",
        }}
        postSlug="hello"
      />,
    );
    expect(screen.getByText("/media/covers/hello-a.webp")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Upload cover" })).toBeTruthy();
  });
});
