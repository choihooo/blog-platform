import type { Wllama } from "@wllama/wllama/esm/index.js";
import { ModelManager } from "@wllama/wllama/esm/index.js";

export type ModelLoadTiming = {
  source: "cache" | "download";
  cacheLookupMs: number;
  downloadAndCacheMs: number;
  cacheOpenMs: number;
  runtimeAndGpuMs: number;
  totalMs: number;
  bytes: number;
  shards: number;
};

type LoadOptions = Omit<NonNullable<Parameters<Wllama["loadModelFromUrl"]>[1]>, "useCache">;

/** Same public stages as Wllama.loadModelFromUrl, with explicit phase boundaries. */
export async function loadKananaMeasured(
  instance: Wllama,
  url: string,
  options: LoadOptions,
  forceDownload = false,
): Promise<ModelLoadTiming> {
  const start = performance.now();
  options.signal?.throwIfAborted();
  const cached = (await instance.modelManager.getModels()).find((model) => model.url === url);
  const lookupEnd = performance.now();
  options.signal?.throwIfAborted();
  const fromCache = Boolean(cached) && !forceDownload;
  // downloadModel also skips cached files internally. A fresh URL is necessary
  // for an actual download measurement; never delete the user's regular cache.
  const downloadUrl = forceDownload
    ? `${url}${url.includes("?") ? "&" : "?"}load-benchmark=${crypto.randomUUID()}`
    : url;
  try {
    const stored = fromCache
      ? cached!
      : await instance.modelManager.downloadModel(downloadUrl, options);
    const downloadEnd = performance.now();
    options.signal?.throwIfAborted();
    if (fromCache) options.progressCallback?.({ loaded: stored.size, total: stored.size });
    const blobs = await stored.open();
    const openEnd = performance.now();
    options.signal?.throwIfAborted();
    // Includes worker/WASM initialization, actual Blob reads, model parsing and GPU upload.
    // Blob opening alone does not measure all disk I/O, so this is not "GPU time" alone.
    await instance.loadModel(blobs, options);
    options.signal?.throwIfAborted();
    const end = performance.now();
    return {
      source: fromCache ? "cache" : "download",
      cacheLookupMs: Math.round(lookupEnd - start),
      downloadAndCacheMs: fromCache ? 0 : Math.round(downloadEnd - lookupEnd),
      cacheOpenMs: Math.round(openEnd - downloadEnd),
      runtimeAndGpuMs: Math.round(end - openEnd),
      totalMs: Math.round(end - start),
      bytes: stored.size,
      shards: blobs.length,
    };
  } finally {
    if (forceDownload) {
      // Only task-owned temporary URLs; normal model caches are untouched.
      await Promise.all(
        ModelManager.parseModelUrl(downloadUrl).map((shardUrl) =>
          instance.modelManager.cacheManager.delete(shardUrl).catch(() => {}),
        ),
      );
    }
  }
}
