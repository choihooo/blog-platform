import { describe, expect, it } from "vitest";
import { generatePageMetadata } from "./metadata.js";
import { seoSubject } from "./test-fixtures.js";

describe("generatePageMetadata", () => {
  it("creates canonical and social metadata", () => {
    const metadata = generatePageMetadata(seoSubject());
    expect(metadata.canonical).toBe("https://example.com/posts/hello-world");
    expect(metadata.openGraph.images[0]).toBe("https://example.com/og/hello-world");
  });
});
