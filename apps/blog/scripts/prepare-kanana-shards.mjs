// Explicit opt-in: never download a 1.38 GB model as a side effect of install/build.
// Usage: node scripts/prepare-kanana-shards.mjs /path/to/llama-gguf-split
import { createHash } from "node:crypto";
import { createReadStream, createWriteStream } from "node:fs";
import {
  access,
  mkdir,
  mkdtemp,
  open,
  readFile,
  readdir,
  rename,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import { spawn } from "node:child_process";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { fileURLToPath } from "node:url";

const config = JSON.parse(
  await readFile(new URL("../features/pixel-room/kanana-model.json", import.meta.url), "utf8"),
);
const parent = fileURLToPath(new URL("../public/models/", import.meta.url));
const destination = join(parent, config.directory);
const splitter = process.argv[2] || "llama-gguf-split";

async function digest(path) {
  const hash = createHash("sha256");
  for await (const chunk of createReadStream(path)) hash.update(chunk);
  return hash.digest("hex");
}

function run(args) {
  return new Promise((resolve, reject) => {
    const child = spawn(splitter, args, { stdio: "inherit" });
    child.on("error", reject);
    child.on("exit", (code) =>
      code === 0 ? resolve() : reject(new Error(`Splitter failed: ${code}`)),
    );
  });
}

let exists = false;
try {
  await access(destination);
  exists = true;
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}
if (exists) {
  const manifest = JSON.parse(await readFile(join(destination, "manifest.json"), "utf8"));
  if (manifest.sourceSha256 !== config.sourceSha256 || manifest.files.length !== 3)
    throw new Error("Existing manifest mismatch; files were not overwritten.");
  for (const file of manifest.files) {
    if (
      !/^kanana-q8-\d{5}-of-00003\.gguf$/.test(file.name) ||
      (await digest(join(destination, file.name))) !== file.sha256
    )
      throw new Error("Existing shard mismatch; files were not overwritten.");
  }
  console.log(`Verified existing shards: ${destination}`);
  process.exit(0);
}

await run(["--version"]);
await mkdir(parent, { recursive: true });
const staging = await mkdtemp(join(parent, ".kanana-staging-"));
const scratch = await mkdtemp(join(tmpdir(), "kanana-shards-"));
try {
  const original = join(scratch, "source.gguf");
  console.log(`Downloading pinned Q8 model (${config.sourceBytes} bytes)…`);
  const response = await fetch(config.sourceUrl, { signal: AbortSignal.timeout(30 * 60_000) });
  if (!response.ok || !response.body) throw new Error(`Download failed: ${response.status}`);
  await pipeline(Readable.fromWeb(response.body), createWriteStream(original, { flags: "wx" }));
  if (
    (await stat(original)).size !== config.sourceBytes ||
    (await digest(original)) !== config.sourceSha256
  )
    throw new Error("Source size/SHA-256 mismatch.");
  console.log("Source SHA-256 verified. Splitting without requantization…");
  await run(["--split-max-size", config.shardMaxSize, original, join(staging, "kanana-q8")]);
  const names = (await readdir(staging)).filter((name) => name.endsWith(".gguf")).sort();
  if (names.length !== 3 || names[0] !== config.firstShard)
    throw new Error("Unexpected shard layout.");
  const files = [];
  let tensors = 0n;
  for (const name of names) {
    const path = join(staging, name);
    const handle = await open(path, "r");
    const header = Buffer.alloc(24);
    try {
      await handle.read(header, 0, 24, 0);
    } finally {
      await handle.close();
    }
    if (header.toString("ascii", 0, 4) !== "GGUF") throw new Error(`Invalid GGUF: ${name}`);
    tensors += header.readBigUInt64LE(8);
    files.push({ name, bytes: (await stat(path)).size, sha256: await digest(path) });
  }
  const sourceHandle = await open(original, "r");
  const sourceHeader = Buffer.alloc(24);
  try {
    await sourceHandle.read(sourceHeader, 0, 24, 0);
  } finally {
    await sourceHandle.close();
  }
  if (tensors !== sourceHeader.readBigUInt64LE(8)) throw new Error("Split tensor count mismatch.");
  await writeFile(
    join(staging, "manifest.json"),
    JSON.stringify({ ...config, tensors: Number(tensors), files }, null, 2) + "\n",
    { flag: "wx" },
  );
  await rename(staging, destination);
  console.log(JSON.stringify({ destination, tensors: Number(tensors), files }, null, 2));
} finally {
  // Only these freshly created, task-owned temporary directories are removed.
  await rm(scratch, { recursive: true, force: true });
  await rm(staging, { recursive: true, force: true });
}
