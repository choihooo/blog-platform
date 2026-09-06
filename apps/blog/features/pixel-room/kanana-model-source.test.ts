import { describe, expect, it, vi } from "vitest";
import config from "./kanana-model.json";
import { CHAT_MODEL } from "./chat-model";
import {
  kananaModelUrl,
  LOCAL_SPLIT_MODEL_URL,
  HOSTED_SPLIT_MODEL_URL,
  PARALLEL_MODEL_DOWNLOADS,
} from "./kanana-model-source";

const { construct } = vi.hoisted(() => ({ construct: vi.fn() }));
vi.mock("@wllama/wllama/esm/index.js", () => ({
  Wllama: class {
    constructor(...args: unknown[]) {
      construct(...args);
    }
  },
}));
import { createKanana } from "./kanana";

describe("Kanana split model configuration", () => {
  it("uses the original Kanana Q8 locally and in production", () => {
    expect(kananaModelUrl("development")).toBe(LOCAL_SPLIT_MODEL_URL);
    expect(CHAT_MODEL.name).toBe("Kanana 2 · 1.3B");
    expect(CHAT_MODEL.quantization).toBe("q8");
    expect(LOCAL_SPLIT_MODEL_URL).toMatch(/0b63b6b68f0c-v1\/kanana-q8-00001-of-00003\.gguf$/);
  });
  it("allows an explicit local override", () => {
    expect(kananaModelUrl("development", LOCAL_SPLIT_MODEL_URL)).toBe(LOCAL_SPLIT_MODEL_URL);
  });
  it("uses hosted shards in production with a pinned single-file rollback override", () => {
    expect(kananaModelUrl("production")).toBe(HOSTED_SPLIT_MODEL_URL);
    expect(HOSTED_SPLIT_MODEL_URL).toBe(
      `${config.publicModelBaseUrl}/${config.directory}/${config.firstShard}`,
    );
    expect(kananaModelUrl("production", config.sourceUrl)).toBe(config.sourceUrl);
    expect(kananaModelUrl("production", " /models/hosted-00001-of-00003.gguf ")).toBe(
      "/models/hosted-00001-of-00003.gguf",
    );
    expect(kananaModelUrl("production", " ")).toBe(HOSTED_SPLIT_MODEL_URL);
  });
  it("configures three simultaneous downloads without changing the runtime", () => {
    createKanana();
    expect(PARALLEL_MODEL_DOWNLOADS).toBe(3);
    expect(construct).toHaveBeenLastCalledWith(
      { default: "/wasm/wllama.wasm" },
      expect.objectContaining({ parallelDownloads: 3 }),
    );
  });
});
