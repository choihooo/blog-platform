"use client";

import { useRef, useState, useTransition } from "react";
import { Image } from "lucide-react";

import { Button, IconButton, TextField, Tooltip } from "@hozui/react";

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
      <Tooltip content="Upload image">
        <IconButton
          aria-label="Upload image"
          disabled={isPending}
          icon={<Image aria-hidden="true" size={16} />}
          onClick={() => setDetailsOpen((value) => !value)}
          size="sm"
          type="button"
          variant="ghost"
        />
      </Tooltip>
      {detailsOpen ? (
        <div className="flex flex-wrap items-center gap-1">
          <TextField
            aria-label="Image alt text"
            className="h-8 w-32"
            label="Alt"
            onChange={(event) => setAlt(event.currentTarget.value)}
            onValueChange={setAlt}
            placeholder="Alt"
            value={alt}
          />
          <TextField
            aria-label="Image title"
            className="h-8 w-32"
            label="Title"
            onChange={(event) => setTitle(event.currentTarget.value)}
            onValueChange={setTitle}
            placeholder="Title"
            value={title}
          />
          <TextField
            aria-label="Image caption"
            className="h-8 w-32"
            label="Caption"
            onChange={(event) => setCaption(event.currentTarget.value)}
            onValueChange={setCaption}
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
          <Button
            disabled={isPending}
            label="Choose"
            onClick={() => inputRef.current?.click()}
            type="button"
          />
          <MediaUploadStatus pending={isPending} result={result} />
        </div>
      ) : null}
    </div>
  );
}
