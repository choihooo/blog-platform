import { describe, expect, it, vi } from "vitest";

import { guardMutation } from "./mutation-guard";
import type { AccessDecision } from "./types";

describe("protected mutation contract", () => {
  it("maps unauthorized states without calling adapter operations", async () => {
    const cases: Array<[AccessDecision, string]> = [
      [{ status: "unauthenticated", reason: "login", nextAction: "sign-in" }, "auth-required"],
      [{ status: "expired", reason: "expired", nextAction: "sign-in" }, "session-expired"],
      [{ status: "forbidden", reason: "forbidden", nextAction: "sign-out-and-retry" }, "forbidden"],
      [
        { status: "misconfigured", reason: "config", nextAction: "fix-site-config" },
        "auth-misconfigured",
      ],
    ];

    for (const [decision, code] of cases) {
      const operation = vi.fn(async () => ({ success: true }));
      await expect(guardMutation(decision, operation)).resolves.toMatchObject({ ok: false, code });
      expect(operation).not.toHaveBeenCalled();
    }
  });
});
