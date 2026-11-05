import { readFile, writeFile } from "node:fs/promises";
import { parseArgs } from "node:util";
import { evaluateCase, summarizeEvaluation } from "./rag-evaluation.mjs";

const { values } = parseArgs({
  options: {
    endpoint: { type: "string" },
    cases: { type: "string" },
    output: { type: "string" },
    "corpus-revision": { type: "string" },
    "requests-per-minute": { type: "string" },
  },
});
if (!values.endpoint || !values.cases || !values.output || !values["corpus-revision"])
  throw new Error(
    "Provide --endpoint --cases --output --corpus-revision; this command makes live requests.",
  );
const endpoint = new URL(values.endpoint);
const rpm = Number(values["requests-per-minute"]);
if (
  !["http:", "https:"].includes(endpoint.protocol) ||
  endpoint.username ||
  endpoint.password ||
  endpoint.search ||
  endpoint.hash ||
  !["/api/rag", "/search", "/answer"].includes(endpoint.pathname) ||
  !Number.isFinite(rpm) ||
  rpm < 1 ||
  rpm > 30
)
  throw new Error("Invalid endpoint or --requests-per-minute (1..30 required)");
const direct = endpoint.pathname !== "/api/rag";
const token = direct ? process.env.RAG_SEARCH_TOKEN : undefined;
if (direct && !token)
  throw new Error("Direct Worker evaluation needs RAG_SEARCH_TOKEN in the environment");
const cases = JSON.parse(await readFile(values.cases, "utf8"));
if (
  !Array.isArray(cases) ||
  cases.length > 100 ||
  cases.some((c) => typeof c.id !== "string" || typeof c.query !== "string" || c.query.length > 600)
)
  throw new Error("Invalid evaluation cases");
const results = [];
const contexts = new Map();
for (const [index, item] of cases.entries()) {
  if (index) await new Promise((resolve) => setTimeout(resolve, Math.ceil(60000 / rpm)));
  if (direct && item.group === "follow-up") continue;
  let status = 0;
  let data = { sources: [] };
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: endpoint.origin,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        query: item.query,
        ...(item.contextFrom ? { context: contexts.get(item.contextFrom) } : {}),
      }),
      signal: AbortSignal.timeout(40000),
    });
    status = response.status;
    data = await response.json();
    if (status === 200 && Array.isArray(data.sources) && data.sources.length)
      contexts.set(item.id, {
        query: data.resolvedQuery ?? item.query,
        titles: [...new Set(data.sources.map((s) => s.title))].slice(0, 3),
      });
  } catch {
    /* Record an explicit failed measurement without provider errors. */
  }
  results.push(evaluateCase(item, data, status));
  if (status === 429) break;
}
const summary = summarizeEvaluation(results);
await writeFile(
  values.output,
  JSON.stringify(
    {
      corpusRevision: values["corpus-revision"],
      endpoint: endpoint.href,
      recordedAt: new Date().toISOString(),
      complete: results.length === cases.filter((c) => !direct || c.group !== "follow-up").length,
      summary,
      results,
    },
    null,
    2,
  ) + "\n",
);
console.log(JSON.stringify(summary));
if (
  summary.failures ||
  results.length !== cases.filter((c) => !direct || c.group !== "follow-up").length
)
  process.exitCode = 1;
