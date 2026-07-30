import { describe, expect, it } from "vitest";

import { ExistingPostPageView } from "./page";

const denied = {
  status: "unauthenticated" as const,
  reason: "login",
  nextAction: "sign-in" as const,
};

describe("ExistingPostPageView", () => {
  it("returns an access state for protected access", async () => {
    const view = await ExistingPostPageView({ decision: denied, slug: "hello-world" });
    expect(view).toBeTruthy();
  });
});
