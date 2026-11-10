// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PortfolioChat } from "./portfolio-chat";

let container: HTMLDivElement;
let root: Root;
beforeEach(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
});
afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  vi.unstubAllGlobals();
});
async function click(label: string) {
  await act(async () => {
    const button = container.querySelector<HTMLButtonElement>(`button[aria-label="${label}"]`);
    expect(button).not.toBeNull();
    button!.click();
  });
}
async function open() {
  await act(async () => root.render(createElement(PortfolioChat)));
  await click("채팅 열기");
}
async function suggest() {
  await act(async () => {
    [...container.querySelectorAll("button")]
      .find((b) => b.textContent?.includes("대표 프로젝트"))!
      .click();
  });
}
describe("remote chat", () => {
  it("starts a new conversation while ignoring the previous pending answer", async () => {
    let finish!: (value: Response) => void;
    vi.stubGlobal(
      "fetch",
      () =>
        new Promise<Response>((resolve) => {
          finish = resolve;
        }),
    );
    await open();
    expect(container.querySelectorAll('[aria-label="추천 질문"] button')).toHaveLength(4);
    await suggest();
    await click("새 대화");
    expect(container.querySelector('[role="status"]')).toBeNull();
    expect(container.querySelectorAll('[aria-label="추천 질문"] button')).toHaveLength(4);
    expect(container.querySelector("textarea")).toBe(document.activeElement);
    await act(async () => finish(Response.json({ answer: "이전 대화의 답변", sources: [] })));
    expect(container.textContent).not.toContain("이전 대화의 답변");
    expect(container.querySelector('[aria-label="답변 중지"]')).toBeNull();
  });
  it("accepts questions without WebGPU and displays the answer with sources", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        Response.json({
          answer: "검증된 답변",
          sources: [{ title: "원문", url: "/resume", text: "경력", score: 1 }],
        }),
      ),
    );
    await open();
    await suggest();
    expect(container.textContent).toContain("검증된 답변");
    expect(container.querySelector('a[href="/resume"]')).not.toBeNull();
    expect(container.textContent).not.toMatch(/모델 불러|WebGPU|1.38GB|Q8/);
  });
  it.each([429, 503])("shows an actionable error for %i", async (status) => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("", { status })));
    await open();
    await suggest();
    expect(container.querySelector('[role="alert"]')?.textContent).toContain(
      status === 429 ? "잠시 뒤" : "다시 시도",
    );
  });
  it("rejects malformed server answers", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          Response.json({ answer: "unsafe", sources: [{ url: "javascript:evil" }] }),
        ),
    );
    await open();
    await suggest();
    expect(container.textContent).not.toContain("unsafe");
    expect(container.querySelector('[role="alert"]')).not.toBeNull();
  });
  it("ignores late responses after closing or cancellation", async () => {
    let finish!: (value: Response) => void;
    const fetcher = vi.fn(
      () =>
        new Promise<Response>((resolve) => {
          finish = resolve;
        }),
    );
    vi.stubGlobal("fetch", fetcher);
    await open();
    await act(async () => {
      const button = [...container.querySelectorAll("button")].find((b) =>
        b.textContent?.includes("대표 프로젝트"),
      )!;
      button.click();
      button.click();
    });
    expect(fetcher).toHaveBeenCalledTimes(1);
    await click("채팅 닫기");
    await act(async () => finish(Response.json({ answer: "늦은 답변", sources: [] })));
    await click("채팅 열기");
    expect(container.textContent).not.toContain("늦은 답변");
    expect(container.querySelector("textarea")?.disabled).toBe(false);
  });
});
