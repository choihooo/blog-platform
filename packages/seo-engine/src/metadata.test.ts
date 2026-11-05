import { describe, expect, it } from "vitest";
import { generatePageMetadata } from "./metadata.js";
import { missingCoverSubject, seoSubject } from "./test-fixtures.js";

describe("generatePageMetadata", () => {
  it("uses the current brand card for website subjects", () => {
    const metadata = generatePageMetadata(seoSubject({ slug: undefined, coverImage: undefined }));
    expect(metadata.openGraph.images).toEqual(["https://example.com/brand/hozorica-card-v2.webp"]);
  });
  it("creates canonical and social metadata with fallbacks", () => {
    const metadata = generatePageMetadata(missingCoverSubject({ excerpt: undefined }));
    expect(metadata.canonical).toBe("https://example.com/posts/hello-world");
    expect(metadata.openGraph.images[0]).toBe("https://example.com/og/hello-world");
    expect(metadata.twitter.images[0]).toBe("https://example.com/og/hello-world");
    expect(metadata.description).toBe("Tech notes");
  });

  it("keeps article metadata for subjects with slugs", () => {
    expect(generatePageMetadata(seoSubject()).openGraph.type).toBe("article");
  });

  it.each([
    ["/media/thumbnails/v1/example.png", "https://example.com/media/thumbnails/v1/example.png"],
    ["https://cdn.example.com/cover.png", "https://cdn.example.com/cover.png"],
  ])("uses the post cover for both social previews: %s", (coverImage, expected) => {
    const metadata = generatePageMetadata(seoSubject({ coverImage }));
    expect(metadata.openGraph.images).toEqual([expected]);
    expect(metadata.twitter.images).toEqual([expected]);
  });
});
