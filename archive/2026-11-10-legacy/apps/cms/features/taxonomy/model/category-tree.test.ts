import { expect, it } from "vitest";
import { categoryTree, deleteBlockReason } from "./category-tree";
it("groups children under the matching parent and blocks deletion with references", () => {
  const parent = {
    id: "p",
    createdAt: "2026-11-09",
    slug: "dev",
    name: "Dev",
    depth: 1 as const,
    parentId: null,
  };
  const child = {
    id: "c",
    createdAt: "2026-11-09",
    slug: "dev/js",
    name: "JS",
    depth: 2 as const,
    parentId: "p",
    parentSlug: "dev",
  };
  expect(categoryTree([child, parent])).toEqual([{ parent, children: [child] }]);
  expect(deleteBlockReason({ category: parent, childCount: 1 })).toBe(
    "하위 카테고리를 먼저 삭제해야 합니다.",
  );
  expect(deleteBlockReason({ category: { ...child, postCount: 1 }, childCount: 0 })).toBe(
    "연결된 글이 있어서 삭제할 수 없습니다.",
  );
  expect(deleteBlockReason({ category: child, childCount: 0 })).toBeUndefined();
});
