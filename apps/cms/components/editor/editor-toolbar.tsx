import {
  Bold,
  Code,
  Heading2,
  Image,
  Italic,
  Link,
  List,
  ListOrdered,
  Quote,
  Save,
} from "lucide-react";
import type { Editor } from "@tiptap/react";

import { Button } from "@blog-platform/design-system";

const tools = [
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
  editor,
  onSave,
  saveDisabled,
}: {
  editor?: Editor | null;
  onSave?: () => void;
  saveDisabled?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-border p-2">
      {tools.map((tool) => {
        const Icon = tool.icon;
        return (
          <Button
            key={tool.label}
            aria-label={tool.label}
            disabled={!editor}
            onClick={() => {
              if (editor) tool.run(editor);
            }}
            size="icon"
            type="button"
            variant="ghost"
          >
            <Icon className="h-4 w-4" />
          </Button>
        );
      })}
      <Button aria-label="Image upload later" disabled size="icon" type="button" variant="ghost">
        <Image className="h-4 w-4" />
      </Button>
      <div className="ml-auto">
        <Button disabled={saveDisabled} onClick={onSave} type="button">
          <Save className="h-4 w-4" />
          Save
        </Button>
      </div>
    </div>
  );
}
