// @vitest-environment jsdom
import { act, StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, expect, it, vi } from "vitest";
import { useMediaQuery } from "./use-media-query";
afterEach(() => vi.unstubAllGlobals());
function Harness({ query = "a" }: { query?: string }) {
  const state = useMediaQuery(query, true);
  return (
    <p>
      {String(state.matches)}:{String(state.ready)}
    </p>
  );
}
function setup() {
  const listeners = new Map<string, Set<() => void>>();
  const values = new Map([
    ["a", false],
    ["b", true],
  ]);
  vi.stubGlobal("matchMedia", (query: string) => ({
    get matches() {
      return values.get(query);
    },
    addEventListener(_type: string, cb: () => void) {
      if (!listeners.has(query)) listeners.set(query, new Set());
      listeners.get(query)!.add(cb);
    },
    removeEventListener(_type: string, cb: () => void) {
      listeners.get(query)?.delete(cb);
    },
  }));
  return { listeners, values };
}
it("keeps the server snapshot on hydration then updates from browser preferences", async () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  setup();
  const container = document.createElement("div");
  container.innerHTML = renderToString(<Harness />);
  expect(container.textContent).toBe("true:false");
  let root: ReturnType<typeof hydrateRoot>;
  await act(async () => {
    root = hydrateRoot(container, <Harness />);
  });
  expect(container.textContent).toBe("false:true");
  await act(async () => root.unmount());
});
it("resubscribes on query changes and cleans Strict Mode listeners", async () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  const { listeners, values } = setup();
  const container = document.createElement("div"),
    root = createRoot(container);
  await act(async () =>
    root.render(
      <StrictMode>
        <Harness />
      </StrictMode>,
    ),
  );
  expect(listeners.get("a")?.size).toBe(1);
  values.set("a", true);
  await act(async () => listeners.get("a")!.forEach((cb) => cb()));
  expect(container.textContent).toBe("true:true");
  await act(async () =>
    root.render(
      <StrictMode>
        <Harness query="b" />
      </StrictMode>,
    ),
  );
  expect(listeners.get("a")?.size).toBe(0);
  await act(async () => root.unmount());
  expect(listeners.get("b")?.size).toBe(0);
});
