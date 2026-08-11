import { describe, expect, it } from "vitest";

import { sendAnalyticsPayload } from "./analytics-provider";

describe("sendAnalyticsPayload", () => {
  it("ignores disabled payloads", () => {
    expect(() =>
      sendAnalyticsPayload({ ok: false, provider: "disabled", reason: "disabled" }),
    ).not.toThrow();
  });
});
