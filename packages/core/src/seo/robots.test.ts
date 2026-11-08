import { describe, expect, it } from "vitest";
import { generateRobotsPolicy, serializeRobots } from "./robots.js";
import { seoSubject } from "./test-fixtures.js";

describe("robots policy", () => {
  it("allows public pages and points to sitemap", () => {
    const text = serializeRobots(generateRobotsPolicy(seoSubject().site));
    expect(text).toContain("Allow: /");
    expect(text).toContain("Disallow: /cms");
    expect(text).toContain("Disallow: /preview");
    expect(text).toContain("Sitemap: https://example.com/sitemap.xml");
    expect(text.split("\n").slice(0, 5)).toEqual([
      "User-agent: *",
      "Allow: /",
      "Disallow: /cms",
      "Disallow: /preview",
      "Sitemap: https://example.com/sitemap.xml",
    ]);
  });
});
