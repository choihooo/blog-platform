import { describe, expect, it } from "vitest";
import { desktopReducer, clampPosition, resizeWindow, getWindowRect } from "./desktop-state";
describe("desktop window behavior", () => {
  it("opens a project once and brings it back from the dock", () => {
    let state = desktopReducer([], { type: "open", id: "kusting" });
    state = desktopReducer(state, { type: "minimize", id: "kusting" });
    expect(state[0]?.minimized).toBe(true);
    state = desktopReducer(state, { type: "open", id: "kusting" });
    expect(state).toHaveLength(1);
    expect(state[0]?.minimized).toBe(false);
  });
  it("orders windows by focus and closes only the requested window", () => {
    let state = desktopReducer([], { type: "open", id: "kusting" });
    state = desktopReducer(state, { type: "open", id: "comma" });
    state = desktopReducer(state, { type: "focus", id: "kusting" });
    expect(state.at(-1)?.id).toBe("kusting");
    state = desktopReducer(state, { type: "close", id: "kusting" });
    expect(state.map((w) => w.id)).toEqual(["comma"]);
  });
  it("maximizes reversibly and retains drag position", () => {
    let state = desktopReducer([], { type: "open", id: "about" });
    state = desktopReducer(state, { type: "move", id: "about", x: 125, y: 95 });
    state = desktopReducer(state, { type: "maximize", id: "about" });
    expect(state[0]?.maximized).toBe(true);
    state = desktopReducer(state, { type: "maximize", id: "about" });
    expect(state[0]).toMatchObject({ x: 125, y: 95, maximized: false });
  });
  it("keeps the complete window inside small and large workspaces", () => {
    expect(clampPosition(-50, 999, 390, 700, 340, 500)).toEqual({ x: 16, y: 184 });
    expect(clampPosition(9999, -10, 1664, 634, 720, 450)).toEqual({ x: 928, y: 16 });
  });
  it("retains each window's custom size through minimize, restore and maximize", () => {
    let state = desktopReducer([], { type: "open", id: "kusting" });
    state = desktopReducer(state, {
      type: "resize",
      id: "kusting",
      x: 80,
      y: 60,
      width: 900,
      height: 480,
    });
    state = desktopReducer(state, { type: "minimize", id: "kusting" });
    state = desktopReducer(state, { type: "open", id: "kusting" });
    state = desktopReducer(state, { type: "maximize", id: "kusting" });
    state = desktopReducer(state, { type: "maximize", id: "kusting" });
    expect(state[0]).toMatchObject({
      x: 80,
      y: 60,
      width: 900,
      height: 480,
      minimized: false,
      maximized: false,
    });
    expect(getWindowRect(state[0]!, { width: 1440, height: 800 })).toMatchObject({
      width: 900,
      height: 480,
    });
  });
  it("resizes opposing edges while preserving the anchored corner", () => {
    const rect = { x: 100, y: 80, width: 600, height: 400 },
      bounds = { width: 1200, height: 800 };
    expect(resizeWindow(rect, 80, 60, "se", bounds)).toEqual({
      x: 100,
      y: 80,
      width: 680,
      height: 460,
    });
    expect(resizeWindow(rect, -40, -30, "nw", bounds)).toEqual({
      x: 60,
      y: 50,
      width: 640,
      height: 430,
    });
    expect(resizeWindow(rect, 30, 0, "w", bounds)).toEqual({
      x: 130,
      y: 80,
      width: 570,
      height: 400,
    });
  });
  it("enforces a usable minimum and keeps resize inside the workspace", () => {
    const rect = { x: 100, y: 80, width: 600, height: 400 },
      bounds = { width: 1200, height: 800 };
    expect(resizeWindow(rect, -999, -999, "se", bounds)).toEqual({
      x: 100,
      y: 80,
      width: 320,
      height: 220,
    });
    expect(resizeWindow(rect, 9999, 9999, "se", bounds)).toEqual({
      x: 100,
      y: 80,
      width: 1084,
      height: 704,
    });
    expect(resizeWindow(rect, -999, -999, "nw", bounds)).toEqual({
      x: 16,
      y: 16,
      width: 684,
      height: 464,
    });
    const small = getWindowRect(rect, { width: 390, height: 600 });
    expect(small.width).toBeLessThanOrEqual(358);
    expect(small.x + small.width).toBeLessThanOrEqual(374);
  });
});
