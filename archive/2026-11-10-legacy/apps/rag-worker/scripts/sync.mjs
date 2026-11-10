import { readFileSync } from "node:fs";
import { parseSyncOptions, runSync } from "./sync-options.mjs";

try {
  const options = parseSyncOptions(process.argv.slice(2));
  let token = process.env.RAG_ADMIN_TOKEN;
  if (!token) {
    const vars = readFileSync(new URL("../.dev.vars", import.meta.url), "utf8");
    token = /^RAG_ADMIN_TOKEN=(.+)$/m
      .exec(vars)?.[1]
      ?.trim()
      .replace(/^(["'])(.*)\1$/, "$2");
  }
  await runSync(options, token, { report: (result) => console.log(JSON.stringify(result)) });
} catch (error) {
  const message = error instanceof Error ? error.message : "sync_failed";
  console.error(
    message.startsWith("Sync stopped HTTP") ||
      /^(--|remote execution|resume requires|invalid_|Unknown or incomplete|endpoint must|RAG_ADMIN_TOKEN)/.test(
        message,
      )
      ? message
      : "Sync failed; check local configuration and connectivity.",
  );
  process.exitCode = 1;
}
