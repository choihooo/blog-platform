import { describe, expect, it } from "vitest";
import { createBlogEvent, toProviderPayload } from "./events.js";
import { ga4Config, sampleEvent } from "./test-fixtures.js";

describe("analytics events", () => {
  it("maps canonical events and omits disabled events", () => {
    const payload = toProviderPayload(sampleEvent, ga4Config);
    expect(payload.ok).toBe(true);
    if (payload.ok && payload.provider === "ga4") {
      expect(payload.event).toBe("article_view");
      expect(payload.params.title).toBe("Hello World");
    }
    expect(createBlogEvent({ ...sampleEvent, provider: "disabled" })).toBeUndefined();
    expect(createBlogEvent({ ...sampleEvent, name: "search", target: " " })).toBeUndefined();
  });

  it("maps every MVP event name", () => {
    const names = [
      "article_view",
      "scroll_50",
      "scroll_90",
      "code_copy",
      "toc_click",
      "internal_link_click",
      "external_link_click",
      "search",
      "share",
    ] as const;
    for (const name of names) {
      expect(
        createBlogEvent({ ...sampleEvent, name, target: name === "search" ? "content-json" : name })
          ?.name,
      ).toBe(name);
    }
  });
});
