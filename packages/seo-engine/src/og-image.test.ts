import { describe, expect, it } from "vitest";
import { createOgImagePayload } from "./og-image.js";
import { seoSubject } from "./test-fixtures.js";

describe("createOgImagePayload", () => {
  it("returns 1200x630 payload with fallback state", () => {
    expect(createOgImagePayload(seoSubject()).width).toBe(1200);
    expect(createOgImagePayload(seoSubject({ coverImage: undefined })).fallback).toBe(true);
  });
});
