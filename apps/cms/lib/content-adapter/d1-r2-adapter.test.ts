import { afterEach, describe, expect, it, vi } from "vitest";

import { createD1R2ContentAdapter } from "./d1-r2-adapter";

describe("createD1R2ContentAdapter", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
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
