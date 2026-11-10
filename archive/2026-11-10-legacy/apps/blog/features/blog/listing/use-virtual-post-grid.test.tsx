// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useVirtualPostGrid } from "./use-virtual-post-grid";
import type { PostSummary } from "../model/post-summary";
let state: ReturnType<typeof useVirtualPostGrid>, root: Root;
let trigger: IntersectionObserverCallback, finish: (() => void)[], stopped: boolean;
const posts: PostSummary[] = Array.from({ length: 24 }, (_, i) => ({
  slug: "p" + i,
  title: "P" + i,
  publishedAt: "",
  readingTimeLabel: "",
  tagEntries: [],
}));
function Harness() {
  state = useVirtualPostGrid(posts);
  return (
    <>
      <div ref={state.listRef} />
      <div ref={state.sentinelRef} />
    </>
  );
}
beforeEach(async () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  vi.useFakeTimers();
  finish = [];
  stopped = false;
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  vi.spyOn(window, "scrollBy").mockImplementation(() => {});
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      constructor(cb: IntersectionObserverCallback) {
        trigger = cb;
      }
      observe() {}
      disconnect() {
        stopped = true;
      }
    },
  );
  vi.stubGlobal(
    "Image",
    class {
      decode() {
        return new Promise<void>((resolve) => finish.push(resolve));
      }
    },
  );
  vi.stubGlobal("matchMedia", () => ({ matches: false }));
  Object.defineProperty(document.documentElement, "scrollHeight", {
    configurable: true,
    value: 2000,
  });
  root = createRoot(document.createElement("div"));
  await act(async () => root.render(<Harness />));
});
afterEach(async () => {
  await act(async () => root.unmount());
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});
async function intersect() {
  await act(async () =>
    trigger([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver),
  );
}
describe("progressive virtual list", () => {
  it("clears the pending deadline and ignores late decoding after unmount", async () => {
    await intersect();
    const previousImages = [...finish];
    expect(state.loading).toBe(true);
    await act(async () => root.unmount());
    expect(vi.getTimerCount()).toBe(0);
    root = createRoot(document.createElement("div"));
    await act(async () => root.render(<Harness />));
    await act(async () => {
      previousImages.forEach((resolve) => resolve());
      await vi.advanceTimersByTimeAsync(1500);
    });
    expect(state.visible).toBe(8);
    expect(state.loading).toBe(false);
  });
  it("does not block the next batch when image decoding fails", async () => {
    vi.stubGlobal(
      "Image",
      class {
        decode() {
          return Promise.reject(new Error("broken thumbnail"));
        }
      },
    );
    await intersect();
    expect(state.visible).toBe(16);
    expect(state.loading).toBe(false);
  });
  it("waits at most 1.5 seconds and requires further scrolling before another batch", async () => {
    expect(state.visible).toBe(8);
    await intersect();
    expect(state.loading).toBe(true);
    await act(async () => vi.advanceTimersByTimeAsync(1499));
    expect(state.visible).toBe(8);
    await act(async () => vi.advanceTimersByTimeAsync(1));
    expect(state.visible).toBe(16);
    await intersect();
    expect(state.loading).toBe(false);
    expect(state.visible).toBe(16);
  });
  it("completes early after thumbnail preparation and disconnects on unmount", async () => {
    await intersect();
    await act(async () => finish.forEach((resolve) => resolve()));
    expect(state.visible).toBe(16);
    await act(async () => root.unmount());
    expect(stopped).toBe(true);
  });
});
