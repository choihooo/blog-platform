import { describe, expect, it } from "vitest";

import { analyzeMdx } from "./mdx.js";
import { unsafeMdxSource } from "./mdx-fixtures.test.js";

describe("analyzeMdx safety integration", () => {
  it("blocks unsafe content", () => {
    const result = analyzeMdx({ path: "content/posts/unsafe.mdx", source: unsafeMdxSource });

    expect(result.success).toBe(false);
    expect(result.issues[0]?.code).toBe("mdx.script.disallowed");
  });
});
