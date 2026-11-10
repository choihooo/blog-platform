import { describe, expect, it, vi } from "vitest";

import { copyCode } from "./code-copy-button";

describe("copyCode", () => {
  it("copies text before analytics emission", async () => {
    Object.assign(globalThis.navigator, { clipboard: { writeText: vi.fn() } });
    await copyCode(
      "const x = 1;",
      {
        provider: "disabled",
        slug: "hello",
        title: "Hello",
        url: "https://example.com/posts/hello",
        siteUrl: "https://example.com",
      },
      "code-1",
    );
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("const x = 1;");
  });
});
