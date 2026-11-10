#!/usr/bin/env node

import "./env";

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const DEFAULT_CONTENT_SOURCE_MODE = "d1r2";

type MigrationMode = "legacy" | "d1r2";

type MigrationCommand = "extract" | "upload" | "import" | "verify" | "full" | "status";

type MigrationRunState =
  "stable-legacy" | "shadow-compare" | "active-new" | "rollback" | "stabilized";

type MigrationState = {
  contentSourceMode: MigrationMode;
  command: MigrationCommand;
  runbook: MigrationRunState;
  checkpoint: {
    path: string;
    loadedFailures: number;
    updatedAt: string;
  };
  nextCommands: MigrationCommand[];
};

function resolveMigrationMode(): MigrationMode {
  const fromEnv = (process.env.CONTENT_SOURCE_MODE ?? DEFAULT_CONTENT_SOURCE_MODE)
    .trim()
    .toLowerCase();
  return fromEnv === "legacy" ? "legacy" : "d1r2";
}

function readCommand(): MigrationCommand {
  const arg = (process.argv[2] ?? "full").trim().toLowerCase();
  const allow: MigrationCommand[] = ["extract", "upload", "import", "verify", "full", "status"];
  return allow.includes(arg as MigrationCommand) ? (arg as MigrationCommand) : "full";
}

function printUsage() {
  console.log(`\nUsage:`);
  console.log(`  pnpm migrate:run [extract|upload|import|verify|full|status]`);
  console.log(`\nModes:`);
  console.log(`  - d1r2: D1/R2 migration path (default)`);
  console.log(`  - legacy: historical local content path`);
}

function getStateByMode(mode: MigrationMode): MigrationRunState {
  if (process.env.MIGRATION_FORCE_ROLLBACK === "1") return "rollback";
  if (process.env.MIGRATION_STABILIZED === "1") return "stabilized";
  if (process.env.DUAL_RUN_ENABLED === "1" || process.env.DUAL_RUN_ENABLED === "true") {
    return "shadow-compare";
  }
  return mode === "legacy" ? "stable-legacy" : "active-new";
}

function readFailureQueue(pathname: string): unknown[] {
  if (!existsSync(pathname)) return [];
  try {
    const parsed = JSON.parse(readFileSync(pathname, "utf8")) as unknown;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function nextCommandsFor(command: MigrationCommand, failures: unknown[]): MigrationCommand[] {
  if (command === "full") return ["extract", "upload", "import", "verify"];
  if (command === "status") return [];
  if (failures.length > 0 && command !== "upload") return ["upload", command];
  return [command];
}

function main() {
  const command = readCommand();
  const contentSourceMode = resolveMigrationMode();
  const runbook: MigrationRunState = getStateByMode(contentSourceMode);
  const queuePath = resolve(
    process.cwd(),
    process.env.MIGRATION_ERROR_QUEUE_FILE ?? "scripts/migration/error-queue.json",
  );
  const checkpointPath = resolve(
    process.cwd(),
    process.env.MIGRATION_CHECKPOINT_FILE ?? "scripts/migration/checkpoint.json",
  );
  const failures = readFailureQueue(queuePath);

  if (command === "status") {
    printUsage();
  }

  const state: MigrationState = {
    contentSourceMode,
    command,
    runbook,
    checkpoint: {
      path: checkpointPath,
      loadedFailures: failures.length,
      updatedAt: new Date().toISOString(),
    },
    nextCommands: nextCommandsFor(command, failures),
  };

  writeFileSync(checkpointPath, `${JSON.stringify(state, null, 2)}\n`, "utf8");
  console.log(JSON.stringify(state, null, 2));
}

main();
