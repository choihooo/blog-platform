import { describe, expect, it } from "vitest";

import { redactSecrets, secretFreeMessage } from "./secret-redaction";

describe("secret redaction", () => {
  it("redacts token, private key, preview secret, and auth secret values", () => {
    const privateKey = "-----BEGIN PRIVATE KEY-----\nabc123\n-----END PRIVATE KEY-----";
    const message = `token ghp_1234567890abcdef preview preview-secret auth auth-secret key ${privateKey}`;

    const result = redactSecrets(message, ["preview-secret", "auth-secret"]);

    expect(result).not.toContain("ghp_1234567890abcdef");
    expect(result).not.toContain("preview-secret");
    expect(result).not.toContain("auth-secret");
    expect(result).not.toContain("abc123");
    expect(result.match(/\[redacted\]/g)?.length).toBeGreaterThanOrEqual(4);
  });

  it("returns a safe fallback message", () => {
    expect(secretFreeMessage(undefined)).toBe("Operation failed.");
  });
});
