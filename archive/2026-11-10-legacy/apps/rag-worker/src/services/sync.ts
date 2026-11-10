import { embeddingText } from "@blog-platform/core/search";
import { corpus, embed, indexFor, profileFor } from "../retrieval";
export type SyncInput = { offset: number; slug?: string; revision?: unknown; dryRun?: unknown };
function syncResult<T>(body: T, status = 200) {
  return { status, body };
}
export async function syncPublished(
  input: SyncInput,
  env: Env,
  signal: AbortSignal,
  onStage?: (stage: string) => void,
) {
  const { offset } = input;
  onStage?.("corpus");
  const chunks = await corpus(env, input.slug);
  const version = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(chunks.map((c) => c.id).join("")),
  );
  const revision = Array.from(new Uint8Array(version), (b) => b.toString(16).padStart(2, "0")).join(
    "",
  );
  const contentHash = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(
      JSON.stringify(
        chunks.map((chunk) => ({
          key: chunk.key,
          title: chunk.title,
          url: chunk.url,
          text: embeddingText(chunk),
        })),
      ),
    ),
  );
  const contentRevision = Array.from(new Uint8Array(contentHash), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
  if (offset > 0 && input.revision !== revision)
    return syncResult({ error: "corpus_changed_restart_sync" }, 409);
  if (input.dryRun !== undefined && typeof input.dryRun !== "boolean")
    return syncResult({ error: "invalid_body" }, 400);
  if (input.dryRun === true)
    return syncResult({
      total: chunks.length,
      revision,
      contentRevision,
      profile: profileFor(env).id,
      requests: chunks.length,
      nextOffset: null,
    });
  const batch = chunks.slice(offset, offset + 16);
  onStage?.("vector_lookup");
  const existing = batch.length ? await indexFor(env).getByIds(batch.map((c) => c.id)) : [];
  const ids = new Set(existing.map((v) => v.id));
  const missing = batch.filter((c) => !ids.has(c.id));
  if (missing.length) {
    onStage?.("embedding");
    const values = await embed(env, missing.map(embeddingText), "RETRIEVAL_DOCUMENT", signal);
    onStage?.("vector_upsert");
    await indexFor(env).upsert(
      missing.map((c, i) => ({
        id: c.id,
        values: values[i]!,
        namespace: profileFor(env).namespace,
      })),
    );
  }
  return syncResult({
    indexed: missing.length,
    total: chunks.length,
    revision,
    contentRevision,
    nextOffset: offset + batch.length < chunks.length ? offset + batch.length : null,
  });
}
export type SyncResult = Awaited<ReturnType<typeof syncPublished>>;
