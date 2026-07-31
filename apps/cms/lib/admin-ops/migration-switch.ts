export type MigrationMode = "legacy" | "d1r2";

export type MigrationSwitchState = {
  mode: MigrationMode;
  dualRunEnabled: boolean;
  rollbackWindowMinutes: number;
  switchedBy?: string;
  switchedAt?: string;
};

const DEFAULT_SWITCH: MigrationSwitchState = {
  mode: "d1r2",
  dualRunEnabled: false,
  rollbackWindowMinutes: 1,
};

export type MigrationSwitchInput = {
  mode?: string;
  dualRunEnabled?: boolean | string;
  rollbackWindowMinutes?: number | string;
  switchedBy?: string;
  runbookId?: string;
};

type MigrationSwitchOutput = {
  mode: MigrationMode;
  dualRunEnabled: boolean;
  rollbackWindowMinutes: number;
  switchedBy?: string;
  switchedAt: string;
  runbookId: string;
};

function normalizeMode(input: string | undefined): MigrationMode {
  void input;
  return "d1r2";
}

export function getMigrationSwitch(
  overrides: Partial<MigrationSwitchState> = {},
): MigrationSwitchState {
  const envRollbackWindow = Number(
    process.env.ROLLBACK_WINDOW_MINUTES ?? `${DEFAULT_SWITCH.rollbackWindowMinutes}`,
  );

  return {
    ...DEFAULT_SWITCH,
    ...overrides,
    mode: normalizeMode(overrides.mode ?? process.env.CONTENT_SOURCE_MODE),
    dualRunEnabled:
      overrides.dualRunEnabled ??
      ((process.env.DUAL_RUN_ENABLED ?? "0") === "1" || process.env.DUAL_RUN_ENABLED === "true"),
    rollbackWindowMinutes:
      overrides.rollbackWindowMinutes ??
      (Number.isFinite(envRollbackWindow) && envRollbackWindow > 0
        ? envRollbackWindow
        : DEFAULT_SWITCH.rollbackWindowMinutes),
  };
}

export function getMigrationMode(): MigrationMode {
  return getMigrationSwitch().mode;
}

export function deriveMigrationSwitch(input: MigrationSwitchInput): MigrationSwitchState {
  const parsedWindow =
    input.rollbackWindowMinutes !== undefined
      ? Number(input.rollbackWindowMinutes)
      : DEFAULT_SWITCH.rollbackWindowMinutes;

  const dualRunEnabled =
    input.dualRunEnabled === undefined
      ? DEFAULT_SWITCH.dualRunEnabled
      : input.dualRunEnabled === true ||
        `${input.dualRunEnabled}` === "1" ||
        `${input.dualRunEnabled}` === "true";

  return {
    ...getMigrationSwitch(),
    ...input,
    mode: normalizeMode(input.mode),
    dualRunEnabled,
    rollbackWindowMinutes:
      Number.isFinite(parsedWindow) && parsedWindow > 0
        ? parsedWindow
        : DEFAULT_SWITCH.rollbackWindowMinutes,
  };
}

export function renderMigrationSwitch(input: MigrationSwitchInput): MigrationSwitchOutput {
  const switchState = deriveMigrationSwitch(input);
  const resolvedMode =
    process.env.CONTENT_SOURCE_MODE_OVERRIDE ?? process.env.CONTENT_SOURCE_MODE ?? switchState.mode;

  return {
    ...switchState,
    mode: normalizeMode(resolvedMode),
    switchedAt: new Date().toISOString(),
    switchedBy: input.switchedBy ?? "system",
    runbookId: input.runbookId ?? process.env.MIGRATION_RUNBOOK_ID ?? "runbook-local",
  };
}

export function setLegacyMode(): MigrationSwitchState {
  return deriveMigrationSwitch({ mode: "legacy", dualRunEnabled: false });
}

export function setD1Mode(): MigrationSwitchState {
  return deriveMigrationSwitch({ mode: "d1r2", dualRunEnabled: true });
}

export function parseMigrationSwitchPayload(json: string): MigrationSwitchInput {
  const raw = JSON.parse(json) as Partial<MigrationSwitchInput>;
  return {
    mode: raw.mode,
    dualRunEnabled: raw.dualRunEnabled,
    rollbackWindowMinutes: raw.rollbackWindowMinutes,
    switchedBy: raw.switchedBy,
    runbookId: raw.runbookId,
  };
}
