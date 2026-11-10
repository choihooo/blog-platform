import { afterEach, describe, expect, it, vi } from "vitest";

import { createD1R2ContentAdapter } from "./d1-content-store.js";

describe("createD1R2ContentAdapter", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("reports missing storage configuration as failure, not an empty catalog or missing post", async () => {
    vi.stubGlobal("D1_DATABASE", undefined);
    for (const key of [
      "D1_DATABASE",
      "CLOUDFLARE_ACCOUNT_ID",
      "CLOUDFLARE_D1_PROXY_URL",
      "CLOUDFLARE_D1_PROXY_TOKEN",
    ])
      vi.stubEnv(key, "");
    const adapter = createD1R2ContentAdapter();
    for (const result of await Promise.all([
      adapter.listPosts({ publishedOnly: true, page: 1, limit: 8 }),
      adapter.getPostBySlug("hello"),
      adapter.listCategories({ depth: 1 }),
    ]))
      expect(result).toMatchObject({ ok: false, error: { code: "storage-failure" } });
  });

  it("returns storage failures instead of throwing when read queries fail", async () => {
    vi.stubGlobal("D1_DATABASE", {
      prepare: () => ({
        bind: () => ({
          all: async () => {
            throw new Error("D1 unavailable");
          },
          first: async () => {
            throw new Error("D1 unavailable");
          },
          run: async () => undefined,
        }),
        all: async () => {
          throw new Error("D1 unavailable");
        },
        first: async () => {
          throw new Error("D1 unavailable");
        },
        run: async () => undefined,
      }),
    });

    const adapter = createD1R2ContentAdapter();

    await expect(
      adapter.listPosts({ publishedOnly: true, page: 1, limit: 100 }),
    ).resolves.toMatchObject({
      ok: false,
      error: { code: "storage-failure", message: "D1 unavailable", retryable: true },
    });
    await expect(adapter.listCategories({ depth: 1 })).resolves.toMatchObject({
      ok: false,
      error: { code: "storage-failure", message: "D1 unavailable", retryable: true },
    });
    await expect(adapter.listTags()).resolves.toMatchObject({
      ok: false,
      error: { code: "storage-failure", message: "D1 unavailable", retryable: true },
    });
    await expect(adapter.getPostBySlug("hello-world")).resolves.toMatchObject({
      ok: false,
      error: { code: "storage-failure", message: "D1 unavailable", retryable: true },
    });
  });
});
