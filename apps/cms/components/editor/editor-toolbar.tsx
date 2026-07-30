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

import { Button } from "@blog-platform/design-system";

const tools = [
  { label: "Heading", icon: Heading2, disabled: false },
  { label: "Bold", icon: Bold, disabled: false },
  { label: "Italic", icon: Italic, disabled: false },
  { label: "Link", icon: Link, disabled: false },
  { label: "Bullet list", icon: List, disabled: false },
  { label: "Ordered list", icon: ListOrdered, disabled: false },
  { label: "Quote", icon: Quote, disabled: false },
  { label: "Code", icon: Code, disabled: false },
  { label: "Image upload later", icon: Image, disabled: true },
] as const;

export function EditorToolbar({
  onSave,
  saveDisabled,
}: {
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
            disabled={tool.disabled}
            size="icon"
            type="button"
            variant="ghost"
          >
            <Icon className="h-4 w-4" />
          </Button>
        );
      })}
      <div className="ml-auto">
        <Button disabled={saveDisabled} onClick={onSave} type="button">
          <Save className="h-4 w-4" />
          Save
        </Button>
      </div>
    </div>
  );
}
