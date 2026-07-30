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
  const update = (key: keyof EditorFrontmatter, value: string) =>
    onChange?.({ ...frontmatter, [key]: value });

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
      <dl className="space-y-2 text-sm">
        <div>
          <dt className="text-muted-foreground">Status</dt>
          <dd>{frontmatter.status}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Slug</dt>
          <dd>{frontmatter.slug ?? "created on save"}</dd>
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
