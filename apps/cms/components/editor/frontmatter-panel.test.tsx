import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { FrontmatterPanel } from "./frontmatter-panel";

vi.mock("../../app/actions/editor-actions", () => ({
  uploadEditorMediaAction: vi.fn(),
}));

describe("FrontmatterPanel media upload", () => {
  afterEach(() => cleanup());

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

  it("edits parent and child categories through dropdowns", () => {
    const onChange = vi.fn();
    render(
      <FrontmatterPanel
        categories={[
          { slug: "engineering", label: "개발", depth: 1 },
          { slug: "engineering/fe", label: "FE", depth: 2, parentSlug: "engineering" },
        ]}
        frontmatter={{
          title: "Hello",
          status: "draft",
          category: "engineering/fe",
        }}
        onChange={onChange}
        postSlug="hello"
      />,
    );

    const parentSelect = screen.getByLabelText("1차 카테고리");
    const childSelect = screen.getByLabelText("2차 카테고리");
    expect(parentSelect).toHaveProperty("value", "engineering");
    expect(childSelect).toHaveProperty("value", "engineering/fe");
    fireEvent.change(childSelect!, { target: { value: "" } });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ category: "engineering" }));
  });
});
