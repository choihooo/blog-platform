import { mkdtemp } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { createLocalContentAdapter } from "./local-adapter.js";

describe("local adapter createFile", () => {
  it("creates drafts and rejects duplicate paths", async () => {
    const adapter = createLocalContentAdapter(
      await mkdtemp(path.join(os.tmpdir(), "cms-adapter-")),
    );
    const input = {
      path: "db/posts/draft",
      content: "---\nstatus: draft\n---\nDraft",
      intent: "create-draft" as const,
    };
    const created = await adapter.createFile(input);
    expect(created.success && created.data.status).toBe("created");

    const duplicate = await adapter.createFile(input);
    expect(!duplicate.success && duplicate.error.code).toBe("duplicate-file");
  });
});
