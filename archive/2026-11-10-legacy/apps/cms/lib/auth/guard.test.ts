import { describe, expect, it, vi } from "vitest";

import { decideAccess, evaluateAccess } from "./guard";
import type { AdminIdentity, CmsSession } from "./types";

const admin: AdminIdentity = {
  githubLogin: "ho",
  githubUserId: "123",
  sourcePath: "content/site.json",
};

const session: CmsSession = {
  githubLogin: "ho",
  githubUserId: "123",
  expiresAt: "2099-01-01T00:00:00.000Z",
};

describe("decideAccess", () => {
  it("authorizes matching login and user id", () => {
    expect(decideAccess({ session, adminIdentity: admin })).toMatchObject({
      status: "authorized",
      nextAction: "continue",
    });
  });

  it("requires a session", () => {
    expect(decideAccess({ adminIdentity: admin })).toMatchObject({
      status: "unauthenticated",
      nextAction: "sign-in",
    });
  });

  it("rejects expired sessions", () => {
    expect(
      decideAccess({
        session: { ...session, expiresAt: "2000-01-01T00:00:00.000Z" },
        adminIdentity: admin,
      }),
    ).toMatchObject({ status: "expired" });
  });

  it("rejects mismatched login or user id", () => {
    expect(
      decideAccess({ session: { ...session, githubLogin: "other" }, adminIdentity: admin }),
    ).toMatchObject({ status: "forbidden" });
    expect(
      decideAccess({ session: { ...session, githubUserId: "999" }, adminIdentity: admin }),
    ).toMatchObject({ status: "forbidden" });
  });

  it("fails closed without admin identity", () => {
    expect(decideAccess({ session, adminError: "missing config" })).toMatchObject({
      status: "misconfigured",
      nextAction: "fix-site-config",
    });
  });
});

describe("evaluateAccess", () => {
  it("allows local development bypass only when explicitly enabled", async () => {
    const previousNodeEnv = process.env.NODE_ENV;
    const previousBypass = process.env.CMS_DEV_BYPASS_AUTH;
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("CMS_DEV_BYPASS_AUTH", "1");

    try {
      await expect(evaluateAccess(null, "/missing-root")).resolves.toMatchObject({
        status: "authorized",
        session: { githubLogin: "dev-admin", githubUserId: "dev" },
      });
    } finally {
      vi.stubEnv("NODE_ENV", previousNodeEnv);
      vi.stubEnv("CMS_DEV_BYPASS_AUTH", previousBypass);
    }
  });
});
