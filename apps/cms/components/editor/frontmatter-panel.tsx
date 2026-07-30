"use client";

import { useRef, useState, useTransition } from "react";
import type { EditorFrontmatter } from "@blog-platform/editor";
import { Button, Input } from "@blog-platform/design-system";

import { uploadEditorMediaAction } from "../../app/actions/editor-actions";
import type { UploadEditorMediaResult } from "../../lib/editor";
import { MediaUploadStatus } from "./media-upload-status";

type Props = {
  frontmatter: EditorFrontmatter;
  onChange?: (frontmatter: EditorFrontmatter) => void;
  postSlug: string;
};

export function FrontmatterPanel({ frontmatter, onChange, postSlug }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [result, setResult] = useState<UploadEditorMediaResult>();
  const [isPending, startTransition] = useTransition();
  const normalizedPostSlug = frontmatter.slug ?? "";
  const update = (key: keyof EditorFrontmatter, value: string) =>
    onChange?.({ ...frontmatter, [key]: value });
  const normalizeSlug = (value: string) =>
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  const isSlugMutated = Boolean(frontmatter.slug && frontmatter.slug !== postSlug);

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
      <dl className="space-y-2 text-sm">
        <div>
          <dt className="text-muted-foreground">Status</dt>
          <dd>{frontmatter.status}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Cover</dt>
          <dd>{frontmatter.coverImage ?? "none"}</dd>
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
