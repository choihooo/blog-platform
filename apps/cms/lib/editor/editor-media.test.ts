import { describe, expect, it } from "vitest";

import { imageNode, repositoryToUploadCode, uploadStateFromResult } from "./editor-media";

describe("editor media", () => {
  it("creates public image nodes and maps failures", () => {
    expect(imageNode({ src: "/media/posts/a/b.webp", caption: "Caption" })).toMatchObject({
      type: "image",
      src: "/media/posts/a/b.webp",
      caption: "Caption",
    });
    expect(repositoryToUploadCode("rate-limit")).toBe("temporary-connectivity");
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
