export type RollbackSeverity = "none" | "warning" | "critical";

export type RollbackEvent = {
  runbookId: string;
  modeBefore: "legacy" | "d1r2";
  modeAfter: "legacy" | "d1r2";
  triggeredBy: string;
  createdAt: string;
  reason: string;
  severity: RollbackSeverity;
  manualOnly: boolean;
};

export type RollbackRecord = {
  id: string;
  events: RollbackEvent[];
  updatedAt: string;
};

export type RollbackPlan = {
  runbookId: string;
  triggeredBy: string;
  modeBefore: "legacy" | "d1r2";
  reason: string;
  severity: RollbackSeverity;
};

export type RollbackPlanResult = {
  targetMode: "legacy";
  reason: string;
  events: RollbackRecord;
  reasonCode:
    | "slo-regression"
    | "image-regression"
    | "diff-threshold"
    | "manual"
    | "manual-safety"
    | "unknown";
};

export function formatRollbackEvent(input: {
  runbookId: string;
  modeBefore: "legacy" | "d1r2";
  modeAfter: "legacy" | "d1r2";
  triggeredBy: string;
  reason: string;
  severity: RollbackSeverity;
}): RollbackEvent {
  return {
    ...input,
    createdAt: new Date().toISOString(),
    manualOnly: true,
  };
}

export function recordRollback(input: {
  runbookId: string;
  modeBefore: "legacy" | "d1r2";
  modeAfter: "legacy" | "d1r2";
  triggeredBy: string;
  reason: string;
  severity?: RollbackSeverity;
}): RollbackRecord {
  const event = formatRollbackEvent({
    runbookId: input.runbookId,
    modeBefore: input.modeBefore,
    modeAfter: input.modeAfter,
    triggeredBy: input.triggeredBy,
    reason: input.reason,
    severity: input.severity ?? "warning",
  });

  return {
    id: `rollback-${event.createdAt}`,
    events: [event],
    updatedAt: event.createdAt,
  };
}

function reasonCode(input: { reason: string }) {
  const reason = input.reason.toLowerCase();
  if (reason.includes("slo") || reason.includes("5xx") || reason.includes("error")) {
    return "slo-regression";
  }
  if (reason.includes("image") || reason.includes("media") || reason.includes("hero")) {
    return "image-regression";
  }
  if (reason.includes("diff") || reason.includes("mismatch")) {
    return "diff-threshold";
  }
  if (reason.includes("manual") || reason.includes("operation")) {
    return "manual";
  }
  return "unknown";
}

export function buildRollbackPlan(input: RollbackPlan): RollbackPlanResult {
  const now = new Date().toISOString();
  const event: RollbackEvent = {
    runbookId: input.runbookId,
    modeBefore: input.modeBefore,
    modeAfter: "legacy",
    triggeredBy: input.triggeredBy,
    createdAt: now,
    reason: input.reason,
    severity: input.severity,
    manualOnly: false,
  };

  return {
    targetMode: "legacy",
    reason: input.reason,
    reasonCode: reasonCode({ reason: input.reason }),
    events: {
      id: `rollback-plan-${now}`,
      events: [event],
      updatedAt: now,
    },
  };
}

export function buildAutomaticRollbackPlan(input: {
  runbookId: string;
  modeBefore: "legacy" | "d1r2";
  triggeredBy?: string;
  reasons: string[];
}): RollbackPlanResult | null {
  if (input.modeBefore === "legacy" || input.reasons.length === 0) return null;
  return buildRollbackPlan({
    runbookId: input.runbookId,
    modeBefore: input.modeBefore,
    triggeredBy: input.triggeredBy ?? "rollout-monitor",
    reason: input.reasons.join("; "),
    severity: input.reasons.length > 1 ? "critical" : "warning",
  });
}
