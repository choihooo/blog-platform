import { describe, expect, it } from "vitest";

import { validateMdxSafety } from "./mdx-safety.js";

describe("validateMdxSafety", () => {
  it("rejects script tags", () => {
    const result = validateMdxSafety('<script>alert("x")</script>');

    expect(result.success).toBe(false);
    expect(result.issues[0]?.code).toBe("mdx.script.disallowed");
  });

  it("rejects import/export and event handlers", () => {
    const result = validateMdxSafety('import X from "./x";\n<button onClick={() => 1}>x</button>');

    expect(result.success).toBe(false);
    expect(result.issues.map((item) => item.code)).toContain("mdx.import-export.disallowed");
    expect(result.issues.map((item) => item.code)).toContain("mdx.event-handler.disallowed");
  });

  it("rejects unsafe URLs and unsupported components", () => {
    const result = validateMdxSafety("[x](javascript:alert(1))\n\n<Unknown />");

    expect(result.success).toBe(false);
    expect(result.issues.map((item) => item.code)).toContain("mdx.url.unsafe");
    expect(result.issues.map((item) => item.code)).toContain("mdx.component.unsupported");
  });
});
