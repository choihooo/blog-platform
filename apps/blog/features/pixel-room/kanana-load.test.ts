import { afterEach, describe, expect, it, vi } from "vitest";
import type { Wllama } from "@wllama/wllama/esm/index.js";
import { loadKananaMeasured } from "./kanana-load";

afterEach(() => vi.restoreAllMocks());

function fixture(cached = true) {
  const blobs = [new Blob(["GGUF"]), new Blob(["GGUF"]), new Blob(["GGUF"])];
  const stored = { url: "/model.gguf", size: 12, open: vi.fn().mockResolvedValue(blobs) };
  const runtime = {
    modelManager: {
      cacheManager: { delete: vi.fn().mockResolvedValue(undefined) },
      getModels: vi.fn().mockResolvedValue(cached ? [stored] : []),
      downloadModel: vi.fn().mockResolvedValue(stored),
    },
    loadModel: vi.fn().mockResolvedValue(undefined),
  };
  return { stored, runtime, instance: runtime as unknown as Wllama, blobs };
}

describe("model load phase measurements", () => {
  it("reuses cache, reports complete progress, and preserves inference options", async () => {
    const { instance, runtime, blobs } = fixture();
    const times = [0, 5, 5, 7, 107];
    vi.spyOn(performance, "now").mockImplementation(() => times.shift()!);
    const options = { progressCallback: vi.fn(), n_ctx: 2048, n_gpu_layers: 99 };
    const timing = await loadKananaMeasured(instance, "/model.gguf", options);
    expect(timing).toEqual({
      source: "cache",
      cacheLookupMs: 5,
      downloadAndCacheMs: 0,
      cacheOpenMs: 2,
      runtimeAndGpuMs: 100,
      totalMs: 107,
      bytes: 12,
      shards: 3,
    });
    expect(runtime.modelManager.downloadModel).not.toHaveBeenCalled();
    expect(options.progressCallback).toHaveBeenCalledWith({ loaded: 12, total: 12 });
    expect(runtime.loadModel).toHaveBeenCalledWith(blobs, options);
  });

  it.each([false, true])(
    "measures download on cache miss or explicit refresh: %s",
    async (cached) => {
      const { instance, runtime } = fixture(cached);
      const times = [0, 5, 25, 27, 127];
      vi.spyOn(performance, "now").mockImplementation(() => times.shift()!);
      const timing = await loadKananaMeasured(instance, "/model.gguf", {}, cached);
      expect(timing.source).toBe("download");
      expect(timing.downloadAndCacheMs).toBe(20);
      expect(timing.runtimeAndGpuMs).toBe(100);
      expect(runtime.modelManager.downloadModel).toHaveBeenCalledOnce();
      if (cached) {
        const downloadedUrl = runtime.modelManager.downloadModel.mock.calls[0]![0];
        expect(downloadedUrl).toMatch(/^\/model\.gguf\?load-benchmark=/);
        expect(runtime.modelManager.cacheManager.delete).toHaveBeenCalledWith(downloadedUrl);
        expect(runtime.modelManager.cacheManager.delete).not.toHaveBeenCalledWith("/model.gguf");
      }
    },
  );

  it("does not start runtime after cancellation while opening cache", async () => {
    const { instance, stored, runtime } = fixture();
    const controller = new AbortController();
    stored.open.mockImplementation(async () => {
      controller.abort();
      return [];
    });
    await expect(
      loadKananaMeasured(instance, "/model.gguf", { signal: controller.signal }),
    ).rejects.toThrow();
    expect(runtime.loadModel).not.toHaveBeenCalled();
  });

  it("propagates download failure without reporting success or starting runtime", async () => {
    const { instance, runtime } = fixture(false);
    runtime.modelManager.downloadModel.mockRejectedValue(new Error("network failed"));
    await expect(loadKananaMeasured(instance, "/model.gguf", {})).rejects.toThrow("network failed");
    expect(runtime.loadModel).not.toHaveBeenCalled();
  });
});
