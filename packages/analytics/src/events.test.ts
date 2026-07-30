import { describe, expect, it } from "vitest";
import { createBlogEvent, toProviderPayload } from "./events.js";
import { ga4Config, sampleEvent } from "./test-fixtures.js";

describe("analytics events", () => {
  it("maps safe events and omits disabled events", () => {
    expect(toProviderPayload(sampleEvent, ga4Config).ok).toBe(true);
    expect(createBlogEvent({ ...sampleEvent, provider: "disabled" })).toBeUndefined();
  });
});
