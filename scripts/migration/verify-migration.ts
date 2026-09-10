#!/usr/bin/env node

import "./env";

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

import {
  getContentSource,
  normalizeForDualRunCompare,
  type ContentSourceMode,
  type PublicPost,
} from "../../apps/blog/features/blog/server/content-source";

const sourceMode = (value: string | undefined, fallback: ContentSourceMode): ContentSourceMode =>
  value === "remote" || value === "d1r2" ? value : fallback;

type PostSummary = { title: string; categoryPath: string | null; tagCount: number };

type CheckInput = {
  sampleSlug: string;
  runbookId: string;
  primaryMode: ContentSourceMode;
  comparisonMode: ContentSourceMode;
  primaryOk: boolean;
  comparisonOk: boolean;
  rowsCompared: number;
  rowsMatched: number;
  sample: { primary: PostSummary; comparison: PostSummary };
  imageDiff: { primaryHeroUrls: string[]; comparisonHeroUrls: string[] };
};

const defaultInput: CheckInput = {
  sampleSlug: process.env.MIGRATION_SAMPLE_SLUG ?? "sample-post",
  runbookId: process.env.MIGRATION_RUNBOOK_ID ?? "runbook-local",
  primaryMode: sourceMode(process.env.MIGRATION_PRIMARY_MODE, "d1r2"),
  comparisonMode: sourceMode(process.env.MIGRATION_COMPARISON_MODE, "remote"),
  primaryOk: true,
  comparisonOk: true,
  rowsCompared: 0,
  rowsMatched: 0,
  sample: {
    primary: { title: "", categoryPath: null, tagCount: 0 },
    comparison: { title: "", categoryPath: null, tagCount: 0 },
  },
  imageDiff: { primaryHeroUrls: [], comparisonHeroUrls: [] },
};

function toPostSummary(post?: PublicPost | null): PostSummary {
  if (!post) return { title: "", categoryPath: null, tagCount: 0 };
  return {
    title: post.title,
    categoryPath: post.category ?? null,
    tagCount: post.tags?.length ?? 0,
  };
}

function postHeroUrls(post?: PublicPost | null): string[] {
  return post?.coverImage ? [post.coverImage] : [];
}

function comparePosts(primaryPost: PublicPost | null, comparisonPost: PublicPost | null) {
  const primarySnapshot = primaryPost ? normalizeForDualRunCompare(primaryPost) : null;
  const comparisonSnapshot = comparisonPost ? normalizeForDualRunCompare(comparisonPost) : null;
  const matched =
    primarySnapshot !== null &&
    comparisonSnapshot !== null &&
    JSON.stringify(primarySnapshot) === JSON.stringify(comparisonSnapshot);

  return {
    matched,
    imageDiff: {
      primaryHeroUrls: postHeroUrls(primaryPost),
      comparisonHeroUrls: postHeroUrls(comparisonPost),
    },
    rowsCompared: primaryPost && comparisonPost ? 1 : 0,
    rowsMatched: matched ? 1 : 0,
    sample: {
      primary: toPostSummary(primaryPost),
      comparison: toPostSummary(comparisonPost),
    },
  };
}

async function runVerify(input: CheckInput) {
  const primarySource = await getContentSource(input.primaryMode);
  const comparisonSource = await getContentSource(input.comparisonMode);
  const [primaryPost, comparisonPost] = await Promise.all([
    primarySource.getPostBySlug(input.sampleSlug),
    comparisonSource.getPostBySlug(input.sampleSlug),
  ]);

  const comparison = comparePosts(primaryPost ?? null, comparisonPost ?? null);
  const reportPath = resolve(
    process.cwd(),
    process.env.MIGRATION_REPORT_FILE ?? "scripts/migration/verify-report.json",
  );
  const rowsCompared = comparison.rowsCompared;
  const rowsMatched = comparison.rowsMatched;
  const matchRate = rowsCompared === 0 ? 1 : rowsMatched / rowsCompared;
  const hasComparableSample = rowsCompared > 0;
  const missingInComparison = comparison.imageDiff.primaryHeroUrls.filter(
    (url) => !comparison.imageDiff.comparisonHeroUrls.includes(url),
  );
  const extraInComparison = comparison.imageDiff.comparisonHeroUrls.filter(
    (url) => !comparison.imageDiff.primaryHeroUrls.includes(url),
  );
  const canApprove = hasComparableSample && matchRate >= 0.995 && missingInComparison.length === 0;

  const output = {
    ...input,
    primaryOk: Boolean(primaryPost),
    comparisonOk: Boolean(comparisonPost),
    rowsCompared,
    rowsMatched,
    matchRate,
    sample: comparison.sample,
    imageDiff: comparison.imageDiff,
    generatedAt: new Date().toISOString(),
    sampleMatch: comparison.matched,
    imageCheck: {
      primaryHeroCount: comparison.imageDiff.primaryHeroUrls.length,
      comparisonHeroCount: comparison.imageDiff.comparisonHeroUrls.length,
      missingInComparison,
      extraInComparison,
    },
    recommendations: {
      action: canApprove ? "approve-shadow" : "hold",
      nextStep: canApprove ? "비교 대상 전환 가능" : "이슈 수정 후 재검증",
    },
    rollbackCheck: {
      beforeMode: input.primaryMode,
      rollbackMode: "d1r2" as const,
      canRollbackWithinWindow: true,
      windowMinutes: Number(process.env.ROLLBACK_WINDOW_MINUTES ?? "1"),
    },
  };

  writeFileSync(reportPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");
  return output;
}

function printUsage() {
  console.log("\nUsage:");
  console.log(
    "  MIGRATION_SAMPLE_SLUG=<slug> MIGRATION_PRIMARY_MODE=d1r2 MIGRATION_COMPARISON_MODE=remote pnpm migrate:verify > scripts/migration/verify-output.json",
  );
  console.log("  MIGRATION_REPORT_FILE=./scripts/migration/verify-report.json");
}

function readExistingReport() {
  const outputPath = resolve(
    process.cwd(),
    process.env.MIGRATION_REPORT_FILE ?? "scripts/migration/verify-report.json",
  );
  try {
    const raw = readFileSync(outputPath, "utf8");
    return raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

async function main() {
  printUsage();
  const report = await runVerify(defaultInput);
  const existing = readExistingReport();
  console.log(JSON.stringify({ ...existing, ...report }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? (error.stack ?? error.message) : String(error));
  process.exit(1);
});
