import { readFileSync } from "node:fs";

// A local application secret, NOT the Wrangler OAuth credential.
const vars = readFileSync(new URL("../.dev.vars", import.meta.url), "utf8");
const token = /^RAG_ADMIN_TOKEN=(.+)$/m.exec(vars)?.[1]?.trim();
if (!token) throw new Error("RAG_ADMIN_TOKEN missing in .dev.vars");
const endpoint = process.env.RAG_API_URL ?? "http://127.0.0.1:8787";
let offset = 0;
let revision;
do {
  const response = await fetch(`${endpoint}/sync`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ offset, revision }),
    signal: AbortSignal.timeout(60_000),
  });
  if (!response.ok) throw new Error(`Sync failed: ${response.status}. Retry from offset 0.`);
  const result = await response.json();
  console.log(
    JSON.stringify({ indexed: result.indexed, total: result.total, nextOffset: result.nextOffset }),
  );
  offset = result.nextOffset;
  revision = result.revision;
} while (offset !== null);
