import { describe, expect, it } from "vitest";
import { createGitHubContentAdapter } from "./github-adapter.js";

describe("github adapter errors", () => {
  it.each([
    [401, "unauthorized"],
    [404, "missing-file"],
    [409, "stale-file"],
    [422, "validation-failure"],
    [429, "rate-limit"],
    [503, "temporary-connectivity"],
    [418, "unknown"],
  ] as const)("maps status %s", async (status, code) => {
    const adapter = createGitHubContentAdapter({
      owner: "me",
      repo: "blog",
      branch: "main",
      token: "token",
      fetchImpl: async () => new Response(JSON.stringify({ message: "error" }), { status }),
    });
    const result = await adapter.updateFile({
      path: "content/posts/a.mdx",
      content: "mine",
      expectedSha: "old",
      intent: "save-draft",
    });
    expect(!result.success && result.error.code).toBe(code);
    expect(!result.success && result.error.submittedContent).toBe("mine");
  });
});
