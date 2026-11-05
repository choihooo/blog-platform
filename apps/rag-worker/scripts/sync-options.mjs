export function parseSyncOptions(argv) {
  const flags = new Set(["--execute", "--allow-remote"]);
  const values = new Set(["--endpoint", "--requests-per-minute", "--offset", "--revision"]);
  const options = {};
  for (let i = 0; i < argv.length; i++) {
    const name = argv[i];
    if (flags.has(name)) options[name] = true;
    else if (values.has(name) && argv[i + 1] !== undefined) options[name] = argv[++i];
    else throw new Error(`Unknown or incomplete sync option: ${name}`);
  }
  const url = new URL(options["--endpoint"] ?? "http://127.0.0.1:8787");
  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    url.pathname !== "/"
  )
    throw new Error("endpoint must be a bare HTTP(S) origin");
  const execute = options["--execute"] === true;
  const requestsPerMinute = Number(options["--requests-per-minute"] ?? 0);
  if (
    !Number.isFinite(requestsPerMinute) ||
    requestsPerMinute < 0 ||
    requestsPerMinute > 60000 ||
    (execute && requestsPerMinute < 1)
  )
    throw new Error("--requests-per-minute must be 1..60000 for execution");
  if (
    execute &&
    !["127.0.0.1", "localhost", "[::1]"].includes(url.hostname) &&
    !options["--allow-remote"]
  )
    throw new Error("remote execution requires --allow-remote");
  const offset = Number(options["--offset"] ?? 0);
  const revision = options["--revision"];
  if (!Number.isInteger(offset) || offset < 0 || offset > 100000) throw new Error("invalid_offset");
  if (offset && !revision) throw new Error("resume requires --revision");
  return { endpoint: url.origin, execute, requestsPerMinute, offset, revision };
}

export async function runSync(
  options,
  token,
  {
    fetcher = fetch,
    sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
    report = () => {},
  } = {},
) {
  if (!token) throw new Error("RAG_ADMIN_TOKEN required");
  let offset = options.offset;
  let revision = options.revision;
  let result;
  do {
    const response = await fetcher(`${options.endpoint}/sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ offset, revision, dryRun: !options.execute }),
      signal: AbortSignal.timeout(300000),
    });
    if (!response.ok)
      throw new Error(
        `Sync stopped HTTP ${response.status}: offset=${offset} revision=${revision ?? "none"}. Resume this page; restart offset 0 after 409.`,
      );
    result = await response.json();
    if (
      !Number.isInteger(result.total) ||
      result.total < 0 ||
      typeof result.revision !== "string" ||
      !result.revision ||
      (revision && revision !== result.revision)
    )
      throw new Error("invalid_sync_response");
    if (
      options.execute &&
      result.nextOffset !== null &&
      (!Number.isInteger(result.nextOffset) ||
        result.nextOffset <= offset ||
        result.nextOffset > result.total)
    )
      throw new Error("invalid_sync_cursor");
    report({
      indexed: result.indexed,
      total: result.total,
      nextOffset: result.nextOffset,
      revision: result.revision,
      profile: result.profile,
      requests: result.requests,
    });
    if (!options.execute || result.nextOffset === null) return result;
    const pageSize = result.nextOffset - offset;
    offset = result.nextOffset;
    revision = result.revision;
    await sleep(Math.ceil((pageSize * 60000) / options.requestsPerMinute));
  } while (offset !== null);
  return result;
}
