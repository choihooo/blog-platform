import { setTimeout as wait } from "node:timers/promises";

import type { MediaMappingRecord } from "./map-media";

export type MediaUploadReport = {
  total: number;
  uploaded: number;
  skipped: number;
  failed: number;
  retryCount: number;
  errors: string[];
  mappings: MediaMappingRecord[];
};

export type UploadOptions = {
  dryRun?: boolean;
  maxRetries?: number;
  retryDelayMs?: number;
  bucket?: {
    put(
      key: string,
      body: ArrayBuffer,
      options?: { httpMetadata?: { contentType?: string } },
    ): Promise<unknown>;
  };
};

type ResolvedUploadOptions = Required<Omit<UploadOptions, "bucket">> &
  Pick<UploadOptions, "bucket">;

function isRetryable(error: unknown) {
  return (
    !String(error).toLowerCase().includes("403") && !String(error).toLowerCase().includes("404")
  );
}

async function uploadOne(
  input: MediaMappingRecord,
  options: ResolvedUploadOptions,
): Promise<{ mapping: MediaMappingRecord; attempts: number }> {
  if (options.dryRun) {
    return {
      mapping: { ...input, status: "uploaded", notes: "dry-run upload skipped" },
      attempts: 0,
    };
  }

  let attempt = 0;
  let lastError: unknown;

  while (attempt <= options.maxRetries) {
    attempt += 1;
    try {
      const response = await fetch(input.sourceUrl);
      if (!response.ok) {
        throw new Error(`upload-source failed: ${response.status}`);
      }
      const body = await response.arrayBuffer();
      if (options.bucket) {
        await options.bucket.put(input.targetR2Key, body, {
          httpMetadata: { contentType: "image/webp" },
        });
      }
      return {
        mapping: {
          ...input,
          status: "mapped",
          notes: options.bucket
            ? `uploaded to R2 (${attempt} attempt${attempt === 1 ? "" : "s"})`
            : `upload fetched (${attempt} attempt${attempt === 1 ? "" : "s"}; R2 bucket not configured)`,
        },
        attempts: attempt,
      };
    } catch (error) {
      lastError = error;
      if (attempt > options.maxRetries || !isRetryable(error)) break;
      await wait(options.retryDelayMs * Math.pow(2, attempt - 1));
    }
  }

  return {
    mapping: {
      ...input,
      status: "failed",
      notes: `upload failed: ${lastError instanceof Error ? lastError.message : String(lastError)}`,
    },
    attempts: attempt,
  };
}

export async function uploadMediaRecords(
  mappings: MediaMappingRecord[],
  options: UploadOptions = {},
): Promise<MediaUploadReport> {
  const normalized: ResolvedUploadOptions = {
    dryRun: options.dryRun ?? process.env.DRY_RUN === "1",
    maxRetries: options.maxRetries ?? 3,
    retryDelayMs: options.retryDelayMs ?? 300,
    bucket: options.bucket,
  };

  const report: MediaUploadReport = {
    total: mappings.length,
    uploaded: 0,
    skipped: 0,
    failed: 0,
    retryCount: 0,
    errors: [],
    mappings: [],
  };

  for (const mapping of mappings) {
    if (mapping.status !== "pending") {
      report.skipped += 1;
      report.mappings.push(mapping);
      continue;
    }
    const result = await uploadOne(mapping, normalized);
    report.retryCount += Math.max(0, result.attempts - 1);
    const uploaded = result.mapping;
    if (uploaded.status === "mapped") {
      report.uploaded += 1;
    } else if (uploaded.status === "failed") {
      report.failed += 1;
      report.errors.push(uploaded.notes);
    } else {
      report.skipped += 1;
    }
    report.mappings.push(uploaded);
  }

  return report;
}

export function summarizeMediaUpload(report: MediaUploadReport) {
  const successRate = report.total === 0 ? 1 : report.uploaded / report.total;
  return {
    ...report,
    generatedAt: new Date().toISOString(),
    successRate,
    queueLength: Math.max(0, report.failed),
  };
}
