import { describe, expect, it } from "vitest";

import { toCmsSession } from "./session";

describe("toCmsSession", () => {
  it("accepts a validated NextAuth session when Server Components omit expires", () => {
    expect(
      toCmsSession(
        {
          githubLogin: "choihooo",
          githubUserId: "67588757",
        },
        new Date("2026-07-31T00:00:00.000Z"),
      ),
    ).toMatchObject({
      githubLogin: "choihooo",
      githubUserId: "67588757",
      expiresAt: "2026-07-31T00:01:00.000Z",
    });
  });

  it("still rejects sessions without the required GitHub identity", () => {
    expect(toCmsSession({ githubUserId: "67588757" })).toBeNull();
    expect(toCmsSession({ githubLogin: "choihooo" })).toBeNull();
  });
});
