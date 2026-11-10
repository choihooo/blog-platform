import type { Editor } from "@tiptap/react";
import {
  Archive,
  Bold,
  Code,
  Eye,
  Heading2,
  Italic,
  Link,
  List,
  ListOrdered,
  Quote,
  Save,
  Send,
  Table,
  Undo2,
} from "lucide-react";

import { Button, IconButton } from "@hozui/react";
import type { EditorCommands } from "../model/commands";
import type { UploadEditorMediaResult } from "../model/media";
import { MediaUploadControl } from "./media-upload-control";

const tools = [
  {
    label: "Insert table",
    icon: Table,
    run: (editor: Editor) =>
      editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
  },
  {
    label: "Heading",
    icon: Heading2,
    run: (editor: Editor) => editor.chain().focus().toggleHeading({ level: 2 }).run(),
  },
  { label: "Bold", icon: Bold, run: (editor: Editor) => editor.chain().focus().toggleBold().run() },
  {
    label: "Italic",
    icon: Italic,
    run: (editor: Editor) => editor.chain().focus().toggleItalic().run(),
  },
  {
    label: "Link",
    icon: Link,
    run: (editor: Editor) => {
      const href = globalThis.prompt?.("URL")?.trim();
      if (!href) return false;
      return editor.chain().focus().setLink({ href }).run();
    },
  },
  {
    label: "Bullet list",
    icon: List,
    run: (editor: Editor) => editor.chain().focus().toggleBulletList().run(),
  },
  {
    label: "Ordered list",
    icon: ListOrdered,
    run: (editor: Editor) => editor.chain().focus().toggleOrderedList().run(),
  },
  {
    label: "Quote",
    icon: Quote,
    run: (editor: Editor) => editor.chain().focus().toggleBlockquote().run(),
  },
  {
    label: "Code",
    icon: Code,
    run: (editor: Editor) => editor.chain().focus().toggleCodeBlock().run(),
  },
] as const;

export function EditorToolbar({
  upload,
  actionLoading,
  editor,
  onSave,
  onPublish,
  onPreview,
  onUnpublish,
  onArchive,
  onMediaUploaded,
  postSlug,
  saveDisabled,
  publishDisabled,
}: {
  upload: EditorCommands["upload"];
  actionLoading?: boolean;
  editor?: Editor | null;
  onSave?: () => void;
  onPublish?: () => void;
  onPreview?: () => void;
  onUnpublish?: () => void;
  onArchive?: () => void;
  onMediaUploaded?: (result: Extract<UploadEditorMediaResult, { ok: true }>) => void;
  postSlug: string;
  saveDisabled?: boolean;
  publishDisabled?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-border p-2">
      {tools.map((tool) => {
        const Icon = tool.icon;
        return (
          <IconButton
            aria-label={tool.label}
            disabled={!editor}
            icon={<Icon aria-hidden="true" size={16} />}
            key={tool.label}
            onClick={() => {
              if (editor) tool.run(editor);
            }}
            size="sm"
            type="button"
            variant="ghost"
          />
        );
      })}
      {onMediaUploaded ? (
        <MediaUploadControl upload={upload} onUploaded={onMediaUploaded} postSlug={postSlug} />
      ) : null}
      <div className="ml-auto flex flex-wrap items-center gap-2">
        <Button
          disabled={saveDisabled}
          label="Save"
          leadingIcon={<Save aria-hidden="true" size={16} />}
          loading={actionLoading}
          onClick={onSave}
          type="button"
          variant="secondary"
        />
        {onPublish ? (
          <Button
            disabled={publishDisabled}
            label="Publish"
            leadingIcon={<Send aria-hidden="true" size={16} />}
            loading={actionLoading}
            onClick={onPublish}
            type="button"
          />
        ) : null}
        {onPreview ? (
          <Button
            disabled={publishDisabled}
            label="Preview"
            leadingIcon={<Eye aria-hidden="true" size={16} />}
            loading={actionLoading}
            onClick={onPreview}
            type="button"
            variant="secondary"
          />
        ) : null}
        {onUnpublish ? (
          <Button
            disabled={publishDisabled}
            label="Unpublish"
            leadingIcon={<Undo2 aria-hidden="true" size={16} />}
            loading={actionLoading}
            onClick={onUnpublish}
            type="button"
            variant="secondary"
          />
        ) : null}
        {onArchive ? (
          <Button
            disabled={publishDisabled}
            label="Archive"
            leadingIcon={<Archive aria-hidden="true" size={16} />}
            loading={actionLoading}
            onClick={onArchive}
            type="button"
            variant="secondary"
          />
        ) : null}
      </div>
    </div>
  );
}
