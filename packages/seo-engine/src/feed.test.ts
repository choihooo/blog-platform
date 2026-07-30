import { describe, expect, it } from "vitest";
import { generateFeedOutput, serializeFeed } from "./feed.js";
import { archivedSubject, draftSubject, seoSubject } from "./test-fixtures.js";

describe("feed output", () => {
  it("includes published posts and serializes XML", () => {
    const site = seoSubject().site;
    const output = generateFeedOutput(site, [
      seoSubject({ title: "B & B", publishedAt: "2026-07-29T00:00:00.000Z" }),
      seoSubject({ slug: "new", title: "A < A", publishedAt: "2026-07-30T00:00:00.000Z" }),
      archivedSubject(),
      draftSubject(),
    ]);
    const xml = serializeFeed(output);
    expect(output.items.map((item) => item.title)).toEqual(["A < A", "B & B"]);
    expect(xml).toContain("A &lt; A");
    expect(xml).toContain("B &amp; B");
    expect(output.items).toHaveLength(2);
    expect(xml).toContain('<rss version="2.0">');
  });

  it("serializes an empty channel", () => {
    expect(serializeFeed(generateFeedOutput(seoSubject().site, []))).toContain("<channel>");
  });
});
