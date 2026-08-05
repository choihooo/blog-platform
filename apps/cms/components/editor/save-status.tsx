import { Badge } from "@hozui/react";

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
    unsupported: "Unsupported content",
    failed: "Save failed",
  };

  return (
    <Badge
      label={label[status]}
      tone={
        status === "failed" || status === "unsupported" || status === "refreshFailed"
          ? "critical"
          : status === "published" || status === "saved" || status === "clean"
            ? "positive"
            : "neutral"
      }
      variant={
        status === "failed" || status === "unsupported" || status === "refreshFailed"
          ? "outline"
          : "weak"
      }
    />
  );
}
