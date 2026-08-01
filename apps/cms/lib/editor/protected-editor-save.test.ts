import { describe, expect, it, vi } from "vitest";

import type { ContentAdapter } from "../content-adapter/index";
import { createProtectedContentOperations } from "../auth/index";

describe("protected editor save", () => {
  it("does not call adapter writes when unauthorized", async () => {
    const adapter = {
      createFile: vi.fn(),
      updateFile: vi.fn(),
    } as unknown as ContentAdapter;
    const operations = createProtectedContentOperations(adapter, () => ({
      status: "unauthenticated",
      reason: "login",
      nextAction: "sign-in",
    }));

    await operations.createFile({
      path: "db/posts/a",
      content: "x",
      intent: "create-draft",
    });
    expect(adapter.createFile).not.toHaveBeenCalled();
  });
});
