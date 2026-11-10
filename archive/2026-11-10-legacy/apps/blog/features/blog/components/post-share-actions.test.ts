import { describe, expect, it, vi } from "vitest";

import { sharePost } from "./post-share";
import type { PostAnalyticsContext } from "./post-analytics-events";

const context: PostAnalyticsContext = {
  provider: "disabled",
  slug: "hello",
  title: "Hello",
  url: "https://example.com/posts/hello",
  siteUrl: "https://example.com",
};

describe("sharePost", () => {
  it("copies the post URL", async () => {
    Object.assign(globalThis.navigator, { clipboard: { writeText: vi.fn() } });

    await expect(sharePost({ context, mode: "copy-link" })).resolves.toBe("copy-link");
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("https://example.com/posts/hello");
  });

  it("uses native share when requested", async () => {
    Object.assign(globalThis.navigator, { share: vi.fn().mockResolvedValue(undefined) });

    await expect(sharePost({ context, mode: "native" })).resolves.toBe("native");
    expect(navigator.share).toHaveBeenCalledWith({
      title: "Hello",
      text: "Hello",
      url: "https://example.com/posts/hello",
    });
  });
});
