import { describe, expect, it } from "vitest";

import { getSupportedToolbarState, isSupportedBlock, isSupportedMark } from "./supported-format.js";

describe("supported format", () => {
  it("accepts the MVP blocks and marks", () => {
    expect(isSupportedBlock("paragraph")).toBe(true);
    expect(isSupportedBlock("codeBlock")).toBe(true);
    expect(isSupportedMark("bold")).toBe(true);
    expect(isSupportedMark("inlineCode")).toBe(true);
  });

  it("keeps image disabled until media upload phase", () => {
    const image = getSupportedToolbarState().find((item) => item.command === "image");
    expect(image).toMatchObject({ available: false });
  });
});
