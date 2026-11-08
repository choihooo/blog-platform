import { describe, expect, it } from "vitest";

import { imageNode, contentToUploadCode, uploadStateFromResult } from "./editor-media";

describe("editor media", () => {
  it("creates public image nodes and maps failures", () => {
    expect(imageNode({ src: "/media/posts/a/b.webp", caption: "Caption" })).toMatchObject({
      type: "image",
      src: "/media/posts/a/b.webp",
      caption: "Caption",
    });
    expect(contentToUploadCode("retryable-failure")).toBe("temporary-connectivity");
    expect(
      uploadStateFromResult({
        ok: false,
        code: "slug-required",
        retryable: false,
        message: "Title required",
      }),
    ).toBe("validation-failed");
  });
});
