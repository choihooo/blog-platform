import { Badge } from "@blog-platform/design-system";

export type SaveStatus =
  | "clean"
  | "dirty"
  | "pending"
  | "saved"
  | "published"
  | "refreshFailed"
  | "validation"
  | "unsupported"
  | "failed";

export function SaveStatusBadge({ status }: { status: SaveStatus }) {
  const label: Record<SaveStatus, string> = {
    clean: "Clean",
    dirty: "Unsaved",
    pending: "Saving",
    saved: "Saved",
    published: "Published",
    refreshFailed: "Refresh failed",
    validation: "Needs title",
    unsupported: "Unsupported MDX",
    failed: "Save failed",
  };

  return (
    <Badge
      variant={
        status === "failed" || status === "unsupported" || status === "refreshFailed"
          ? "outline"
          : "secondary"
      }
    >
      {label[status]}
    </Badge>
  );
}
