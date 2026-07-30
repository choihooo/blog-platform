import { describe, expect, it } from "vitest";
import { publishedPostEvent } from "./analytics";

describe("publishedPostEvent", () => {
  it("disables events without provider config", () => {
    expect(
      publishedPostEvent({
        provider: "disabled",
        slug: "hello",
        url: "https://example.com/posts/hello",
      }).ok,
    ).toBe(false);
  });
});
