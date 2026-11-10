"use client";

import { Badge, IconButton } from "@hozui/react";
import { ChevronDown, Edit3, Trash2 } from "lucide-react";

import { childSlugFor, deleteBlockReason, parentSlugFor } from "../model/category-tree";
import type { CategoryWithCount } from "../model/contracts";
export function CategoryRow({
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
        "grid min-h-16 grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-2 border-b border-border px-3 py-3 text-sm last:border-b-0 lg:grid-cols-[minmax(0,1fr)_8rem_5rem_7.5rem] lg:items-center lg:gap-x-0 lg:gap-y-0 lg:px-4 lg:py-2",
        isChild ? "bg-muted/20" : "bg-card",
      ].join(" ")}
    >
      <div className="flex min-w-0 items-center gap-2">
        <span
          className={[
            "flex h-8 shrink-0 items-center justify-center text-muted-foreground",
            isChild ? "ml-2 w-5 border-l border-border sm:ml-5 lg:ml-8" : "w-5",
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
      <code className="col-start-1 row-start-2 truncate pl-10 text-xs text-muted-foreground sm:pl-13 lg:col-auto lg:row-auto lg:pl-0">
        {displaySlug}
      </code>
      <div className="col-start-2 row-start-2 text-right lg:col-auto lg:row-auto">
        <Badge
          label={String(category.postCount ?? 0)}
          tone="neutral"
          variant={(category.postCount ?? 0) > 0 ? "weak" : "outline"}
        />
      </div>
      <div className="col-start-2 row-start-1 flex justify-end gap-1 lg:col-auto lg:row-auto">
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
