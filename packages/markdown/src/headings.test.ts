import { describe, expect, it } from "vitest";

import { extractHeadings } from "./headings.js";

describe("extractHeadings", () => {
  it("extracts headings with duplicate-safe slugs", () => {
    const result = extractHeadings("# Intro\n\n## Intro\n\n## Intro");

    expect(result.success).toBe(true);
    expect(result.data).toEqual([
      { depth: 1, text: "Intro", slug: "intro" },
      { depth: 2, text: "Intro", slug: "intro-1" },
      { depth: 2, text: "Intro", slug: "intro-2" },
    ]);
  });

  it("ignores heading-looking text inside code fences", () => {
    const result = extractHeadings("```md\n# Not Heading\n```\n\n## Real");

    expect(result.data).toEqual([{ depth: 2, text: "Real", slug: "real" }]);
  });
});
