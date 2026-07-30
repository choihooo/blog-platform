import { describe, expect, it } from "vitest";
import { analyticsInit, publishedPostEvent } from "./analytics";

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

  it("uses Analytics MVP event names", () => {
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = "G-TEST";
    const event = publishedPostEvent({
      provider: "ga4",
      name: "toc_click",
      slug: "hello",
      title: "Hello",
      url: "https://example.com/posts/hello",
      target: "intro",
    });
    expect(event.ok).toBe(true);
    if (event.ok && event.provider === "ga4") expect(event.event).toBe("toc_click");
  });

  it("initializes only configured providers", () => {
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = "G-TEST";
    process.env.NEXT_PUBLIC_GTM_ID = "";
    expect(analyticsInit({ analytics: { provider: "ga4" } }).ok).toBe(true);
    expect(analyticsInit({ analytics: { provider: "gtm" } }).ok).toBe(false);
    expect(analyticsInit({ analytics: { provider: "disabled" } }).ok).toBe(false);
  });
});
