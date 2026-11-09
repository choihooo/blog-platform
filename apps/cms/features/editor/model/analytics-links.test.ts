import { createEmptyEditorDocument } from "@blog-platform/core/content";
import { describe, expect, it } from "vitest";
import { analyticsLinksForEditorDocument } from "./analytics-links";

describe("analyticsLinksForEditorDocument", () => {
  it("only enables public links for published posts", () => {
    const draft = createEmptyEditorDocument(new Date("2026-07-30"));
    expect(analyticsLinksForEditorDocument(draft).publicPostUrl).toBeUndefined();
    draft.frontmatter = { title: "Hello", status: "published", slug: "hello" };
    expect(
      analyticsLinksForEditorDocument(draft, {
        siteUrl: "https://example.com",
        analytics: {
          provider: "ga4",
          ga4PropertyId: "123",
          searchConsoleProperty: "sc-domain:example.com",
        },
      }).publicPostUrl,
    ).toBe("https://example.com/posts/hello");
  });
});
