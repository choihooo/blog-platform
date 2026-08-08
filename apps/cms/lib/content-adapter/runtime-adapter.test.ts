import { mkdtemp, readFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

import { createRuntimeContentAdapter } from "./runtime-adapter";

describe("createRuntimeContentAdapter", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
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
});
