import "./env";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve, join } from "node:path";
import {
  buildRecoveredContent,
  sourceImageIdentity,
  assertRecoveryState,
  contentUpdateStatement,
} from "./content-recovery";
import { analyzeEditorNodes, loadPostContent } from "../../packages/editor/src/index";

type Row = {
  id: string;
  slug: string;
  title: string;
  content: string;
  updated_at: string;
  is_published: number;
  [key: string]: unknown;
};
type Entry = {
  id: string;
  slug: string;
  before: string;
  after: string;
  updatedAt: string;
  sourceSha: string;
};
const runbookId = "content-rendering-recovery-20261105";
const command = process.argv[2] ?? "dry-run";
const option = (name: string) =>
  process.argv
    .find((a) => a.startsWith("--" + name + "="))
    ?.split("=")
    .slice(1)
    .join("=");
const dir = resolve(option("dir") ?? "_workspace/" + runbookId);
mkdirSync(dir, { recursive: true });
const read = <T>(file: string): T => JSON.parse(readFileSync(join(dir, file), "utf8"));
const save = (file: string, data: unknown) =>
  writeFileSync(join(dir, file), JSON.stringify(data, null, 2) + "\n", { mode: 0o600 });
const hash = (value: string) => createHash("sha256").update(value).digest("hex");

async function query<T>(
  sql: string,
  params: unknown[] = [],
): Promise<{ results: T[]; meta: { changes?: number } }> {
  const account = process.env.CLOUDFLARE_ACCOUNT_ID,
    db = process.env.CLOUDFLARE_D1_DATABASE_ID ?? process.env.D1_DATABASE_ID,
    token = process.env.CLOUDFLARE_D1_API_TOKEN ?? process.env.CLOUDFLARE_API_TOKEN;
  if (!token) {
    let i = 0;
    const bound = sql.replace(/\?/g, () => {
      const value = params[i++];
      return value === null
        ? "NULL"
        : typeof value === "number"
          ? String(value)
          : "'" + String(value).replaceAll("'", "''") + "'";
    });
    if (i !== params.length) throw new Error("Invalid SQL parameters");
    const stdout = execFileSync(
      "pnpm",
      [
        "--filter",
        "@blog-platform/rag-worker",
        "exec",
        "wrangler",
        "d1",
        "execute",
        "blog-platform",
        "--remote",
        "--json",
        "--command",
        bound,
      ],
      { encoding: "utf8", maxBuffer: 30 * 1024 * 1024, stdio: ["ignore", "pipe", "pipe"] },
    );
    const payload = JSON.parse(stdout.slice(stdout.indexOf("["))) as {
      success: boolean;
      results: T[];
      meta: { changes?: number };
    }[];
    if (!payload[0]?.success) throw new Error("Wrangler D1 query failed");
    return payload[0];
  }
  if (!account || !db) throw new Error("D1 credentials missing");
  const response = await fetch(
    "https://api.cloudflare.com/client/v4/accounts/" + account + "/d1/database/" + db + "/query",
    {
      method: "POST",
      headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
      body: JSON.stringify({ sql, params }),
      signal: AbortSignal.timeout(45000),
    },
  );
  const payload = (await response.json()) as {
    success: boolean;
    result?: { success: boolean; results: T[]; meta: { changes?: number } }[];
  };
  if (!response.ok || !payload.success || !payload.result?.[0]?.success)
    throw new Error("D1 request failed (" + response.status + ")");
  return payload.result[0];
}
function optimized(source: string) {
  return source.replace(/(https:\/\/pub-[^\s"')]+\/[a-f0-9]{16})\.(png|jpe?g)/g, "$1.webp");
}

async function prepare(rebuild = false) {
  if (!rebuild && existsSync(join(dir, "before.json")))
    throw new Error("Snapshot exists; reuse rebuild/dry-run/apply or choose a new directory");
  const before = rebuild
    ? read<{ posts: Row[] }>("before.json").posts
    : (await query<Row>("SELECT * FROM posts ORDER BY id")).results;
  if (!rebuild) {
    const media = (await query<Record<string, unknown>>("SELECT * FROM media_refs ORDER BY id"))
      .results;
    save("before.json", { runbookId, createdAt: new Date().toISOString(), posts: before, media });
  }
  const baseline = JSON.parse(
    readFileSync(option("baseline") ?? join(dir, "migration-baseline.json"), "utf8"),
  ) as { slug: string; id: string; old: unknown }[];
  const mappings = JSON.parse(
    readFileSync("scripts/migration/tistory-output/media-mappings.json", "utf8"),
  ) as { sourceUrl: string; canonicalPostSlug: string; r2Url: string }[];
  const entries: Entry[] = [];
  const review = [];
  for (const post of before.filter((p) => p.is_published === 1)) {
    const id = /^post_tistory_(\d+)$/.exec(post.id)?.[1];
    if (!id) {
      review.push({ slug: post.slug, action: "preserve-native-content" });
      continue;
    }
    const old = baseline.find((p) => p.id === post.id);
    if (!old || optimized(JSON.stringify(old.old)) !== post.content)
      throw new Error("Post differs from migrated baseline: " + post.slug);
    const sourceFile = "original-" + id + ".html";
    const html = rebuild
      ? readFileSync(join(dir, sourceFile), "utf8")
      : execFileSync(
          "curl",
          [
            "--fail",
            "--silent",
            "--show-error",
            "--location",
            "--max-time",
            "30",
            "https://hochoi.tistory.com/" + id,
          ],
          { encoding: "utf8", maxBuffer: 10 * 1024 * 1024 },
        );
    if (!rebuild) writeFileSync(join(dir, sourceFile), html, { mode: 0o600 });
    const map = new Map(
      mappings
        .filter((m) => m.canonicalPostSlug === "tistory-" + id)
        .map((m) => [sourceImageIdentity(m.sourceUrl), optimized(m.r2Url)]),
    );
    const after = buildRecoveredContent({
      html,
      mapImage: (src) => map.get(sourceImageIdentity(src)),
    });
    entries.push({
      id: post.id,
      slug: post.slug,
      before: post.content,
      after,
      updatedAt: post.updated_at,
      sourceSha: hash(html),
    });
    const nodes = loadPostContent(after).nodes;
    const stats = analyzeEditorNodes(nodes);
    review.push({
      slug: post.slug,
      action: "restore-source",
      beforeSha: hash(post.content),
      afterSha: hash(after),
      sourceSha: hash(html),
      headings: stats.headings.length,
      codeBlocks: stats.codeBlocks.length,
      tables: nodes.filter((n) => n.type === "table").length,
      images: nodes.filter((n) => n.type === "image").length,
    });
    console.log("prepared " + post.slug);
  }
  save("manifest.json", { runbookId, entries });
  save("review.json", {
    runbookId,
    publicPosts: before.filter((p) => p.is_published === 1).length,
    restored: entries.length,
    posts: review,
  });
}
async function execute(rollback = false, dryRun = false) {
  const { entries } = read<{ entries: Entry[] }>("manifest.json");
  let applied = 0,
    skipped = 0;
  for (const original of entries) {
    const entry = rollback
      ? { ...original, before: original.after, after: original.before }
      : original;
    const row = (await query<Row>("SELECT * FROM posts WHERE id = ?", [entry.id])).results[0];
    if (!row) throw new Error("Post missing: " + entry.slug);
    if (assertRecoveryState(row.content, entry.before, entry.after) === "already-applied") {
      skipped++;
      continue;
    }
    if (row.updated_at !== entry.updatedAt || row.slug !== entry.slug || row.is_published !== 1)
      throw new Error("Post metadata changed: " + entry.slug);
    if (!dryRun) {
      const statement = contentUpdateStatement(entry);
      const result = await query(statement.sql, statement.params);
      if (result.meta.changes !== 1) throw new Error("Guarded write rejected: " + entry.slug);
    }
    applied++;
    console.log(
      (dryRun ? "would update " : rollback ? "restored backup " : "updated ") + entry.slug,
    );
  }
  save(dryRun ? "dry-run.json" : rollback ? "rollback.json" : "applied.json", {
    runbookId,
    at: new Date().toISOString(),
    manifestSha: hash(readFileSync(join(dir, "manifest.json"), "utf8")),
    applied,
    skipped,
  });
}
async function verify() {
  const snapshot = read<{ posts: Row[]; media: Record<string, unknown>[] }>("before.json"),
    { entries } = read<{ entries: Entry[] }>("manifest.json");
  const current = (await query<Row>("SELECT * FROM posts ORDER BY id")).results;
  if (current.length !== snapshot.posts.length) throw new Error("Post count changed");
  for (const row of current) {
    const before = snapshot.posts.find((p) => p.id === row.id)!;
    const planned = entries.find((p) => p.id === row.id);
    if (row.content !== (planned?.after ?? before.content))
      throw new Error("Content verification failed: " + row.slug);
    for (const key of Object.keys(before).filter((k) => k !== "content" && k !== "view_count"))
      if (JSON.stringify(row[key]) !== JSON.stringify(before[key]))
        throw new Error("Metadata changed: " + row.slug + " " + key);
  }
  const media = (await query<Record<string, unknown>>("SELECT * FROM media_refs ORDER BY id"))
    .results;
  if (JSON.stringify(media) !== JSON.stringify(snapshot.media))
    throw new Error("Media references changed");
  save("verified.json", {
    runbookId,
    at: new Date().toISOString(),
    posts: current.length,
    publicPosts: current.filter((p) => p.is_published === 1).length,
    recovered: entries.length,
    metadataPreserved: true,
    mediaPreserved: true,
  });
  console.log("Verified all posts, metadata and media references");
}
async function main() {
  if (command === "prepare") await prepare();
  else if (command === "rebuild") await prepare(true);
  else if (command === "dry-run") await execute(false, true);
  else if (command === "apply" || command === "rollback") {
    if (option("runbook") !== runbookId)
      throw new Error("Explicit matching --runbook is required for writes");
    if (command === "apply") {
      if (
        !existsSync(join(dir, "dry-run.json")) ||
        read<{ manifestSha: string }>("dry-run.json").manifestSha !==
          hash(readFileSync(join(dir, "manifest.json"), "utf8"))
      )
        throw new Error("Run dry-run on this exact manifest before apply");
      const compatibleUrl = option("compatible-blog");
      if (!compatibleUrl)
        throw new Error("--compatible-blog URL required before writing extended content");
      const html = execFileSync(
        "curl",
        ["--fail", "--silent", "--show-error", "--location", "--max-time", "30", compatibleUrl],
        { encoding: "utf8", maxBuffer: 10 * 1024 * 1024 },
      );
      if (!html.includes('data-content-schema="1-rich"'))
        throw new Error("Deploy compatible renderer before data recovery");
    }
    await execute(command === "rollback");
  } else if (command === "verify") await verify();
  else throw new Error("Use prepare, dry-run, apply, verify or rollback");
}
main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Recovery failed");
  process.exitCode = 1;
});
