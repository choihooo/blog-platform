import { Wllama } from "@wllama/wllama/esm/index.js";
import { kananaModelUrl, PARALLEL_MODEL_DOWNLOADS } from "./kanana-model-source";

// Wllama detects the shard count from the first filename and caches each part.
export const MODEL_URL = kananaModelUrl(
  process.env.NODE_ENV,
  process.env.NEXT_PUBLIC_KANANA_MODEL_URL,
);
export function createKanana(onRuntimeLog?: (line: string) => void) {
  const record = (...args: unknown[]) => {
    const line = args.map(String).join(" ");
    if (/offload|WebGPU|adapter|backend|GPU buffer/i.test(line)) onRuntimeLog?.(line.slice(0, 500));
  };
  return new Wllama(
    { default: "/wasm/wllama.wasm" },
    {
      parallelDownloads: PARALLEL_MODEL_DOWNLOADS,
      suppressNativeLog: false,
      logger: { debug: record, log: record, warn: record, error: record },
    },
  );
}
