import { generateKeyPairSync } from "node:crypto";
import { describe, expect, it } from "vitest";

import { getGitHubAppInstallationToken } from "./github-app-token";

const privateKey = generateKeyPairSync("rsa", { modulusLength: 2048 }).privateKey.export({
  type: "pkcs8",
  format: "pem",
}) as string;

const env = {
  GITHUB_APP_ID: "1",
  GITHUB_APP_PRIVATE_KEY: privateKey,
  GITHUB_INSTALLATION_ID: "99",
};

describe("GitHub App installation token", () => {
  it("returns missing-config when required env is absent", async () => {
    await expect(getGitHubAppInstallationToken({ env: {} })).resolves.toMatchObject({
      status: "failure",
      error: { code: "missing-config", retryable: false },
    });
  });

  it.each([
    [401, "unauthorized"],
    [403, "unauthorized"],
    [429, "rate-limit"],
  ] as const)("normalizes status %s", async (status, code) => {
    const result = await getGitHubAppInstallationToken({
      env,
      fetchImpl: async () => new Response(JSON.stringify({ message: "bad token" }), { status }),
    });

    expect(result).toMatchObject({ status: "failure", error: { code } });
  });

  it("returns invalid-config for invalid private keys and malformed ready responses", async () => {
    await expect(
      getGitHubAppInstallationToken({
        env: { ...env, GITHUB_APP_PRIVATE_KEY: "bad-key" },
      }),
    ).resolves.toMatchObject({ status: "failure", error: { code: "invalid-config" } });

    await expect(
      getGitHubAppInstallationToken({
        env,
        fetchImpl: async () => new Response(JSON.stringify({}), { status: 201 }),
      }),
    ).resolves.toMatchObject({ status: "failure", error: { code: "invalid-config" } });
  });

  it("returns a ready installation token", async () => {
    await expect(
      getGitHubAppInstallationToken({
        env,
        fetchImpl: async () =>
          new Response(
            JSON.stringify({ token: "installation-token", expires_at: "2026-07-30T00:30:00Z" }),
            {
              status: 201,
            },
          ),
      }),
    ).resolves.toMatchObject({
      status: "ready",
      token: "installation-token",
      expiresAt: "2026-07-30T00:30:00Z",
    });
  });
});
