export type RetentionRunbook = {
  runbookId: string;
  startedAt: string;
  dualStorageUntil: string;
  resyncNotes: string[];
};

const DUAL_STORAGE_DAYS = 7;

export function createRetentionRunbook(input: {
  runbookId: string;
  startedAt?: Date;
  resyncNotes?: string[];
}): RetentionRunbook {
  const startedAt = input.startedAt ?? new Date();
  const dualStorageUntil = new Date(startedAt);
  dualStorageUntil.setDate(dualStorageUntil.getDate() + DUAL_STORAGE_DAYS);

  return {
    runbookId: input.runbookId,
    startedAt: startedAt.toISOString(),
    dualStorageUntil: dualStorageUntil.toISOString(),
    resyncNotes: input.resyncNotes ?? [
      "Keep legacy storage untouched during the 7 day validation window.",
      "Re-run failed media and post queues before deleting any legacy source.",
    ],
  };
}

export function appendResyncNote(runbook: RetentionRunbook, note: string): RetentionRunbook {
  return {
    ...runbook,
    resyncNotes: [...runbook.resyncNotes, note],
  };
}
