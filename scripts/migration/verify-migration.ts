#!/usr/bin/env node

import "./env";

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

import { getContentSource, normalizeForDualRunCompare } from "../../apps/blog/lib/content-source";

import type { PublicPost } from "../../apps/blog/lib/content";

const defaultMode: "legacy" | "d1r2" = process.env.CONTENT_SOURCE_MODE === "d1r2" ? "d1r2" : "legacy";

type CheckInput = {
  sampleSlug: string;
  runbookId: string;
  mode: "legacy" | "d1r2";
  legacyOk: boolean;
  newOk: boolean;
  rowsCompared: number;
  rowsMatched: number;
  sample: {
    legacy: {
      title: string;
      categoryPath: string | null;
      tagCount: number;
    };
    d1r2: {
      title: string;
      categoryPath: string | null;
      tagCount: number;
    };
  };
  imageDiff: {
    legacyHeroUrls: string[];
    d1r2HeroUrls: string[];
  };
};

const defaultInput: CheckInput = {
  sampleSlug: process.env.MIGRATION_SAMPLE_SLUG ?? "sample-post",
  runbookId: process.env.MIGRATION_RUNBOOK_ID ?? "runbook-local",
  mode: defaultMode,
  legacyOk: true,
  newOk: true,
  rowsCompared: 0,
  rowsMatched: 0,
  sample: {
    legacy: {
      title: "",
      categoryPath: null,
      tagCount: 0,
    },
    d1r2: {
      title: "",
      categoryPath: null,
      tagCount: 0,
    },
  },
  imageDiff: {
    legacyHeroUrls: [],
    d1r2HeroUrls: [],
  },
};

function toPostSummary(post?: PublicPost | null) {
  if (!post) {
    return {
      title: "",
      categoryPath: null,
      tagCount: 0,
    };
  }

  return {
    title: post.title,
    categoryPath: post.category ?? null,
    tagCount: post.tags?.length ?? 0,
  };
}

function postHeroUrls(post?: PublicPost | null): string[] {
  if (!post?.coverImage) return [];
  return [post.coverImage];
}

function comparePosts(legacyPost: PublicPost | null, d1Post: PublicPost | null) {
  if (!legacyPost || !d1Post) {
    return {
      matched: false,
      imageDiff: {
        legacyHeroUrls: legacyPost ? postHeroUrls(legacyPost) : [],
        d1r2HeroUrls: d1Post ? postHeroUrls(d1Post) : [],
      },
      rowsCompared: legacyPost && d1Post ? 1 : 0,
      rowsMatched: 0,
      sample: {
        legacy: toPostSummary(legacyPost),
        d1r2: toPostSummary(d1Post),
      },
    };
  }

  const legacySnapshot = normalizeForDualRunCompare(legacyPost);
  const d1Snapshot = normalizeForDualRunCompare(d1Post);
  const matched = JSON.stringify(legacySnapshot) === JSON.stringify(d1Snapshot);
  return {
    matched,
    imageDiff: {
      legacyHeroUrls: postHeroUrls(legacyPost),
      d1r2HeroUrls: postHeroUrls(d1Post),
    },
    rowsCompared: 1,
    rowsMatched: matched ? 1 : 0,
    sample: {
      legacy: toPostSummary(legacyPost),
      d1r2: toPostSummary(d1Post),
    },
  };
}

async function runVerify(input: CheckInput) {
  const legacySource = await getContentSource("legacy");
  const d1Source = await getContentSource("d1r2");

  const [legacyPost, d1Post] = await Promise.all([
    legacySource.getPostBySlug(input.sampleSlug),
    d1Source.getPostBySlug(input.sampleSlug),
  ]);

  const comparison = comparePosts(legacyPost, d1Post);
  const reportPath = resolve(process.cwd(), process.env.MIGRATION_REPORT_FILE ?? "scripts/migration/verify-report.json");

  const rowsCompared = comparison.rowsCompared;
  const rowsMatched = comparison.rowsMatched;
  const matchRate = rowsCompared === 0 ? 1 : rowsMatched / rowsCompared;
  const hasComparableSample = rowsCompared > 0;
  const missingInD1R2 = comparison.imageDiff.legacyHeroUrls.filter(
    (url) => !comparison.imageDiff.d1r2HeroUrls.includes(url),
  );
  const extraInD1R2 = comparison.imageDiff.d1r2HeroUrls.filter(
    (url) => !comparison.imageDiff.legacyHeroUrls.includes(url),
  );

  const output = {
    ...input,
    legacyOk: Boolean(legacyPost),
    newOk: Boolean(d1Post),
    rowsCompared,
    rowsMatched,
    matchRate,
    sample: comparison.sample,
    imageDiff: comparison.imageDiff,
    generatedAt: new Date().toISOString(),
    sampleMatch: comparison.matched,
    imageCheck: {
      legacyHeroCount: comparison.imageDiff.legacyHeroUrls.length,
      d1r2HeroCount: comparison.imageDiff.d1r2HeroUrls.length,
      missingInD1R2,
      extraInD1R2,
    },
    recommendations: {
      action:
        hasComparableSample && matchRate >= 0.995 && missingInD1R2.length === 0
          ? "approve-shadow"
          : "hold",
      nextStep:
        hasComparableSample && matchRate >= 0.995 && missingInD1R2.length === 0
          ? "active-new 전환 가능"
          : "이슈 수정 후 재검증",
    },
    rollbackCheck: {
      beforeMode: input.mode,
      rollbackMode: "legacy" as const,
      canRollbackWithinWindow: true,
      windowMinutes: Number(process.env.ROLLBACK_WINDOW_MINUTES ?? "1"),
    },
  };

  writeFileSync(reportPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");
  return output;
}

function printUsage() {
  console.log(`\nUsage:`);
  console.log(`  MIGRATION_SAMPLE_SLUG=<slug> CONTENT_SOURCE_MODE=<legacy|d1r2> pnpm migrate:verify > scripts/migration/verify-output.json`);
  console.log(`  MIGRATION_REPORT_FILE=./scripts/migration/verify-report.json`);
}

function readExistingReport() {
  const outputPath = resolve(process.cwd(), process.env.MIGRATION_REPORT_FILE ?? "scripts/migration/verify-report.json");
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
  console.error(error instanceof Error ? error.stack ?? error.message : String(error));
  process.exit(1);
});
