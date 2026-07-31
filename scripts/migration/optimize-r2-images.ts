#!/usr/bin/env node

import "./env";

import { createHash, createHmac } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";

type D1Result<T> = Array<{ results: T[]; success: boolean }>;

type PostRow = {
  id: string;
  slug: string;
  title: string;
  content: string;
  hero_image_key: string | null;
};

type MediaRefRow = {
  id: string;
  post_id: string;
  r2_key: string;
  kind: string;
  width: number | null;
  height: number | null;
};

type OptimizedImage = {
  oldUrl: string;
  oldKey: string;
  newUrl: string;
  newKey: string;
  oldBytes: number;
  newBytes: number;
  width: number | null;
  height: number | null;
  status: "uploaded" | "skipped" | "failed";
  notes: string;
};

type ChangedPost = {
  id: string;
  slug: string;
  title: string;
  contentChanged: boolean;
  heroChanged: boolean;
  emptyImagesRemoved: number;
};

const R2_IMAGE_RE = /\.(?:png|jpe?g)(?:\?.*)?$/i;
const URL_RE = /https?:\/\/[^\s'"()<>]+/g;
const EMPTY_MARKDOWN_IMAGE_RE = /(?:^|\n)[ \t]*!\[[^\]]*]\([ \t]*\)[ \t]*(?=\n|$)/g;
const EMPTY_HTML_IMAGE_RE = /<img\b(?=[^>]*\bsrc=(['"])\s*\1)[^>]*>/gi;
const requireFromCms = createRequire(resolve(process.cwd(), "apps/cms/package.json"));

function env(name: string) {
  return process.env[name]?.trim();
}

function publicBase() {
  return (env("R2_PUBLIC_URL") ?? "").replace(/\/+$/, "");
}

function databaseName() {
  return env("D1_DATABASE_NAME") ?? "blog-platform";
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

function createR2Bucket() {
  const accountId = env("R2_ACCOUNT_ID") ?? env("CLOUDFLARE_ACCOUNT_ID");
  const accessKeyId = env("R2_ACCESS_KEY_ID");
  const secretAccessKey = env("R2_SECRET_ACCESS_KEY");
  const bucket = env("R2_BUCKET");
  if (!accountId || !accessKeyId || !secretAccessKey || !bucket) {
    throw new Error("R2 credentials are not configured");
  }

  const host = `${accountId}.r2.cloudflarestorage.com`;
  return {
    async put(key: string, body: Buffer, contentType: string) {
      const now = new Date();
      const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
      const date = amzDate.slice(0, 8);
      const payloadHash = createHash("sha256").update(body).digest("hex");
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
        body,
      });
      if (!response.ok) {
        throw new Error(`R2 PUT failed: ${response.status} ${await response.text()}`);
      }
    },
  };
}

function runWranglerQuery<T>(sql: string): T[] {
  const output = execFileSync(
    "pnpm",
    ["exec", "wrangler", "d1", "execute", databaseName(), "--remote", "--json", "--command", sql],
    { cwd: process.cwd(), encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
  );
  const parsed = JSON.parse(output) as D1Result<T>;
  return parsed.flatMap((item) => item.results ?? []);
}

function keyFromPublicUrl(url: string) {
  const base = publicBase();
  if (!base || !url.startsWith(`${base}/`)) return;
  return decodeURIComponent(url.slice(base.length + 1).split("?")[0] ?? "");
}

function keyFromImageRef(value: string) {
  if (!R2_IMAGE_RE.test(value)) return;
  if (/^https?:\/\//i.test(value)) return keyFromPublicUrl(value);
  return value.split("?")[0];
}

function webpKeyFor(key: string) {
  return key.replace(/\.(?:png|jpe?g)$/i, ".webp");
}

function publicUrlForKey(key: string) {
  return `${publicBase()}/${key}`;
}

function canonicalPublicUrlForImageRef(value: string) {
  const key = keyFromImageRef(value);
  return key ? publicUrlForKey(key) : undefined;
}

function replacementValueForImageRef(value: string, replacement: OptimizedImage) {
  return /^https?:\/\//i.test(value) ? replacement.newUrl : replacement.newKey;
}

function uniqueUrls(posts: PostRow[], mediaRefs: MediaRefRow[]) {
  const urls = new Set<string>();
  for (const post of posts) {
    for (const value of [post.hero_image_key, ...post.content.matchAll(URL_RE)].flat()) {
      if (typeof value !== "string") continue;
      const key = keyFromImageRef(value);
      if (key) urls.add(publicUrlForKey(key));
    }
  }
  for (const mediaRef of mediaRefs) {
    const key = keyFromImageRef(mediaRef.r2_key);
    if (key) urls.add(publicUrlForKey(key));
  }
  return [...urls].sort();
}

async function fetchBuffer(url: string) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`fetch failed: ${response.status}`);
  return Buffer.from(await response.arrayBuffer());
}

async function optimizeImage(url: string, dryRun: boolean): Promise<OptimizedImage> {
  const oldKey = keyFromPublicUrl(url);
  if (!oldKey) {
    return {
      oldUrl: url,
      oldKey: "",
      newUrl: url,
      newKey: "",
      oldBytes: 0,
      newBytes: 0,
      width: null,
      height: null,
      status: "skipped",
      notes: "not an R2 public URL",
    };
  }

  const newKey = webpKeyFor(oldKey);
  const newUrl = publicUrlForKey(newKey);
  try {
    const input = await fetchBuffer(url);
    const sharp = requireFromCms("sharp") as typeof import("sharp");
    const image = sharp(input).rotate();
    const metadata = await image.metadata();
    const output = await image.webp({ quality: 82 }).toBuffer();
    if (!dryRun) {
      await createR2Bucket().put(newKey, output, "image/webp");
    }
    return {
      oldUrl: url,
      oldKey,
      newUrl,
      newKey,
      oldBytes: input.byteLength,
      newBytes: output.byteLength,
      width: metadata.width ?? null,
      height: metadata.height ?? null,
      status: dryRun ? "skipped" : "uploaded",
      notes: dryRun ? "dry-run upload skipped" : "uploaded webp variant",
    };
  } catch (error) {
    try {
      const existing = await fetchBuffer(newUrl);
      const sharp = requireFromCms("sharp") as typeof import("sharp");
      const metadata = await sharp(existing).metadata();
      return {
        oldUrl: url,
        oldKey,
        newUrl,
        newKey,
        oldBytes: 0,
        newBytes: existing.byteLength,
        width: metadata.width ?? null,
        height: metadata.height ?? null,
        status: "skipped",
        notes: `source unavailable, existing webp reused: ${
          error instanceof Error ? error.message : String(error)
        }`,
      };
    } catch {
      // Fall through to a failed item so the generated SQL leaves the old reference intact.
    }
    return {
      oldUrl: url,
      oldKey,
      newUrl,
      newKey,
      oldBytes: 0,
      newBytes: 0,
      width: null,
      height: null,
      status: "failed",
      notes: error instanceof Error ? error.message : String(error),
    };
  }
}

function removeEmptyImages(content: string) {
  let removed = 0;
  let next = content.replace(EMPTY_MARKDOWN_IMAGE_RE, (match) => {
    removed += 1;
    return match.startsWith("\n") ? "\n" : "";
  });
  next = next.replace(EMPTY_HTML_IMAGE_RE, () => {
    removed += 1;
    return "";
  });
  return { content: next, removed };
}

function replaceAll(input: string, replacements: Map<string, OptimizedImage>) {
  let next = input;
  for (const item of replacements.values()) {
    if (item.status === "failed") continue;
    next = next.split(item.oldUrl).join(item.newUrl);
  }
  return next;
}

function sqlString(value: string | null) {
  if (value === null) return "NULL";
  return `'${value.replaceAll("'", "''")}'`;
}

function buildSql(input: {
  posts: PostRow[];
  mediaRefs: MediaRefRow[];
  replacements: Map<string, OptimizedImage>;
}) {
  const changedPosts: ChangedPost[] = [];
  const statements: string[] = [];

  for (const post of input.posts) {
    const cleaned = removeEmptyImages(post.content);
    const nextContent = replaceAll(cleaned.content, input.replacements);
    const nextHero = post.hero_image_key
      ? replaceAll(post.hero_image_key, input.replacements)
      : null;
    const contentChanged = nextContent !== post.content;
    const heroChanged = nextHero !== post.hero_image_key;
    if (!contentChanged && !heroChanged) continue;

    changedPosts.push({
      id: post.id,
      slug: post.slug,
      title: post.title,
      contentChanged,
      heroChanged,
      emptyImagesRemoved: cleaned.removed,
    });
    statements.push(
      `UPDATE posts SET content = ${sqlString(nextContent)}, hero_image_key = ${sqlString(
        nextHero,
      )} WHERE id = ${sqlString(post.id)};`,
    );
  }

  let changedMediaRefs = 0;
  for (const mediaRef of input.mediaRefs) {
    const oldUrl = canonicalPublicUrlForImageRef(mediaRef.r2_key);
    if (!oldUrl) continue;
    const replacement = input.replacements.get(oldUrl);
    if (!replacement || replacement.status === "failed") continue;
    const nextKey = replacementValueForImageRef(mediaRef.r2_key, replacement);
    if (nextKey === mediaRef.r2_key) continue;
    changedMediaRefs += 1;
    statements.push(
      `UPDATE media_refs SET r2_key = ${sqlString(nextKey)}, width = ${
        replacement.width ?? "NULL"
      }, height = ${replacement.height ?? "NULL"} WHERE id = ${sqlString(mediaRef.id)};`,
    );
  }

  return { sql: `${statements.join("\n")}\n`, changedPosts, changedMediaRefs };
}

function writeJson(path: string, data: unknown) {
  const output = resolve(process.cwd(), path);
  mkdirSync(dirname(output), { recursive: true });
  writeFileSync(output, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function writeText(path: string, data: string) {
  const output = resolve(process.cwd(), path);
  mkdirSync(dirname(output), { recursive: true });
  writeFileSync(output, data, "utf8");
}

async function main() {
  const dryRun = process.env.DRY_RUN !== "0";
  const applyD1 = process.env.APPLY_D1 === "1";
  const reportPath =
    process.env.IMAGE_OPTIMIZATION_REPORT_FILE ??
    "scripts/migration/image-optimization-report.json";
  const sqlPath =
    process.env.IMAGE_OPTIMIZATION_SQL_FILE ?? "scripts/migration/image-optimization.sql";
  const maxImages = Number(process.env.IMAGE_OPTIMIZATION_MAX_IMAGES ?? "0");

  const posts = runWranglerQuery<PostRow>(
    "SELECT id, slug, title, content, hero_image_key FROM posts ORDER BY slug",
  );
  const mediaRefs = runWranglerQuery<MediaRefRow>(
    "SELECT id, post_id, r2_key, kind, width, height FROM media_refs ORDER BY post_id, r2_key",
  );
  const urls = uniqueUrls(posts, mediaRefs).slice(0, maxImages > 0 ? maxImages : undefined);
  const optimized = await Promise.all(urls.map((url) => optimizeImage(url, dryRun)));
  const replacements = new Map(optimized.map((item) => [item.oldUrl, item]));
  const { sql, changedPosts, changedMediaRefs } = buildSql({ posts, mediaRefs, replacements });

  writeText(sqlPath, sql);
  const report = {
    generatedAt: new Date().toISOString(),
    dryRun,
    applyD1,
    totalPostsScanned: posts.length,
    totalMediaRefsScanned: mediaRefs.length,
    totalImagesDiscovered: urls.length,
    uploaded: optimized.filter((item) => item.status === "uploaded").length,
    failed: optimized.filter((item) => item.status === "failed").length,
    oldBytes: optimized.reduce((sum, item) => sum + item.oldBytes, 0),
    newBytes: optimized.reduce((sum, item) => sum + item.newBytes, 0),
    savedBytes: optimized.reduce(
      (sum, item) => sum + Math.max(0, item.oldBytes - item.newBytes),
      0,
    ),
    changedPosts,
    changedMediaRefs,
    optimized,
    sqlPath,
  };
  writeJson(reportPath, report);

  if (applyD1) {
    if (dryRun) throw new Error("APPLY_D1=1 requires DRY_RUN=0");
    execFileSync(
      "pnpm",
      ["exec", "wrangler", "d1", "execute", databaseName(), "--remote", "--file", sqlPath],
      { cwd: process.cwd(), stdio: "inherit" },
    );
  }

  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? (error.stack ?? error.message) : String(error));
  process.exit(1);
});
