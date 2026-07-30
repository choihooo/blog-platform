import { describe, expect, it, vi } from "vitest";

import { authOptions } from "./config";

describe("authOptions callbacks", () => {
  it("uses the immutable provider account id for the GitHub user id", async () => {
    const token = await authOptions.callbacks?.jwt?.({
      token: {},
      account: {
        provider: "github",
        type: "oauth",
        providerAccountId: "67588757",
      },
      profile: {
        id: 67588757,
        login: "choihooo",
      } as never,
      user: {
        id: "67588757",
        email: "admin@example.com",
        emailVerified: null,
      },
      trigger: "signIn",
      isNewUser: false,
    });

    expect(token).toMatchObject({
      githubLogin: "choihooo",
      githubUserId: "67588757",
    });
  });

  it("falls back to the JWT subject when restoring the session", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const session = await authOptions.callbacks?.session?.({
      session: {
        user: {},
        expires: "2099-01-01T00:00:00.000Z",
      },
      token: {
        githubLogin: "choihooo",
        sub: "67588757",
      },
      user: {
        id: "67588757",
        email: "admin@example.com",
        emailVerified: null,
      },
      newSession: undefined,
      trigger: "update",
    });

    expect(session).toMatchObject({
      githubLogin: "choihooo",
      githubUserId: "67588757",
    });
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });
});
