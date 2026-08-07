"use client";

import { useRef, useState, useTransition } from "react";
import type { EditorFrontmatter } from "@blog-platform/editor";
import { Button, Combobox, type ComboboxOption } from "@hozui/react";

import { uploadEditorMediaAction } from "../../app/actions/editor-actions";
import { CmsTextField } from "../ui/text-field";
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
  const parentOptions: ComboboxOption[] = [
    { value: "", label: "카테고리 없음" },
    ...parentCategories.map((category) => ({
      value: category.slug,
      label: category.name,
      description: category.slug,
    })),
  ];
  const childOptions: ComboboxOption[] = [
    { value: "", label: "선택 안 함" },
    ...selectedChildOptions.map((category) => ({
      value: category.slug,
      label: category.name,
      description: category.slug,
    })),
  ];

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
        <CmsTextField
          id="editor-title"
          label="Title"
          value={frontmatter.title}
          onChange={(event) => update("title", event.currentTarget.value)}
          onValueChange={(value) => update("title", value)}
        />
      </div>
      <div>
        <CmsTextField
          id="editor-excerpt"
          label="Excerpt"
          value={frontmatter.excerpt ?? ""}
          onChange={(event) => update("excerpt", event.currentTarget.value)}
          onValueChange={(value) => update("excerpt", value)}
        />
      </div>
      <div>
        <CmsTextField
          id="editor-slug"
          label="Slug"
          value={normalizedPostSlug}
          onChange={(event) => update("slug", normalizeSlug(event.currentTarget.value))}
          onValueChange={(value) => update("slug", normalizeSlug(value))}
          placeholder="created on save"
        />
        {isSlugMutated ? (
          <p className="mt-1 text-xs text-muted-foreground">
            변경한 slug는 저장/발행 시 새 파일명으로 이동됩니다.
          </p>
        ) : null}
      </div>
      <div>
        <Combobox
          ariaLabel="1차 카테고리"
          clearable
          emptyMessage="일치하는 카테고리가 없습니다."
          label="1차 카테고리"
          onValueChange={(value) => updateParentCategory(String(value))}
          options={parentOptions}
          placeholder="카테고리 없음"
          portal={false}
          value={selectedParent}
        />
      </div>
      <div>
        <Combobox
          ariaLabel="2차 카테고리"
          clearable
          disabled={!selectedParent || selectedChildOptions.length === 0}
          emptyMessage="일치하는 하위 카테고리가 없습니다."
          helperText={
            selectedParent && selectedChildOptions.length === 0
              ? "선택한 1차 카테고리에 하위 카테고리가 없습니다."
              : undefined
          }
          label="2차 카테고리"
          onValueChange={(value) => updateChildCategory(String(value))}
          options={childOptions}
          placeholder="선택 안 함"
          portal={false}
          value={selectedChild}
        />
      </div>
      <div>
        <CmsTextField
          id="editor-tags"
          label="Tags"
          value={(frontmatter.tags ?? []).join(", ")}
          onChange={(event) => updateTags(event.currentTarget.value)}
          onValueChange={updateTags}
          placeholder="blog, nextjs"
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
        <Button
          disabled={isPending}
          label="Upload cover"
          onClick={() => inputRef.current?.click()}
          type="button"
        />
        <MediaUploadStatus pending={isPending} result={result} />
      </div>
    </aside>
  );
}
