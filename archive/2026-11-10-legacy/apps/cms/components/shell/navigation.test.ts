import { describe, expect, it } from "vitest";

import { getShellNavigation } from "./navigation";

describe("getShellNavigation", () => {
  it("marks posts active", () => {
    expect(getShellNavigation("/posts")[1]).toMatchObject({ id: "posts", state: "active" });
  });

  it("marks settings active", () => {
    expect(getShellNavigation("/settings")[3]).toMatchObject({
      id: "settings",
      state: "active",
    });
  });

  it("marks analytics active", () => {
    expect(getShellNavigation("/analytics")[2]).toMatchObject({
      id: "analytics",
      state: "active",
    });
  });

  it("keeps inactive items available", () => {
    expect(getShellNavigation("/")[0]).toMatchObject({ id: "dashboard", state: "active" });
    expect(getShellNavigation("/")[1]).toMatchObject({ id: "posts", state: "available" });
    expect(getShellNavigation("/")[2]).toMatchObject({ id: "analytics", state: "available" });
  });
});
