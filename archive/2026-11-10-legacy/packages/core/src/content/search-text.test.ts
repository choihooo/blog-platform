import { describe, it, expect } from "vitest";
import { textFromPostContent } from "./post-content.js";

describe("read-only post text projection", () => {
  it.each([
    { version: 1, nodes: null },
    { version: 1, nodes: "invalid" },
    { version: 1 },
    { version: 2, nodes: [] },
  ])("does not reinterpret an invalid editor envelope as prose %#", (value) => {
    expect(textFromPostContent(JSON.stringify(value))).toBe("");
  });
  it("reads rich tables without falling back to serialized editor JSON", () => {
    const content = JSON.stringify({
      version: 1,
      nodes: [
        { type: "heading", text: "실측", content: [{ text: "실측" }] },
        {
          type: "table",
          rows: [
            [
              { body: [{ type: "paragraph", text: "버전" }] },
              { body: [{ type: "paragraph", text: "시간" }] },
            ],
            [
              { body: [{ type: "paragraph", text: "TS 5.8" }] },
              { body: [{ type: "paragraph", text: "2.37s" }] },
            ],
          ],
        },
        { type: "paragraph", content: [{ text: "중첩 본문" }] },
      ],
    });
    expect(textFromPostContent(content)).toBe("실측\n\n버전 | 시간\nTS 5.8 | 2.37s\n\n중첩 본문");
  });
  it("retains code literals and legacy text, but never emits broken editor envelopes", () => {
    expect(textFromPostContent("# 제목\n\n본문")).toBe("제목\n\n본문");
    expect(
      textFromPostContent(
        JSON.stringify({
          version: 1,
          nodes: [{ type: "codeBlock", text: '{"version":1,"nodes":[]}' }],
        }),
      ),
    ).toBe('{"version":1,"nodes":[]}');
    expect(textFromPostContent('{"version":1,"nodes":[')).toBe("");
  });
});
