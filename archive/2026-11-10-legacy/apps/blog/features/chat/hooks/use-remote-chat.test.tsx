// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useRemoteChat } from "./use-remote-chat";

let state: ReturnType<typeof useRemoteChat>, root: Root, container: HTMLDivElement;
function Harness() {
  state = useRemoteChat();
  return <p>{state.pending ? "pending" : state.messages.at(-1)?.text}</p>;
}
beforeEach(async () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  container = document.createElement("div");
  root = createRoot(container);
  await act(async () => root.render(<Harness />));
});
afterEach(async () => {
  await act(async () => root.unmount());
  vi.unstubAllGlobals();
});
describe("remote chat lifecycle", () => {
  it("clears the conversation and search context when starting over", async () => {
    const bodies: unknown[] = [];
    vi.stubGlobal("fetch", (_url: string, init: RequestInit) => {
      bodies.push(JSON.parse(init.body as string));
      return Promise.resolve(
        Response.json({
          answer: "답변",
          sources: [{ title: "프로젝트", url: "/projects/kusting", text: "내용", score: 1 }],
        }),
      );
    });
    await act(async () => {
      await state.send("기존 질문");
    });
    expect(state.messages).toHaveLength(2);
    await act(async () => {
      state.setDraft("초안");
    });
    await act(async () => {
      state.reset();
    });
    expect(state.messages).toEqual([]);
    expect(state.draft).toBe("초안");
    expect(state.error).toBe("");
    await act(async () => {
      await state.send("새 질문");
    });
    expect(bodies[1]).toEqual({ query: "새 질문" });
  });
  it("does not let a cancelled response clear a newer request or add stale messages", async () => {
    const finish: ((r: Response) => void)[] = [];
    const fetcher = vi.fn(() => new Promise<Response>((resolve) => finish.push(resolve)));
    vi.stubGlobal("fetch", fetcher);
    await act(async () => {
      void state.send("first");
      void state.send("duplicate");
    });
    expect(fetcher).toHaveBeenCalledTimes(1);
    await act(async () => {
      state.cancel();
      void state.send("second");
    });
    await act(async () => finish[0]!(Response.json({ answer: "stale", sources: [] })));
    expect(state.pending).toBe(true);
    expect(state.messages.some((m) => m.text === "stale")).toBe(false);
    await act(async () => finish[1]!(Response.json({ answer: "fresh", sources: [] })));
    expect(state.pending).toBe(false);
    expect(state.messages.at(-1)?.text).toBe("fresh");
  });
  it("aborts the network operation when the component unmounts", async () => {
    let signal: AbortSignal;
    vi.stubGlobal("fetch", (_url: string, init: RequestInit) => {
      signal = init.signal as AbortSignal;
      return new Promise(() => {});
    });
    await act(async () => {
      void state.send("question");
    });
    await act(async () => root.unmount());
    expect(signal!.aborted).toBe(true);
  });
});
