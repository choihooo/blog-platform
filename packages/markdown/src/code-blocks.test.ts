import { describe, expect, it } from "vitest";

import { extractCodeBlocks } from "./code-blocks.js";

describe("extractCodeBlocks", () => {
  it("falls back unknown languages to text", () => {
    expect(extractCodeBlocks("```wat\nx\n```")).toEqual([{ language: "text", fallback: true }]);
  });

  it("keeps known languages", () => {
    expect(extractCodeBlocks("```ts\nconst x = 1;\n```")).toEqual([
      { language: "ts", fallback: false },
    ]);
  });
});
