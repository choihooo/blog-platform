import { mkdtemp } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { createLocalContentAdapter } from "./local-adapter.js";

describe("media commits", () => {
  it("writes only approved media paths", async () => {
    const adapter = createLocalContentAdapter(
      await mkdtemp(path.join(os.tmpdir(), "cms-adapter-")),
    );
    const created = await adapter.commitMedia({
      path: "public/media/posts/a.webp",
      contentBase64: "aW1hZ2U=",
      intent: "save-media",
    });
    expect(created.success && created.data.status).toBe("created");

    const invalid = await adapter.commitMedia({
      path: "content/posts/a.mdx",
      contentBase64: "aW1hZ2U=",
      intent: "save-media",
    });
    expect(!invalid.success && invalid.error.code).toBe("validation-failure");
  });
});
