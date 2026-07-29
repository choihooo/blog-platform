import { describe, expect, it } from "vitest";

import { analyzeMdx } from "./mdx.js";
import { validMdxSource } from "./mdx-fixtures.test.js";

describe("analyzeMdx generated metadata", () => {
  it("includes headings, toc, reading time, and code blocks", () => {
    const result = analyzeMdx({ path: "content/posts/hello.mdx", source: validMdxSource });

    expect(result.success).toBe(true);
    expect(result.data?.headings.map((heading) => heading.slug)).toEqual(["intro", "detail"]);
    expect(result.data?.toc).toEqual([{ depth: 2, text: "Detail", slug: "detail" }]);
    expect(result.data?.readingTime.words).toBeGreaterThan(0);
    expect(result.data?.codeBlocks).toEqual([{ language: "ts", fallback: false }]);
  });
});
