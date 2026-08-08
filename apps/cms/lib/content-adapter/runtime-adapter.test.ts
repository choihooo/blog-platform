import { mkdtemp, readFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

import { createRuntimeContentAdapter } from "./runtime-adapter";

describe("createRuntimeContentAdapter", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("uses local media storage in development when R2 upload credentials are absent", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("CLOUDFLARE_ACCOUNT_ID", "");
    vi.stubEnv("R2_ACCESS_KEY_ID", "");
    vi.stubEnv("CLOUDFLARE_R2_ACCESS_KEY_ID", "");
    vi.stubEnv("R2_SECRET_ACCESS_KEY", "");
    vi.stubEnv("CLOUDFLARE_R2_SECRET_ACCESS_KEY", "");
    vi.stubEnv("R2_BUCKET", "");
    vi.stubEnv("CLOUDFLARE_R2_BUCKET", "");

    const root = await mkdtemp(path.join(os.tmpdir(), "cms-runtime-adapter-"));
    const adapter = await createRuntimeContentAdapter(root);
    const result = await adapter.commitMedia({
      path: "public/media/covers/hello.webp",
      contentBase64: Buffer.from("image").toString("base64"),
      intent: "save-media",
    });

    expect(result.success && result.data.path).toBe("public/media/covers/hello.webp");
    await expect(readFile(path.join(root, "public/media/covers/hello.webp"), "utf8")).resolves.toBe(
      "image",
    );
  });

  it("uploads media to R2 when upload credentials are configured", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("CLOUDFLARE_ACCOUNT_ID", "account");
    vi.stubEnv("R2_ACCESS_KEY_ID", "key");
    vi.stubEnv("R2_SECRET_ACCESS_KEY", "secret");
    vi.stubEnv("R2_BUCKET", "bucket");
    vi.stubEnv("R2_PUBLIC_URL", "https://assets.example.com");
    const fetchMock = vi.fn(async () => new Response(null, { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const adapter = await createRuntimeContentAdapter(process.cwd());
    const result = await adapter.commitMedia({
      path: "public/media/covers/hello.webp",
      contentBase64: Buffer.from("image").toString("base64"),
      intent: "save-media",
    });

    expect(result.success && result.data.path).toBe(
      "https://assets.example.com/media/covers/hello.webp",
    );
    expect(fetchMock).toHaveBeenCalledWith(
      "https://account.r2.cloudflarestorage.com/bucket/media/covers/hello.webp",
      expect.objectContaining({
        method: "PUT",
        headers: expect.objectContaining({
          "content-type": "image/webp",
        }),
      }),
    );
  });
});
