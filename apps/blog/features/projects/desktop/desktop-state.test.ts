import { describe, expect, it } from "vitest";
import { desktopReducer, clampPosition } from "./desktop-state";
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
});
