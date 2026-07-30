import { describe, expect, it } from "vitest";
import { evaluateSeo } from "./report.js";
import { seoSubject } from "./test-fixtures.js";

describe("evaluateSeo", () => {
  it("groups report status and previews", () => {
    const report = evaluateSeo(seoSubject(), "2026-07-30T00:00:00.000Z");
    expect(report.status).toBe("pass");
    expect(report.searchPreview.url).toBe("https://example.com/posts/hello-world");
    expect(report.jsonLdPreview).toHaveLength(2);
  });
});
