import { Badge } from "@hozui/react";

import type { SaveStatus } from "../model/save-status";
export type { SaveStatus } from "../model/save-status";
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

  const tone =
    status === "failed" || status === "unsupported" || status === "refreshFailed"
      ? "critical"
      : status === "validation" || status === "dirty"
        ? "warning"
        : status === "pending"
          ? "informative"
          : "positive";

  return <Badge label={label[status]} tone={tone} variant="weak" />;
}
