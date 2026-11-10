// @vitest-environment jsdom
import { act, type PointerEvent } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { useDesktopWorkspace } from "./use-desktop-workspace";
let state: ReturnType<typeof useDesktopWorkspace>, container: HTMLDivElement, root: Root;
function Harness() {
  state = useDesktopWorkspace();
  return (
    <div ref={state.workspaceRef}>
      <button data-shortcut="demo" onClick={() => state.openShortcut("demo")}>
        Open
      </button>
      {state.windows
        .filter((w) => !w.minimized)
        .map((w) => (
          <section key={w.id} tabIndex={-1} data-window={w.id}>
            <button onClick={() => state.close(w.id)}>Close</button>
          </section>
        ))}
      <button data-dock-window="demo" onClick={() => state.open("demo")}>
        Restore
      </button>
    </div>
  );
}
beforeEach(async () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  await act(async () => root.render(<Harness />));
});
afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  vi.unstubAllGlobals();
});
it("returns focus to the launcher or dock when closing or minimizing a window", async () => {
  await act(async () => container.querySelector<HTMLButtonElement>("[data-shortcut]")!.click());
  expect(document.activeElement).toBe(container.querySelector("[data-window]"));
  await act(async () => state.minimize("demo"));
  expect(document.activeElement).toBe(container.querySelector("[data-dock-window]"));
  await act(async () => state.open("demo"));
  await act(async () => state.close("demo"));
  expect(document.activeElement).toBe(container.querySelector("[data-shortcut]"));
});
it("suppresses drag clicks after five pixels but allows clicks and cancelled new drags", async () => {
  const target = container.querySelector<HTMLButtonElement>("[data-shortcut]")!;
  target.setPointerCapture = () => {};
  const event = (x: number) =>
    ({
      button: 0,
      clientX: x,
      clientY: 0,
      pointerId: 1,
      currentTarget: target,
      target,
    }) as unknown as PointerEvent<HTMLElement>;
  await act(async () => {
    state.startDrag(event(0), "icon", "demo", { x: 100, y: 100 });
    state.moveDrag(event(3));
    state.endDrag();
    state.openShortcut("demo");
  });
  expect(state.windows).toHaveLength(1);
  await act(async () => state.close("demo"));
  await act(async () => {
    state.startDrag(event(0), "icon", "demo", { x: 100, y: 100 });
    state.moveDrag(event(8));
    state.endDrag();
    state.openShortcut("demo");
  });
  expect(state.windows).toHaveLength(0);
  await act(async () => {
    state.startDrag(event(0), "icon", "demo", { x: 100, y: 100 });
    state.cancelDrag();
    state.openShortcut("demo");
  });
  expect(state.windows).toHaveLength(1);
});
