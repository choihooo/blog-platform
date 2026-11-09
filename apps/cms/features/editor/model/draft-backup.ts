import type { EditorDocument } from "@blog-platform/core/content";

export type DraftBackupRecord = {
  backupKey: string;
  document: EditorDocument;
  sourceSha?: string;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
};

const DAY_MS = 24 * 60 * 60 * 1000;
export const DRAFT_BACKUP_TTL_DAYS = 30;

export function backupKey(document: Pick<EditorDocument, "id" | "path">) {
  return document.path ? `post:${document.path}` : `draft:${document.id}`;
}

export function createDraftBackup(document: EditorDocument, now = new Date()): DraftBackupRecord {
  const updatedAt = now.toISOString();
  return {
    backupKey: backupKey(document),
    document,
    sourceSha: document.sourceSha,
    createdAt: updatedAt,
    updatedAt,
    expiresAt: new Date(now.getTime() + DRAFT_BACKUP_TTL_DAYS * DAY_MS).toISOString(),
  };
}

export function isExpiredBackup(record: DraftBackupRecord, now = new Date()) {
  return Date.parse(record.expiresAt) <= now.getTime();
}

export function isRestoreCandidate(
  record: DraftBackupRecord,
  document: EditorDocument,
  now = new Date(),
) {
  return (
    !isExpiredBackup(record, now) &&
    record.sourceSha === document.sourceSha &&
    Date.parse(record.updatedAt) > Date.parse(document.lastLoadedAt)
  );
}

export function readBackup(storage: Storage, key: string): DraftBackupRecord | null {
  const raw = storage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as DraftBackupRecord;
  } catch {
    storage.removeItem(key);
    return null;
  }
}

export function writeBackup(storage: Storage, document: EditorDocument, now = new Date()) {
  const record = createDraftBackup(document, now);
  storage.setItem(record.backupKey, JSON.stringify(record));
  return record;
}

export function clearBackup(storage: Storage, document: Pick<EditorDocument, "id" | "path">) {
  storage.removeItem(backupKey(document));
}
