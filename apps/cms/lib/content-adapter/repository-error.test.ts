import { describe, expect, it } from "vitest";

import { normalizeHttpFailure, repositoryFailure } from "./repository-error";

describe("repository failure redaction", () => {
  it("redacts GitHub token and private key values from messages", () => {
    const privateKey = "-----BEGIN PRIVATE KEY-----\nabc123\n-----END PRIVATE KEY-----";
    const failure = repositoryFailure("unauthorized", {
      message: `bad ghp_1234567890abcdef ${privateKey} preview-secret`,
      secrets: ["preview-secret"],
    });

    expect(failure.message).not.toContain("ghp_1234567890abcdef");
    expect(failure.message).not.toContain("abc123");
    expect(failure.message).not.toContain("preview-secret");
  });

  it("redacts HTTP failure messages", () => {
    const failure = normalizeHttpFailure(403, {
      message: "token github_pat_1234567890abcdef and auth-secret failed",
      secrets: ["auth-secret"],
    });

    expect(failure.message).not.toContain("github_pat_1234567890abcdef");
    expect(failure.message).not.toContain("auth-secret");
  });
});
