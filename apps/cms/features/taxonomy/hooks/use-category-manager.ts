"use client";
import type { ComboboxOption } from "@hozui/react";
import { useState } from "react";
import type { CategoryDialogState, CategoryGroup } from "../model/contracts";
export function useCategoryManager(groups: CategoryGroup[]) {
  const [dialog, setDialog] = useState<CategoryDialogState>(null);
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set());
  const [showChildren, setShowChildren] = useState(true);
  const parentCategories = groups.map(({ parent }) => parent);
  const parentOptions: ComboboxOption[] = parentCategories.map((parent) => ({
    value: parent.slug,
    label: parent.name,
    description: parent.slug,
  }));

  function toggleCategory(categoryId: string) {
    setCollapsed((current) => {
      const next = new Set(current);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  }

  return {
    dialog,
    setDialog,
    collapsed,
    showChildren,
    setShowChildren,
    parentCategories,
    parentOptions,
    toggleCategory,
  };
}
