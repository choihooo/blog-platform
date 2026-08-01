import { mkdtemp, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { createLocalContentAdapter } from "./local-adapter.js";

describe("local adapter conflicts", () => {
  it("rejects stale updates and deletes", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "cms-adapter-"));
    const adapter = createLocalContentAdapter(root);
    const repoPath = "db/posts/draft";
    await adapter.createFile({ path: repoPath, content: "old", intent: "create-draft" });
    const read = await adapter.readFile({ path: repoPath });
    if (!read.success) throw new Error("read failed");
    await writeFile(path.join(root, repoPath), "external");

    const update = await adapter.updateFile({
      path: repoPath,
      content: "mine",
      expectedSha: read.data.file.sha,
      intent: "save-draft",
    });
    expect(!update.success && update.error.code).toBe("stale-file");

    const remove = await adapter.deleteFile({
      path: repoPath,
      expectedSha: read.data.file.sha,
      intent: "delete-file",
    });
    expect(!remove.success && remove.error.code).toBe("stale-file");
  });
});
