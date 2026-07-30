import { describe, expect, it } from "vitest";

import { getShellNavigation } from "./navigation";

describe("getShellNavigation", () => {
  it("marks posts active", () => {
    expect(getShellNavigation("/posts")[0]).toMatchObject({ id: "posts", state: "active" });
  });

  it("marks settings active", () => {
    expect(getShellNavigation("/settings")[1]).toMatchObject({
      id: "settings",
      state: "active",
    });
  });

  it("keeps inactive items available", () => {
    expect(getShellNavigation("/")[0]).toMatchObject({ id: "posts", state: "available" });
  });
});
