"use client";

import {
  Badge,
  Combobox,
  EmptyState,
  Modal,
  ModalBody,
  ModalContent,
  ModalDescription,
  ModalHeader,
  ModalOverlay,
  ModalPortal,
  ModalTitle,
  ModalTitleStack,
  Switch,
} from "@hozui/react";
import { FolderTree } from "lucide-react";

import { CmsTextField } from "../../../shared/ui/text-field";

import { useCategoryManager } from "../hooks/use-category-manager";
import type { CategoryGroup, TaxonomyCommands } from "../model/contracts";
import { DeleteCategoryDialog, EditCategoryDialog } from "./category-dialogs";
import { CategoryRow } from "./category-row";
import { CategorySubmitButton } from "./category-submit-button";
export function CategoryManager({
  groups,
  commands,
}: {
  groups: CategoryGroup[];
  commands: TaxonomyCommands;
}) {
  const {
    dialog,
    setDialog,
    collapsed,
    showChildren,
    setShowChildren,
    parentCategories,
    parentOptions,
    toggleCategory,
  } = useCategoryManager(groups);

  return (
    <div className="rounded-lg border border-border bg-card p-4 sm:p-5 lg:col-span-2">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <FolderTree aria-hidden="true" size={17} />
          Categories
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Switch
            checked={showChildren}
            label="하위 표시"
            onCheckedChange={setShowChildren}
            size="sm"
          />
          <Badge label={`${parentCategories.length} parents`} tone="neutral" variant="weak" />
        </div>
      </div>

      <div className="mt-5 grid gap-3 border-b border-border pb-5 lg:grid-cols-2">
        <form action={commands.create} className="grid gap-3">
          <p className="text-xs font-semibold text-muted-foreground">1차 카테고리 추가</p>
          <div className="grid gap-2 sm:grid-cols-2">
            <CmsTextField label="이름" name="name" placeholder="이름" />
            <CmsTextField label="slug" name="slug" placeholder="slug" />
          </div>
          <CategorySubmitButton label="Add parent" />
        </form>
        <form action={commands.create} className="grid gap-3">
          <p className="text-xs font-semibold text-muted-foreground">2차 카테고리 추가</p>
          <div className="grid gap-2 sm:grid-cols-3">
            <Combobox
              ariaLabel="상위 카테고리"
              emptyMessage="상위 카테고리가 없습니다."
              label="상위"
              name="parentSlug"
              options={parentOptions}
              placeholder="상위"
              portal={false}
            />
            <CmsTextField label="이름" name="name" placeholder="이름" />
            <CmsTextField label="child slug" name="childSlug" placeholder="child-slug" />
          </div>
          <CategorySubmitButton label="Add child" />
        </form>
      </div>

      <div className="mt-5 overflow-hidden rounded-md border border-border">
        <div className="hidden grid-cols-[minmax(0,1fr)_8rem_5rem_7.5rem] items-center border-b border-border bg-muted/60 px-4 py-2 text-xs font-semibold text-muted-foreground lg:grid">
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
              {!showChildren || collapsed.has(parent.id)
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
                  command={commands.update}
                  category={dialog.category}
                  parentOptions={parentOptions}
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
                  command={commands.delete}
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
