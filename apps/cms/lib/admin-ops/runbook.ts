export type RunbookState = {
  runbookId: string;
  createdAt: string;
  updatedAt: string;
  requestedBy: string;
  dualRunEnabled: boolean;
  migrationMode: "legacy" | "d1r2";
  notes: string[];
  stickyUntil?: string;
  stabilizationUntil?: string;
};

export type RunbookEvent = {
  createdAt: string;
  actor: string;
  action: string;
  message: string;
};

const STICKY_DAYS = 7;

export function createRunbook(input: {
  runbookId: string;
  requestedBy: string;
  dualRunEnabled?: boolean;
  migrationMode?: "legacy" | "d1r2";
  notes?: string[];
}): RunbookState {
  const now = new Date();
  const stickyUntil = new Date(now);
  stickyUntil.setDate(stickyUntil.getDate() + STICKY_DAYS);
  return {
    runbookId: input.runbookId,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    requestedBy: input.requestedBy,
    dualRunEnabled: input.dualRunEnabled ?? false,
    migrationMode: input.migrationMode ?? "legacy",
    notes: input.notes ?? [],
    stickyUntil: stickyUntil.toISOString(),
    stabilizationUntil: undefined,
  };
}

export function startStabilization(
  runbook: RunbookState,
  actor: string,
  notes: string[] = [],
): RunbookState {
  const now = new Date().toISOString();
  return {
    ...runbook,
    updatedAt: now,
    migrationMode: "d1r2",
    dualRunEnabled: false,
    stabilizationUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    notes: [...runbook.notes, ...notes, `Started by ${actor}`],
  } as RunbookState;
}

export function updateRunbookNotes(
  runbook: RunbookState,
  actor: string,
  note: string,
): RunbookState {
  return {
    ...runbook,
    updatedAt: new Date().toISOString(),
    notes: [...runbook.notes, `${actor}: ${note}`],
  };
}

export function runbookHistory(runbook: RunbookState): RunbookEvent[] {
  return [
    {
      createdAt: runbook.createdAt,
      actor: runbook.requestedBy,
      action: "runbook-created",
      message: "runbook created",
    },
    {
      createdAt: runbook.updatedAt,
      actor: runbook.requestedBy,
      action: "runbook-updated",
      message: `mode=${runbook.migrationMode}, dualRun=${runbook.dualRunEnabled}`,
    },
  ];
}
