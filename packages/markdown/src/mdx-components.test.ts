import { describe, expect, it } from "vitest";

import { validateMdxSafety } from "./mdx-safety.js";

describe("MDX component policy", () => {
  it("rejects unsupported components", () => {
    const result = validateMdxSafety("<Widget />");

    expect(result.success).toBe(false);
    expect(result.issues[0]?.code).toBe("mdx.component.unsupported");
  });

  it("rejects unsafe markdown URLs", () => {
    const result = validateMdxSafety("[x](javascript:alert(1))");

    expect(result.success).toBe(false);
    expect(result.issues[0]?.code).toBe("mdx.url.unsafe");
  });
});
