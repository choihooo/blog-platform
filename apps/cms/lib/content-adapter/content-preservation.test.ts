import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { createLocalContentAdapter } from "./local-adapter.js";

describe("failed write preservation", () => {
  it("keeps submitted content on failures", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "cms-adapter-"));
    await mkdir(path.join(root, "db/posts"), { recursive: true });
    await writeFile(path.join(root, "db/posts/a"), "a");
    const adapter = createLocalContentAdapter(root);

    const duplicate = await adapter.createFile({
      path: "db/posts/a",
      content: "mine",
      intent: "create-draft",
    });
    expect(!duplicate.success && duplicate.error.submittedContent).toBe("mine");

    const media = await adapter.commitMedia({
      path: "db/posts/nope",
      contentBase64: "bWluZQ==",
      intent: "save-media",
    });
    expect(!media.success && media.error.submittedContent).toBe("bWluZQ==");
  });
});
