#!/usr/bin/env node

import "./env";

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

type ReportInput = {
  rowsCompared: number;
  matchedRows: number;
  migrationMode: "legacy" | "d1r2";
  imageSuccessRate: number;
  errors?: string[];
  imageRewriteFailures?: string[];
  retryQueue?: string[];
};

type DailySummaryInput = {
  date: string;
  rowsRead: number;
  imageExposureRate: number;
  errorRateP5xx: number;
  dualRunDiffRate: number;
};

const defaultReport: ReportInput = {
  rowsCompared: 0,
  matchedRows: 0,
  migrationMode: process.env.CONTENT_SOURCE_MODE === "legacy" ? "legacy" : "d1r2",
  imageSuccessRate: 0,
  errors: [],
};

const sampleDays: DailySummaryInput[] = [
  {
    date: new Date().toISOString().slice(0, 10),
    rowsRead: 0,
    imageExposureRate: 0,
    errorRateP5xx: 0,
    dualRunDiffRate: 0,
  },
];

function readJson(pathname: string): Record<string, unknown> {
  if (!existsSync(pathname)) return {};
  try {
    const parsed = JSON.parse(readFileSync(pathname, "utf8")) as unknown;
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
}

function stringList(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String).filter(Boolean) : [];
}

function formatReport(input: ReportInput) {
  const matchRate = input.rowsCompared === 0 ? 1 : input.matchedRows / input.rowsCompared;
  const summary = {
    ...input,
    generatedAt: new Date().toISOString(),
    matchRate,
    imageExposureOk: input.imageSuccessRate >= 0.95,
    imageRewriteFailures: input.imageRewriteFailures ?? [],
    retryQueue: input.retryQueue ?? [],
    retryQueueLength: input.retryQueue?.length ?? 0,
    dailySummaryTemplate: sampleDays,
    sevenDayWindow: {
      requiredSLO: {
        rowsReadMin: 0,
        imageExposureMin: 0.98,
        http500Max: 0.01,
        dualRunDiffMax: 0.005,
      },
      sampleStatus: "pending",
    },
  };
  console.log(JSON.stringify(summary, null, 2));
  return summary;
}

const verifyReport = readJson(
  resolve(
    process.cwd(),
    process.env.MIGRATION_REPORT_FILE ?? "scripts/migration/verify-report.json",
  ),
);
const uploadReport = readJson(
  resolve(
    process.cwd(),
    process.env.MIGRATION_UPLOAD_REPORT_FILE ?? "scripts/migration/upload-report.json",
  ),
);
const uploadErrors = stringList(uploadReport.errors);
const retryQueue = [...stringList(defaultReport.retryQueue), ...uploadErrors];
const report = formatReport({
  ...defaultReport,
  rowsCompared: Number(verifyReport.rowsCompared ?? defaultReport.rowsCompared),
  matchedRows: Number(verifyReport.rowsMatched ?? defaultReport.matchedRows),
  imageSuccessRate: Number(uploadReport.successRate ?? defaultReport.imageSuccessRate),
  errors: [...(defaultReport.errors ?? []), ...uploadErrors],
  imageRewriteFailures: stringList(defaultReport.imageRewriteFailures),
  retryQueue,
});

writeFileSync(
  resolve(
    process.cwd(),
    process.env.MIGRATION_DAILY_REPORT_FILE ?? "scripts/migration/daily-report.json",
  ),
  `${JSON.stringify(report, null, 2)}\n`,
  "utf8",
);
