import { mkdtemp } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { createLocalContentAdapter } from "./local-adapter.js";

describe("local adapter updateFile", () => {
  it("updates only with an expected sha", async () => {
    const adapter = createLocalContentAdapter(
      await mkdtemp(path.join(os.tmpdir(), "cms-adapter-")),
    );
    await adapter.createFile({
      path: "db/posts/draft",
      content: "old",
      intent: "create-draft",
    });
    const read = await adapter.readFile({ path: "db/posts/draft" });
    if (!read.success) throw new Error("read failed");

    const updated = await adapter.updateFile({
      path: "db/posts/draft",
      content: "new",
      expectedSha: read.data.file.sha,
      intent: "save-draft",
    });
    expect(updated.success && updated.data.status).toBe("updated");

    const missingSha = await adapter.updateFile({
      path: "db/posts/draft",
      content: "x",
      expectedSha: "",
      intent: "save-draft",
    });
    expect(!missingSha.success && missingSha.error.code).toBe("validation-failure");
  });
});
