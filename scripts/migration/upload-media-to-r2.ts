#!/usr/bin/env node

import "./env";

import { createHash, createHmac } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

import {
  summarizeMediaUpload,
  uploadMediaRecords,
} from "../../apps/cms/lib/migration/upload-media-to-r2";
import type { MediaMappingRecord } from "../../apps/cms/lib/migration/map-media";

function encodeR2Key(key: string) {
  return key.split("/").map(encodeURIComponent).join("/");
}

function hmac(key: Buffer | string, value: string) {
  return createHmac("sha256", key).update(value).digest();
}

function signingKey(secret: string, date: string) {
  const kDate = hmac(`AWS4${secret}`, date);
  const kRegion = hmac(kDate, "auto");
  const kService = hmac(kRegion, "s3");
  return hmac(kService, "aws4_request");
}

function createR2Bucket() {
  const accountId = process.env.R2_ACCOUNT_ID || process.env.CLOUDFLARE_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET;
  if (!accountId || !accessKeyId || !secretAccessKey || !bucket) return;

  const host = `${accountId}.r2.cloudflarestorage.com`;
  return {
    async put(key: string, body: ArrayBuffer, options?: { httpMetadata?: { contentType?: string } }) {
      const now = new Date();
      const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
      const date = amzDate.slice(0, 8);
      const contentType = options?.httpMetadata?.contentType ?? "application/octet-stream";
      const payload = Buffer.from(body);
      const payloadHash = createHash("sha256").update(payload).digest("hex");
      const canonicalUri = `/${bucket}/${encodeR2Key(key)}`;
      const canonicalHeaders = [
        `content-type:${contentType}`,
        `host:${host}`,
        `x-amz-content-sha256:${payloadHash}`,
        `x-amz-date:${amzDate}`,
      ].join("\n");
      const signedHeaders = "content-type;host;x-amz-content-sha256;x-amz-date";
      const canonicalRequest = [
        "PUT",
        canonicalUri,
        "",
        `${canonicalHeaders}\n`,
        signedHeaders,
        payloadHash,
      ].join("\n");
      const credentialScope = `${date}/auto/s3/aws4_request`;
      const stringToSign = [
        "AWS4-HMAC-SHA256",
        amzDate,
        credentialScope,
        createHash("sha256").update(canonicalRequest).digest("hex"),
      ].join("\n");
      const signature = createHmac("sha256", signingKey(secretAccessKey, date))
        .update(stringToSign)
        .digest("hex");
      const response = await fetch(`https://${host}${canonicalUri}`, {
        method: "PUT",
        headers: {
          authorization: `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`,
          "content-type": contentType,
          "x-amz-content-sha256": payloadHash,
          "x-amz-date": amzDate,
        },
        body: payload,
      });
      if (!response.ok) {
        throw new Error(`R2 PUT failed: ${response.status} ${await response.text()}`);
      }
    },
  };
}

function readMappings(): MediaMappingRecord[] {
  const inputPath = process.env.MIGRATION_MAPPING_FILE;
  if (!inputPath) return [];
  const raw = readFileSync(resolve(process.cwd(), inputPath), "utf8");
  const parsed = JSON.parse(raw) as unknown;
  if (!Array.isArray(parsed)) return [];
  return parsed as MediaMappingRecord[];
}

async function main() {
  const mappings = readMappings();
  const report = summarizeMediaUpload(
    await uploadMediaRecords(mappings, {
      dryRun: process.env.DRY_RUN !== "0",
      maxRetries: Number(process.env.MIGRATION_UPLOAD_RETRIES ?? "3"),
      retryDelayMs: Number(process.env.MIGRATION_UPLOAD_RETRY_DELAY_MS ?? "300"),
      bucket: createR2Bucket(),
    }),
  );
  const outputPath = resolve(
    process.cwd(),
    process.env.MIGRATION_UPLOAD_REPORT_FILE ?? "scripts/migration/upload-report.json",
  );
  writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : String(error));
  process.exit(1);
});
