// @vitest-environment jsdom
import { act, useRef } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";
import { useAboutScroll } from "./use-about-scroll";
afterEach(() => vi.restoreAllMocks());
it("coalesces scroll frames and cancels pending work when returning to static mode", async () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  const frames = new Map<number, FrameRequestCallback>();
  let next = 0;
  vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
    frames.set(++next, cb);
    return next;
  });
  vi.spyOn(window, "cancelAnimationFrame").mockImplementation((id) => {
    frames.delete(id);
  });
  const container = document.createElement("div"),
    root = createRoot(container);
  function Harness({ mode }: { mode: "scroll" | "static" }) {
    const track = useRef<HTMLDivElement>(null),
      video = useRef<HTMLVideoElement>(null),
      progressLine = useRef<HTMLDivElement>(null);
    useAboutScroll({ mode, track, video, progressLine });
    return (
      <div ref={track}>
        <video ref={video} />
        <div data-progress ref={progressLine} />
      </div>
    );
  }
  try {
    await act(async () => root.render(<Harness mode="scroll" />));
    await act(async () => {
      window.dispatchEvent(new Event("scroll"));
      window.dispatchEvent(new Event("scroll"));
    });
    expect(frames.size).toBe(1);
    await act(async () => {
      const [id, cb] = [...frames][0]!;
      frames.delete(id);
      cb(0);
    });
    expect(container.querySelector<HTMLElement>("[data-progress]")!.style.transform).toBe(
      "scaleX(0)",
    );
    await act(async () => root.render(<Harness mode="static" />));
    expect(frames.size).toBe(0);
    window.dispatchEvent(new Event("scroll"));
    expect(frames.size).toBe(0);
  } finally {
    await act(async () => root.unmount());
  }
});
