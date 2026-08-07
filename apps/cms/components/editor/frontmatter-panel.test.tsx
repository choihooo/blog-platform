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
    expect(screen.getByRole("img", { name: "Hello cover" })).toHaveProperty(
      "src",
      expect.stringContaining("/media/covers/hello-a.webp"),
    );
    expect(screen.getByRole("button", { name: "Upload cover" })).toBeTruthy();
  });

  it("edits parent and child categories through dropdowns", () => {
    const onChange = vi.fn();
    render(
      <FrontmatterPanel
        categories={[
          { slug: "engineering", name: "Engineering", depth: 1 },
          { slug: "engineering/fe", name: "FE", depth: 2, parentSlug: "engineering" },
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

    const parentCombobox = screen.getByLabelText("1차 카테고리");
    const childCombobox = screen.getByLabelText("2차 카테고리");
    expect(parentCombobox).toHaveProperty("value", "Engineering");
    expect(childCombobox).toHaveProperty("value", "FE");
    const childClear = childCombobox
      .closest(".hods-combobox")
      ?.querySelector<HTMLButtonElement>('button[aria-label="선택 지우기"]');
    expect(childClear).toBeTruthy();
    fireEvent.click(childClear!);
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ category: "engineering" }));
  });
});
