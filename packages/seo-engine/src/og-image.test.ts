import { describe, expect, it } from "vitest";
import { createOgImagePayload } from "./og-image.js";
import { draftSubject, missingCoverSubject, seoSubject } from "./test-fixtures.js";

describe("createOgImagePayload", () => {
  it("returns 1200x630 payload with fallback state", () => {
    expect(createOgImagePayload(seoSubject()).width).toBe(1200);
    expect(createOgImagePayload(missingCoverSubject()).fallback).toBe(true);
    expect(createOgImagePayload(seoSubject()).publicPostUrl).toBe(
      "https://example.com/posts/hello-world",
    );
    expect(() => createOgImagePayload(draftSubject())).toThrow(/non-published/);
  });
});
