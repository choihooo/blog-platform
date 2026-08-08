import { createHash, createHmac } from "node:crypto";

import { createD1RepositoryContentAdapter } from "./d1-repository-adapter";
import { createLocalContentAdapter } from "./local-adapter";
import { assertAllowedPath } from "./paths";
import { repositoryFailure } from "./repository-error";
import type { ContentAdapter } from "./types";

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

function withR2MediaUpload(adapter: ContentAdapter, config: R2UploadConfig): ContentAdapter {
  return {
    ...adapter,
    async commitMedia(input) {
      const allowed = assertAllowedPath(input.path);
      if (!allowed || allowed.kind !== "media") {
        return {
          success: false,
          error: repositoryFailure("validation-failure", {
            path: input.path,
            submittedContent: input.contentBase64,
          }),
        };
      }

      const body = Buffer.from(input.contentBase64, "base64");
      const r2Key = allowed.path.replace(/^public\//, "");
      try {
        await putR2Object({
          config,
          key: r2Key,
          body,
          contentType: contentTypeForPath(allowed.path),
        });
        return {
          success: true,
          data: {
            path: `${config.publicUrl}/${r2Key}`,
            sha: createHash("sha256").update(body).digest("hex"),
            status: "created",
            summary: `uploaded ${allowed.path}`,
          },
        };
      } catch (error) {
        return {
          success: false,
          error: repositoryFailure("temporary-connectivity", {
            path: allowed.path,
            submittedContent: input.contentBase64,
            message: error instanceof Error ? error.message : "R2 upload failed",
            secrets: [config.secretAccessKey, config.accessKeyId],
          }),
        };
      }
    },
  };
}

export async function createRuntimeContentAdapter(root: string): Promise<ContentAdapter> {
  const r2Config = r2UploadConfig();
  if (process.env.NODE_ENV === "development" && !r2Config) {
    return createLocalContentAdapter(root);
  }
  const adapter = createD1RepositoryContentAdapter();
  return r2Config ? withR2MediaUpload(adapter, r2Config) : adapter;
}
