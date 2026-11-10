import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { CategoryManager } from "./category-manager";
it("keeps separate collapse state and prevents deleting a parent with children", () => {
  const parent = {
    id: "p",
    slug: "dev",
    name: "Dev",
    depth: 1 as const,
    parentId: null,
    createdAt: "2026-11-09",
  };
  const other = { ...parent, id: "p2", slug: "other", name: "Other" };
  const child = {
    ...parent,
    id: "c",
    slug: "dev/js",
    name: "JS",
    depth: 2 as const,
    parentId: "p",
    parentSlug: "dev",
  };
  const remove = vi.fn();
  render(
    <CategoryManager
      groups={[
        { parent, children: [child] },
        { parent: other, children: [] },
      ]}
      commands={{ create: vi.fn(), update: vi.fn(), delete: remove }}
    />,
  );
  expect(screen.getByLabelText("Dev 삭제").getAttribute("title")).toBe(
    "하위 카테고리를 먼저 삭제해야 합니다.",
  );
  expect(remove).not.toHaveBeenCalled();
  fireEvent.click(screen.getByLabelText("Dev 접기"));
  expect(screen.queryByText("JS")).toBeNull();
  expect(screen.getByText("Other")).toBeTruthy();
  fireEvent.click(screen.getByLabelText("Dev 펼치기"));
  expect(screen.getByText("JS")).toBeTruthy();
  fireEvent.click(screen.getByLabelText("Dev 삭제"));
  expect((screen.getByRole("button", { name: "삭제" }) as HTMLButtonElement).disabled).toBe(true);
  expect(remove).not.toHaveBeenCalled();
});
