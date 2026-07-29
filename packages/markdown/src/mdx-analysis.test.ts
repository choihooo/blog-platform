import { describe, expect, it } from "vitest";

import { analyzeMdx } from "./mdx.js";
import { validMdxSource } from "./mdx-fixtures.test.js";

describe("analyzeMdx", () => {
  it("returns stable shared analysis", () => {
    const input = { path: "content/posts/hello.mdx", source: validMdxSource };
    const first = analyzeMdx(input);
    const second = analyzeMdx(input);

    expect(first.success).toBe(true);
    expect(first.data?.frontmatter.title).toBe("Hello MDX");
    expect(first.data?.body).toContain("# Intro");
    expect(first.data).toEqual(second.data);
  });
});
