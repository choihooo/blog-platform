import type { CategoryWithCount } from "./contracts";
export function childSlugFor(category: CategoryWithCount) {
  return category.slug.split("/").at(-1) ?? category.slug;
}

export function parentSlugFor(category: CategoryWithCount) {
  return category.parentSlug ?? category.slug.split("/")[0] ?? "";
}

export function deleteBlockReason(input: { category: CategoryWithCount; childCount: number }) {
  if (input.childCount > 0) return "하위 카테고리를 먼저 삭제해야 합니다.";
  if ((input.category.postCount ?? 0) > 0) return "연결된 글이 있어서 삭제할 수 없습니다.";
  return undefined;
}

export function categoryTree(categories: CategoryWithCount[]) {
  const parents = categories
    .filter((category) => category.depth === 1)
    .sort((a, b) => a.slug.localeCompare(b.slug));
  const children = categories
    .filter((category) => category.depth === 2)
    .sort((a, b) => a.slug.localeCompare(b.slug));
  return parents.map((parent) => ({
    parent,
    children: children.filter((child) => child.parentSlug === parent.slug),
  }));
}
