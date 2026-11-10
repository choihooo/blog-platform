import { createHash, createHmac } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { ContractResult } from "../content/records.js";
import { secretFreeMessage } from "./secret-redaction.js";

export type MediaWrite = { path: string; contentBase64: string; expectedSha?: string };
export type StoredMedia = { path: string; publicPath: string; sha: string; sizeBytes: number };
export type MediaStore = { put(input: MediaWrite): Promise<ContractResult<StoredMedia>> };
type R2UploadConfig = {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  publicUrl: string;
};

function envValue(...keys: string[]) {
  return keys.map((key) => process.env[key]?.trim()).find(Boolean);
}

function r2UploadConfig(): R2UploadConfig | undefined {
  const accountId = envValue("R2_ACCOUNT_ID", "CLOUDFLARE_ACCOUNT_ID");
  const accessKeyId = envValue("R2_ACCESS_KEY_ID", "CLOUDFLARE_R2_ACCESS_KEY_ID");
  const secretAccessKey = envValue("R2_SECRET_ACCESS_KEY", "CLOUDFLARE_R2_SECRET_ACCESS_KEY");
  const bucket = envValue("R2_BUCKET", "CLOUDFLARE_R2_BUCKET");
  const publicUrl = envValue("R2_PUBLIC_URL", "NEXT_PUBLIC_R2_PUBLIC_URL");
  if (!accountId || !accessKeyId || !secretAccessKey || !bucket || !publicUrl) return;
  return {
    accountId,
    accessKeyId,
    secretAccessKey,
    bucket,
    publicUrl: publicUrl.replace(/\/+$/, ""),
  };
}

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

function contentTypeForPath(path: string) {
  if (path.endsWith(".webp")) return "image/webp";
  if (path.endsWith(".png")) return "image/png";
  if (path.endsWith(".jpg") || path.endsWith(".jpeg")) return "image/jpeg";
  return "application/octet-stream";
}

async function putR2Object(input: {
  config: R2UploadConfig;
  key: string;
  body: Buffer;
  contentType: string;
}) {
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const date = amzDate.slice(0, 8);
  const host = `${input.config.accountId}.r2.cloudflarestorage.com`;
  const payloadHash = createHash("sha256").update(input.body).digest("hex");
  const canonicalUri = `/${input.config.bucket}/${encodeR2Key(input.key)}`;
  const canonicalHeaders = [
    `content-type:${input.contentType}`,
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
  const signature = createHmac("sha256", signingKey(input.config.secretAccessKey, date))
    .update(stringToSign)
    .digest("hex");
  const response = await fetch(`https://${host}${canonicalUri}`, {
    method: "PUT",
    headers: {
      authorization: `AWS4-HMAC-SHA256 Credential=${input.config.accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`,
      "content-type": input.contentType,
      "x-amz-content-sha256": payloadHash,
      "x-amz-date": amzDate,
    },
    body: new Uint8Array(input.body),
  });
  if (!response.ok) {
    throw new Error(`R2 PUT failed: ${response.status} ${await response.text()}`);
  }
}

function mediaPath(input: string): string | undefined {
  const normalized = input.replaceAll("\\", "/").replace(/^\/+/, "");
  const parts = normalized.split("/").filter(Boolean);
  if (path.isAbsolute(input) || parts.includes("..") || parts[0]?.startsWith(".")) return;
  const value = parts.join("/");
  return value.startsWith("public/media/") ? value : undefined;
}

export function createMediaStore(root: string): MediaStore {
  const config = r2UploadConfig();
  const local = process.env.NODE_ENV === "development" && !config;
  return {
    async put(input) {
      const allowed = mediaPath(input.path);
      if (!allowed)
        return {
          ok: false,
          error: {
            code: "validation-failure",
            message: "The repository request is invalid.",
            retryable: false,
          },
        };
      if (!local && !config)
        return {
          ok: false,
          error: {
            code: "upstream-failure",
            message: "D1/R2 editor media uploads must use the R2 upload pipeline",
            retryable: false,
          },
        };
      const body = Buffer.from(input.contentBase64, "base64");
      const sha = createHash("sha256").update(body).digest("hex");
      const key = allowed.replace(/^public\//, "");
      try {
        if (local) {
          const target = path.join(root, allowed);
          if (input.expectedSha) {
            let current: Buffer | undefined;
            try {
              current = await readFile(target);
            } catch (error) {
              if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
            }
            if (
              current &&
              createHash("sha256").update(current).digest("hex") !== input.expectedSha
            ) {
              return {
                ok: false,
                error: {
                  code: "conflict",
                  message: "The file changed after it was loaded.",
                  retryable: false,
                },
              };
            }
          }
          await mkdir(path.dirname(target), { recursive: true });
          await writeFile(target, body);
        } else if (config) {
          await putR2Object({ config, key, body, contentType: contentTypeForPath(allowed) });
        }
        return {
          ok: true,
          data: {
            path: allowed,
            publicPath: local ? `/${key}` : `${config!.publicUrl}/${key}`,
            sha,
            sizeBytes: body.byteLength,
          },
        };
      } catch (error) {
        return {
          ok: false,
          error: {
            code: "retryable-failure",
            retryable: true,
            message: local
              ? "Repository connection failed temporarily."
              : secretFreeMessage(error instanceof Error ? error.message : "R2 upload failed", [
                  config?.secretAccessKey,
                  config?.accessKeyId,
                ]),
          },
        };
      }
    },
  };
}
