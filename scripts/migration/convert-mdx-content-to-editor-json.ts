import { execFile } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";

import { createContentAdapter } from "@blog-platform/core/storage";
import {
  loadPostContent,
  parsePostContent,
  serializePostContent,
} from "@blog-platform/core/content";

const execFileAsync = promisify(execFile);

type WranglerPostRow = {
  slug: string;
  content: string;
};

function hasD1RestConfig() {
  const globalBinding = (globalThis as { D1_DATABASE?: unknown }).D1_DATABASE;
  if (globalBinding) return true;
  if (process.env.D1_DATABASE) return true;
  return Boolean(
    process.env.CLOUDFLARE_ACCOUNT_ID &&
    (process.env.CLOUDFLARE_D1_DATABASE_ID ?? process.env.D1_DATABASE_ID) &&
    (process.env.CLOUDFLARE_D1_API_TOKEN ??
      process.env.CLOUDFLARE_API_TOKEN ??
      process.env.D1_API_TOKEN),
  );
}

function databaseName() {
  return process.env.D1_DATABASE_NAME ?? "blog-platform";
}

function sqlString(value: string) {
  return `'${value.replaceAll("'", "''")}'`;
}

function parseWranglerJson(stdout: string) {
  const start = stdout.indexOf("[");
  if (start === -1) throw new Error(`Wrangler did not return JSON: ${stdout.trim()}`);
  return JSON.parse(stdout.slice(start)) as Array<{
    results?: WranglerPostRow[];
    success?: boolean;
    error?: string;
  }>;
}

async function wranglerD1Json(sql: string) {
  const { stdout } = await execFileAsync(
    "pnpm",
    ["dlx", "wrangler", "d1", "execute", databaseName(), "--remote", "--json", "--command", sql],
    { maxBuffer: 20 * 1024 * 1024 },
  );
  const payload = parseWranglerJson(stdout);
  const result = payload[0];
  if (!result?.success) throw new Error(result?.error ?? "Wrangler D1 query failed");
  return result.results ?? [];
}

async function wranglerD1File(sql: string) {
  const dir = await mkdtemp(join(tmpdir(), "post-content-migration-"));
  const path = join(dir, "update.sql");
  try {
    await writeFile(path, sql, "utf8");
    await execFileAsync(
      "pnpm",
      ["dlx", "wrangler", "d1", "execute", databaseName(), "--remote", "--file", path],
      { maxBuffer: 20 * 1024 * 1024 },
    );
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

async function migrateWithWrangler(dryRun: boolean) {
  const posts = await wranglerD1Json("SELECT slug, content FROM posts ORDER BY slug");
  const updates: Array<{ slug: string; content: string }> = [];

  for (const post of posts) {
    if (parsePostContent(post.content)) continue;
    updates.push({
      slug: post.slug,
      content: serializePostContent(loadPostContent(post.content)),
    });
    console.log(`${dryRun ? "would convert" : "converting"} ${post.slug}`);
  }

  if (!dryRun && updates.length > 0) {
    const now = new Date().toISOString();
    const statements = updates.map(
      (post) =>
        `UPDATE posts SET content = ${sqlString(post.content)}, updated_at = ${sqlString(
          now,
        )} WHERE slug = ${sqlString(post.slug)};`,
    );
    await wranglerD1File(statements.join("\n"));
  }

  console.log(`${dryRun ? "would convert" : "converted"} ${updates.length} posts`);
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  if (!hasD1RestConfig()) {
    await migrateWithWrangler(dryRun);
    return;
  }

  const adapter = createContentAdapter();
  let page = 1;
  let converted = 0;

  for (;;) {
    const listed = await adapter.listPosts({
      publishedOnly: false,
      page,
      limit: 100,
      includeTotal: false,
      includeMedia: false,
      includeTags: true,
    });
    if (!listed.ok) throw new Error(listed.error.message);
    if (listed.data.items.length === 0) break;

    for (const post of listed.data.items) {
      if (parsePostContent(post.content)) continue;
      const content = serializePostContent(loadPostContent(post.content));
      converted++;
      console.log(`${dryRun ? "would convert" : "converting"} ${post.slug}`);
      if (!dryRun) {
        const updated = await adapter.updatePost({
          slug: post.slug,
          authorIdentity: "content-migration",
          post: { content },
        });
        if (!updated.ok) throw new Error(`${post.slug}: ${updated.error.message}`);
      }
    }

    if (listed.data.items.length < 100) break;
    page++;
  }

  console.log(`${dryRun ? "would convert" : "converted"} ${converted} posts`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
