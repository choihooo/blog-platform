"use client";

import { useRef, useState, useTransition } from "react";
import { Image } from "lucide-react";

import { Button, Input } from "@blog-platform/design-system";

import { uploadEditorMediaAction } from "../../app/actions/editor-actions";
import type { UploadEditorMediaResult } from "../../lib/editor";
import { MediaUploadStatus } from "./media-upload-status";

type Props = {
  postSlug: string;
  onUploaded: (result: Extract<UploadEditorMediaResult, { ok: true }>) => void;
};

export function MediaUploadControl({ postSlug, onUploaded }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [alt, setAlt] = useState("");
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [result, setResult] = useState<UploadEditorMediaResult>();
  const [isPending, startTransition] = useTransition();

  function upload(file: File) {
    const formData = new FormData();
    formData.set("target", "body");
    formData.set("postSlug", postSlug);
    formData.set("file", file);
    formData.set("alt", alt);
    formData.set("title", title);
    formData.set("caption", caption);
    startTransition(() => {
      void uploadEditorMediaAction(formData).then((next) => {
        setResult(next);
        if (next.ok) {
          onUploaded(next);
          setDetailsOpen(false);
        }
      });
    });
  }

  return (
    <div className="flex items-center gap-1">
      <Button
        aria-label="Upload image"
        disabled={isPending}
        onClick={() => setDetailsOpen((value) => !value)}
        size="icon"
        type="button"
        variant="ghost"
      >
        <Image className="h-4 w-4" />
      </Button>
      {detailsOpen ? (
        <div className="flex flex-wrap items-center gap-1">
          <Input
            aria-label="Image alt text"
            className="h-8 w-32"
            onChange={(event) => setAlt(event.currentTarget.value)}
            placeholder="Alt"
            value={alt}
          />
          <Input
            aria-label="Image title"
            className="h-8 w-32"
            onChange={(event) => setTitle(event.currentTarget.value)}
            placeholder="Title"
            value={title}
          />
          <Input
            aria-label="Image caption"
            className="h-8 w-32"
            onChange={(event) => setCaption(event.currentTarget.value)}
            placeholder="Caption"
            value={caption}
          />
          <input
            ref={inputRef}
            accept="image/webp,image/png,image/jpeg"
            aria-label="Image file"
            className="sr-only"
            onChange={(event) => {
              const file = event.currentTarget.files?.[0];
              if (file) upload(file);
              event.currentTarget.value = "";
            }}
            type="file"
          />
          <Button disabled={isPending} onClick={() => inputRef.current?.click()} type="button">
            Choose
          </Button>
          <MediaUploadStatus pending={isPending} result={result} />
        </div>
      ) : null}
    </div>
  );
}
