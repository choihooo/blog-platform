import { describe, expect, it } from "vitest";

import { mediaPath, publicPath, slugForMedia } from "./media-path";

describe("media path", () => {
  it("creates cover and body repository paths", () => {
    expect(mediaPath({ target: "cover", slug: "hello", hash: "abc" })).toBe(
      "public/media/covers/hello-abc.webp",
    );
    expect(mediaPath({ target: "body", slug: "hello", hash: "abc" })).toBe(
      "public/media/posts/hello/abc.webp",
    );
    expect(publicPath("public/media/posts/hello/abc.webp")).toBe("/media/posts/hello/abc.webp");
  });

  it("uses existing slug policy", () => {
    expect(slugForMedia("Hello World")).toBe("hello-world");
    expect(slugForMedia("   ")).toBeNull();
  });
});
