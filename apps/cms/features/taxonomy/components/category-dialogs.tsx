"use client";

import { Button, Combobox, type ComboboxOption } from "@hozui/react";

import { CmsTextField } from "../../../shared/ui/text-field";

import { childSlugFor, deleteBlockReason, parentSlugFor } from "../model/category-tree";
import type { CategoryWithCount } from "../model/contracts";
import { CategorySubmitButton } from "./category-submit-button";
export function EditCategoryDialog({
  category,
  command,
  onDone,
  parentOptions,
}: {
  command: (formData: FormData) => Promise<void>;
  category: CategoryWithCount;
  onDone: () => void;
  parentOptions: ComboboxOption[];
}) {
  const isChild = category.depth === 2;

  return (
    <>
      <form action={command} className="grid gap-4" onSubmit={onDone}>
        <input name="categoryId" type="hidden" value={category.id} />
        <input name="depth" type="hidden" value={category.depth} />
        <label className="grid gap-1 text-xs font-medium text-muted-foreground">
          이름
          <CmsTextField defaultValue={category.name} label="이름" name="name" />
        </label>
        {isChild ? (
          <>
            <label className="grid gap-1 text-xs font-medium text-muted-foreground">
              상위 카테고리
              <Combobox
                ariaLabel="상위 카테고리"
                defaultValue={parentSlugFor(category)}
                name="parentSlug"
                options={parentOptions}
                placeholder="상위 카테고리"
                portal={false}
              />
            </label>
            <label className="grid gap-1 text-xs font-medium text-muted-foreground">
              Slug
              <CmsTextField defaultValue={childSlugFor(category)} label="Slug" name="childSlug" />
            </label>
          </>
        ) : (
          <label className="grid gap-1 text-xs font-medium text-muted-foreground">
            Slug
            <CmsTextField defaultValue={category.slug} label="Slug" name="slug" />
          </label>
        )}
        <div className="flex justify-end gap-2 pt-2">
          <Button label="취소" onClick={onDone} type="button" variant="secondary" />
          <CategorySubmitButton label="저장" />
        </div>
      </form>
    </>
  );
}

export function DeleteCategoryDialog({
  category,
  command,
  childCount,
  onDone,
}: {
  command: (formData: FormData) => Promise<void>;
  category: CategoryWithCount;
  childCount: number;
  onDone: () => void;
}) {
  const reason = deleteBlockReason({ category, childCount });

  return (
    <>
      <div className="rounded-md border border-border bg-muted/40 p-3 text-sm">
        <div className="font-semibold">{category.name}</div>
        <code className="mt-1 block text-xs text-muted-foreground">{category.slug}</code>
        <div className="mt-2 text-xs text-muted-foreground">
          글 {category.postCount ?? 0}개 · 하위 {childCount}개
        </div>
      </div>
      {reason ? <p className="text-sm text-muted-foreground">{reason}</p> : null}
      <form action={command} className="flex justify-end gap-2" onSubmit={onDone}>
        <input name="categoryId" type="hidden" value={category.id} />
        <input name="slug" type="hidden" value={category.slug} />
        <Button label="취소" onClick={onDone} type="button" variant="secondary" />
        <CategorySubmitButton disabled={Boolean(reason)} label="삭제" variant="danger" />
      </form>
    </>
  );
}
