"use client";

import { useRef, useState, useTransition } from "react";
import type { EditorFrontmatter } from "@blog-platform/editor";
import { Button, Input } from "@blog-platform/design-system";

import { uploadEditorMediaAction } from "../../app/actions/editor-actions";
import type { UploadEditorMediaResult } from "../../lib/editor";
import { MediaUploadStatus } from "./media-upload-status";

type Props = {
  categories?: CategoryOption[];
  frontmatter: EditorFrontmatter;
  onChange?: (frontmatter: EditorFrontmatter) => void;
  postSlug: string;
};

export type CategoryOption = {
  slug: string;
  name: string;
  depth: 1 | 2;
  parentSlug?: string | null;
};

export function FrontmatterPanel({ categories = [], frontmatter, onChange, postSlug }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [result, setResult] = useState<UploadEditorMediaResult>();
  const [isPending, startTransition] = useTransition();
  const normalizedPostSlug = frontmatter.slug ?? "";
  const update = (key: keyof EditorFrontmatter, value: string) =>
    onChange?.({ ...frontmatter, [key]: value });
  const updateTags = (value: string) =>
    onChange?.({
      ...frontmatter,
      tags: value
        .split(",")
        .map((tag) => tag.trim().toLowerCase())
        .filter(Boolean),
    });
  const normalizeSlug = (value: string) =>
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  const isSlugMutated = Boolean(frontmatter.slug && frontmatter.slug !== postSlug);
  const parentCategories = categories.filter((category) => category.depth === 1);
  const childCategories = categories.filter((category) => category.depth === 2);
  const selectedCategory = frontmatter.category ?? "";
  const selectedParent = selectedCategory.includes("/")
    ? (selectedCategory.split("/")[0] ?? "")
    : selectedCategory;
  const selectedChild = selectedCategory.includes("/") ? selectedCategory : "";
  const selectedChildOptions = childCategories.filter(
    (category) => category.parentSlug === selectedParent,
  );

  function updateParentCategory(parentSlug: string) {
    const firstChild = childCategories.find((category) => category.parentSlug === parentSlug);
    update("category", firstChild?.slug ?? parentSlug);
  }

  function updateChildCategory(childSlug: string) {
    update("category", childSlug || selectedParent);
  }

  function upload(file: File) {
    const formData = new FormData();
    formData.set("target", "cover");
    formData.set("postSlug", postSlug);
    formData.set("file", file);
    startTransition(() => {
      void uploadEditorMediaAction(formData).then((next) => {
        setResult(next);
        if (next.ok && next.reference.target === "cover") {
          update("coverImage", next.reference.coverImage);
        }
      });
    });
  }

  return (
    <aside className="space-y-4 border-l border-border p-4">
      <div>
        <label className="text-xs font-medium text-muted-foreground" htmlFor="editor-title">
          Title
        </label>
        <Input
          id="editor-title"
          value={frontmatter.title}
          onChange={(event) => update("title", event.currentTarget.value)}
        />
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground" htmlFor="editor-excerpt">
          Excerpt
        </label>
        <Input
          id="editor-excerpt"
          value={frontmatter.excerpt ?? ""}
          onChange={(event) => update("excerpt", event.currentTarget.value)}
        />
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground" htmlFor="editor-slug">
          Slug
        </label>
        <Input
          id="editor-slug"
          value={normalizedPostSlug}
          onChange={(event) => update("slug", normalizeSlug(event.currentTarget.value))}
          placeholder="created on save"
        />
        {isSlugMutated ? (
          <p className="mt-1 text-xs text-muted-foreground">
            변경한 slug는 저장/발행 시 새 파일명으로 이동됩니다.
          </p>
        ) : null}
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground" htmlFor="editor-category-1">
          1차 카테고리
        </label>
        <select
          className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
          id="editor-category-1"
          onChange={(event) => updateParentCategory(event.currentTarget.value)}
          value={selectedParent}
        >
          <option value="">카테고리 없음</option>
          {parentCategories.map((category) => (
            <option key={category.slug} value={category.slug}>
              {category.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground" htmlFor="editor-category-2">
          2차 카테고리
        </label>
        <select
          className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!selectedParent || selectedChildOptions.length === 0}
          id="editor-category-2"
          onChange={(event) => updateChildCategory(event.currentTarget.value)}
          value={selectedChild}
        >
          <option value="">선택 안 함</option>
          {selectedChildOptions.map((category) => (
            <option key={category.slug} value={category.slug}>
              {category.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground" htmlFor="editor-tags">
          Tags
        </label>
        <Input
          id="editor-tags"
          value={(frontmatter.tags ?? []).join(", ")}
          onChange={(event) => updateTags(event.currentTarget.value)}
          placeholder="blog, mdx"
        />
      </div>
      <dl className="space-y-2 text-sm">
        <div>
          <dt className="text-muted-foreground">Status</dt>
          <dd>{frontmatter.status}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Cover</dt>
          <dd className="mt-2">
            {frontmatter.coverImage ? (
              <img
                alt={`${frontmatter.title || "Post"} cover`}
                className="aspect-video w-full rounded-md border border-border object-cover"
                src={frontmatter.coverImage}
              />
            ) : (
              <span>none</span>
            )}
          </dd>
        </div>
      </dl>
      <div className="space-y-2">
        <input
          ref={inputRef}
          accept="image/webp,image/png,image/jpeg"
          aria-label="Cover image file"
          className="sr-only"
          onChange={(event) => {
            const file = event.currentTarget.files?.[0];
            if (file) upload(file);
            event.currentTarget.value = "";
          }}
          type="file"
        />
        <Button disabled={isPending} onClick={() => inputRef.current?.click()} type="button">
          Upload cover
        </Button>
        <MediaUploadStatus pending={isPending} result={result} />
      </div>
    </aside>
  );
}
