#!/usr/bin/env node

import "./env";

type DryRunResult = {
  startedAt: string;
  mode: "legacy" | "d1r2";
  sampleSlug: string;
  runbookId: string;
  estimatedSteps: string[];
  success: boolean;
  warnings: string[];
};

function parseMode(): "legacy" | "d1r2" {
  return process.env.CONTENT_SOURCE_MODE === "legacy" ? "legacy" : "d1r2";
}

function getSampleSlug() {
  const fallback = process.argv[2]?.trim();
  return fallback && fallback.length > 0
    ? fallback
    : (process.env.MIGRATION_SAMPLE_SLUG ?? "sample-post");
}

function main() {
  const result: DryRunResult = {
    startedAt: new Date().toISOString(),
    mode: parseMode(),
    sampleSlug: getSampleSlug(),
    runbookId: process.env.MIGRATION_RUNBOOK_ID ?? "runbook-local",
    estimatedSteps: [
      "posts/tags/categories/media_refs extraction",
      "Supabase data snapshot + category normalization",
      "URL-to-WebP mapping simulation (hero/body/og/pdf)",
      "media upload simulation",
      "idempotent import transaction simulation",
      "sample dual-compare simulation (legacy vs d1r2)",
      "image-exposure and rollback trigger simulation",
    ],
    success: true,
    warnings: [],
  };

  if (result.mode === "legacy") {
    result.warnings.push("실행 모드가 legacy입니다. dry-run은 시뮬레이션 로그만 생성합니다.");
  }

  if (!process.env.DRY_RUN || process.env.DRY_RUN !== "1") {
    result.warnings.push("DRY_RUN=1로 설정되면 출력 포맷이 그대로 유지되고 실행은 생략됩니다.");
  }

  const guide = {
    command: `CONTENT_SOURCE_MODE=${result.mode} MIGRATION_SAMPLE_SLUG=${result.sampleSlug} MIGRATION_RUNBOOK_ID=${result.runbookId} pnpm migrate:dry-run`,
    expectedArtifacts: [
      "scripts/migration/verify-report.json",
      "scripts/migration/mapping-report.json",
      "scripts/migration/error-queue.json",
    ],
  };

  console.log(JSON.stringify(result, null, 2));
  console.log(JSON.stringify({ guide }, null, 2));
}

main();
