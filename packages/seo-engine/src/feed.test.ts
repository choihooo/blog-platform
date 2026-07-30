import { describe, expect, it } from "vitest";
import { generateFeedOutput, serializeFeed } from "./feed.js";
import { seoSubject } from "./test-fixtures.js";

describe("feed output", () => {
  it("includes published posts and serializes XML", () => {
    const site = seoSubject().site;
    const output = generateFeedOutput(site, [seoSubject(), seoSubject({ status: "archived" })]);
    expect(output.items).toHaveLength(1);
    expect(serializeFeed(output)).toContain('<rss version="2.0">');
  });
});
