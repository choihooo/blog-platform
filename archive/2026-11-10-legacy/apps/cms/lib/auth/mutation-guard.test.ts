import { describe, expect, it, vi } from "vitest";

import { guardMutation } from "./mutation-guard";
import type { AccessDecision } from "./types";

const unauthorized: AccessDecision[] = [
  { status: "unauthenticated", reason: "login", nextAction: "sign-in" },
  { status: "expired", reason: "expired", nextAction: "sign-in" },
  { status: "forbidden", reason: "no", nextAction: "sign-out-and-retry" },
  { status: "misconfigured", reason: "config", nextAction: "fix-site-config" },
];

const authorized: AccessDecision = {
  status: "authorized",
  nextAction: "continue",
  adminIdentity: { githubLogin: "ho", githubUserId: "1", sourcePath: "content/site.json" },
  session: { githubLogin: "ho", githubUserId: "1", expiresAt: "2099-01-01T00:00:00.000Z" },
};

describe("guardMutation", () => {
  it("does not run operations for unauthorized decisions", async () => {
    for (const decision of unauthorized) {
      const operation = vi.fn(async () => "changed");
      await expect(guardMutation(decision, operation)).resolves.toMatchObject({ ok: false });
      expect(operation).not.toHaveBeenCalled();
    }
  });

  it("runs operations for authorized decisions", async () => {
    const operation = vi.fn(async () => "changed");
    await expect(guardMutation(authorized, operation)).resolves.toEqual({
      ok: true,
      value: "changed",
    });
    expect(operation).toHaveBeenCalledOnce();
  });
});
