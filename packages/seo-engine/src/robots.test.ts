import { describe, expect, it } from "vitest";
import { generateRobotsPolicy, serializeRobots } from "./robots.js";
import { seoSubject } from "./test-fixtures.js";

describe("robots policy", () => {
  it("allows public pages and points to sitemap", () => {
    const text = serializeRobots(generateRobotsPolicy(seoSubject().site));
    expect(text).toContain("Allow: /");
    expect(text).toContain("Sitemap: https://example.com/sitemap.xml");
  });
});
