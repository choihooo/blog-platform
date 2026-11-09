import type { CategoryRecord, TagRecord } from "@blog-platform/core/content";
export type CategoryWithCount = CategoryRecord & { postCount?: number };

export type CategoryGroup = {
  parent: CategoryWithCount;
  children: CategoryWithCount[];
};

export type CategoryDialogState =
  | { mode: "edit"; category: CategoryWithCount }
  | { mode: "delete"; category: CategoryWithCount; childCount: number }
  | null;

export type TaxonomyData = { categories: CategoryWithCount[]; tags: TagRecord[] };
export type TaxonomyCommands = {
  create(formData: FormData): Promise<void>;
  update(formData: FormData): Promise<void>;
  delete(formData: FormData): Promise<void>;
};
