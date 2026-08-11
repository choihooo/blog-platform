import { describe, expect, it } from "vitest";

import { eventNameForHref } from "./post-analytics-events";

describe("eventNameForHref", () => {
  it("maps internal and external links while ignoring unsupported hrefs", () => {
    expect(eventNameForHref("/posts/hello", "https://example.com")?.name).toBe(
      "internal_link_click",
    );
    expect(eventNameForHref("https://openai.com", "https://example.com")?.name).toBe(
      "external_link_click",
    );
    expect(eventNameForHref("#intro", "https://example.com")).toBeUndefined();
  });
});
