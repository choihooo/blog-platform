"use client";

import { useState } from "react";
import {
  Badge,
  Button,
  EmptyState,
  IconButton,
  Modal,
  ModalBody,
  ModalContent,
  ModalDescription,
  ModalHeader,
  ModalOverlay,
  ModalPortal,
  ModalTitle,
  ModalTitleStack,
} from "@hozui/react";
import { ChevronDown, Edit3, FolderTree, Trash2 } from "lucide-react";

import {
  createCategoryAction,
  deleteCategoryAction,
  updateCategoryAction,
} from "../../app/actions/taxonomy-actions";
import type { CategoryRecord } from "../../lib/content-adapter/content-adapter.interface";
import { CmsTextField } from "../ui/text-field";

type CategoryWithCount = CategoryRecord & { postCount?: number };

type CategoryGroup = {
  parent: CategoryWithCount;
  children: CategoryWithCount[];
};

type CategoryDialogState =
  | { mode: "edit"; category: CategoryWithCount }
  | { mode: "delete"; category: CategoryWithCount; childCount: number }
  | null;

function childSlugFor(category: CategoryWithCount) {
  return category.slug.split("/").at(-1) ?? category.slug;
}

function parentSlugFor(category: CategoryWithCount) {
  return category.parentSlug ?? category.slug.split("/")[0] ?? "";
}

function deleteBlockReason(input: { category: CategoryWithCount; childCount: number }) {
  if (input.childCount > 0) return "하위 카테고리를 먼저 삭제해야 합니다.";
  if ((input.category.postCount ?? 0) > 0) return "연결된 글이 있어서 삭제할 수 없습니다.";
  return undefined;
}

export function CategoryManager({ groups }: { groups: CategoryGroup[] }) {
  const [dialog, setDialog] = useState<CategoryDialogState>(null);
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set());
  const parentCategories = groups.map(({ parent }) => parent);

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

  return (
    <div className="rounded-lg border border-border bg-card p-5 lg:col-span-2">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <FolderTree aria-hidden="true" size={17} />
          Categories
        </div>
        <Badge label={`${parentCategories.length} parents`} tone="neutral" variant="weak" />
      </div>

      <div className="mt-5 grid gap-3 border-b border-border pb-5 lg:grid-cols-2">
        <form action={createCategoryAction} className="grid gap-3">
          <p className="text-xs font-semibold text-muted-foreground">1차 카테고리 추가</p>
          <div className="grid gap-2 sm:grid-cols-2">
            <CmsTextField label="이름" name="name" placeholder="이름" />
            <CmsTextField label="slug" name="slug" placeholder="slug" />
          </div>
          <Button className="w-fit" label="Add parent" type="submit" />
        </form>
        <form action={createCategoryAction} className="grid gap-3">
          <p className="text-xs font-semibold text-muted-foreground">2차 카테고리 추가</p>
          <div className="grid gap-2 sm:grid-cols-3">
            <select
              className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
              name="parentSlug"
            >
              <option value="">상위</option>
              {parentCategories.map((parent) => (
                <option key={parent.slug} value={parent.slug}>
                  {parent.name}
                </option>
              ))}
            </select>
            <CmsTextField label="이름" name="name" placeholder="이름" />
            <CmsTextField label="child slug" name="childSlug" placeholder="child-slug" />
          </div>
          <Button className="w-fit" label="Add child" type="submit" />
        </form>
      </div>

      <div className="mt-5 overflow-hidden rounded-md border border-border">
        <div className="grid grid-cols-[minmax(0,1fr)_8rem_5rem_7.5rem] items-center border-b border-border bg-muted/60 px-4 py-2 text-xs font-semibold text-muted-foreground">
          <span>카테고리</span>
          <span>Slug</span>
          <span className="text-right">글</span>
          <span className="text-right">작업</span>
        </div>

        {groups.length > 0 ? (
          groups.map(({ parent, children }) => (
            <div key={parent.id}>
              <CategoryRow
                category={parent}
                childCount={children.length}
                collapsed={collapsed.has(parent.id)}
                level={1}
                onDelete={(category) =>
                  setDialog({ mode: "delete", category, childCount: children.length })
                }
                onEdit={(category) => setDialog({ mode: "edit", category })}
                onToggle={() => toggleCategory(parent.id)}
              />
              {collapsed.has(parent.id)
                ? null
                : children.map((child) => (
                    <CategoryRow
                      category={child}
                      childCount={0}
                      key={child.id}
                      level={2}
                      onDelete={(category) =>
                        setDialog({ mode: "delete", category, childCount: 0 })
                      }
                      onEdit={(category) => setDialog({ mode: "edit", category })}
                    />
                  ))}
            </div>
          ))
        ) : (
          <EmptyState
            className="px-3 py-8"
            density="compact"
            description="Add parent and child categories to organize published posts."
            title="No categories yet."
          />
        )}
      </div>

      <Modal open={dialog?.mode === "edit"} onOpenChange={(open) => !open && setDialog(null)}>
        <ModalPortal>
          <ModalOverlay />
          <ModalContent variant="form">
            <ModalHeader>
              <ModalTitleStack>
                <ModalTitle>카테고리 수정</ModalTitle>
                <ModalDescription>이름, slug, 상위 카테고리를 한 번에 수정합니다.</ModalDescription>
              </ModalTitleStack>
            </ModalHeader>
            <ModalBody>
              {dialog?.mode === "edit" ? (
                <EditCategoryDialog
                  category={dialog.category}
                  parentCategories={parentCategories}
                  onDone={() => setDialog(null)}
                />
              ) : null}
            </ModalBody>
          </ModalContent>
        </ModalPortal>
      </Modal>

      <Modal open={dialog?.mode === "delete"} onOpenChange={(open) => !open && setDialog(null)}>
        <ModalPortal>
          <ModalOverlay />
          <ModalContent variant="destructive">
            <ModalHeader>
              <ModalTitleStack>
                <ModalTitle>카테고리 삭제</ModalTitle>
                <ModalDescription>
                  삭제한 카테고리는 되돌릴 수 없습니다. 연결된 글이나 하위 카테고리가 있으면 삭제할
                  수 없습니다.
                </ModalDescription>
              </ModalTitleStack>
            </ModalHeader>
            <ModalBody>
              {dialog?.mode === "delete" ? (
                <DeleteCategoryDialog
                  category={dialog.category}
                  childCount={dialog.childCount}
                  onDone={() => setDialog(null)}
                />
              ) : null}
            </ModalBody>
          </ModalContent>
        </ModalPortal>
      </Modal>
    </div>
  );
}

function CategoryRow({
  category,
  childCount,
  collapsed = false,
  level,
  onDelete,
  onEdit,
  onToggle,
}: {
  category: CategoryWithCount;
  childCount: number;
  collapsed?: boolean;
  level: 1 | 2;
  onDelete: (category: CategoryWithCount) => void;
  onEdit: (category: CategoryWithCount) => void;
  onToggle?: () => void;
}) {
  const isChild = level === 2;
  const displaySlug = isChild ? childSlugFor(category) : category.slug;
  const deleteReason = deleteBlockReason({ category, childCount });

  return (
    <div
      className={[
        "grid min-h-16 grid-cols-[minmax(0,1fr)_8rem_5rem_7.5rem] items-center border-b border-border px-4 py-2 text-sm last:border-b-0",
        isChild ? "bg-muted/20" : "bg-card",
      ].join(" ")}
    >
      <div className="flex min-w-0 items-center gap-2">
        <span
          className={[
            "flex h-8 shrink-0 items-center justify-center text-muted-foreground",
            isChild ? "ml-8 w-5 border-l border-border" : "w-5",
          ].join(" ")}
        >
          {isChild ? <span className="h-px w-3 bg-border" /> : null}
        </span>
        {!isChild && childCount > 0 ? (
          <IconButton
            aria-label={`${category.name} ${collapsed ? "펼치기" : "접기"}`}
            className="h-7 w-7 shrink-0"
            icon={
              <ChevronDown
                aria-hidden="true"
                className={collapsed ? "-rotate-90 transition-transform" : "transition-transform"}
                size={15}
              />
            }
            onClick={onToggle}
            size="sm"
            type="button"
            variant="ghost"
          />
        ) : (
          <span className="h-7 w-7 shrink-0" />
        )}
        <div className="min-w-0">
          <div className={isChild ? "font-medium" : "text-base font-semibold"}>{category.name}</div>
          {isChild ? (
            <div className="mt-0.5 text-xs text-muted-foreground">
              상위: {parentSlugFor(category)}
            </div>
          ) : null}
        </div>
      </div>
      <code className="truncate text-xs text-muted-foreground">{displaySlug}</code>
      <div className="text-right">
        <Badge
          label={String(category.postCount ?? 0)}
          tone="neutral"
          variant={(category.postCount ?? 0) > 0 ? "weak" : "outline"}
        />
      </div>
      <div className="flex justify-end gap-1">
        <IconButton
          aria-label={`${category.name} 수정`}
          icon={<Edit3 aria-hidden="true" size={15} />}
          onClick={() => onEdit(category)}
          size="sm"
          type="button"
          variant="ghost"
        />
        <IconButton
          aria-label={`${category.name} 삭제`}
          icon={<Trash2 aria-hidden="true" size={15} />}
          onClick={() => onDelete(category)}
          size="sm"
          title={deleteReason}
          type="button"
          variant="ghost"
        />
      </div>
    </div>
  );
}

function EditCategoryDialog({
  category,
  onDone,
  parentCategories,
}: {
  category: CategoryWithCount;
  onDone: () => void;
  parentCategories: CategoryWithCount[];
}) {
  const isChild = category.depth === 2;

  return (
    <>
      <form action={updateCategoryAction} className="grid gap-4" onSubmit={onDone}>
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
              <select
                className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                defaultValue={parentSlugFor(category)}
                name="parentSlug"
              >
                {parentCategories.map((parent) => (
                  <option key={parent.slug} value={parent.slug}>
                    {parent.name}
                  </option>
                ))}
              </select>
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
          <Button label="저장" type="submit" />
        </div>
      </form>
    </>
  );
}

function DeleteCategoryDialog({
  category,
  childCount,
  onDone,
}: {
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
      <form action={deleteCategoryAction} className="flex justify-end gap-2" onSubmit={onDone}>
        <input name="categoryId" type="hidden" value={category.id} />
        <input name="slug" type="hidden" value={category.slug} />
        <Button label="취소" onClick={onDone} type="button" variant="secondary" />
        <Button disabled={Boolean(reason)} label="삭제" type="submit" variant="danger" />
      </form>
    </>
  );
}
