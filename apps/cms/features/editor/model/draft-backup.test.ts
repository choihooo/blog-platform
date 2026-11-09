import { createEmptyEditorDocument } from "@blog-platform/core/content";
import { describe, expect, it } from "vitest";

import { backupKey, createDraftBackup, isExpiredBackup, isRestoreCandidate } from "./draft-backup";

describe("draft backup", () => {
  it("generates stable keys, TTL, and restore candidates", () => {
    const doc = createEmptyEditorDocument(new Date("2026-07-30T00:00:00.000Z"));
    doc.sourceSha = "sha";
    expect(backupKey(doc)).toBe(`draft:${doc.id}`);
    const backup = createDraftBackup(doc, new Date("2026-07-31T00:00:00.000Z"));
    expect(isExpiredBackup(backup, new Date("2026-08-01T00:00:00.000Z"))).toBe(false);
    expect(isRestoreCandidate(backup, doc, new Date("2026-08-01T00:00:00.000Z"))).toBe(true);
    expect(isExpiredBackup(backup, new Date("2026-09-01T00:00:00.000Z"))).toBe(true);
  });
});
