import { describe, expect, it } from "vitest";
import { initializeProvider } from "./provider.js";
import { disabledConfig, ga4Config, gtmConfig } from "./test-fixtures.js";

describe("initializeProvider", () => {
  it("handles ga4, gtm, and disabled configs", () => {
    expect(initializeProvider(ga4Config).ok).toBe(true);
    expect(initializeProvider(gtmConfig).ok).toBe(true);
    expect(initializeProvider(disabledConfig).ok).toBe(false);
    expect(initializeProvider({ provider: "ga4" }).ok).toBe(false);
    expect(initializeProvider({ provider: "gtm" }).ok).toBe(false);
    expect(initializeProvider({ provider: "plausible" }).ok).toBe(false);
  });
});
