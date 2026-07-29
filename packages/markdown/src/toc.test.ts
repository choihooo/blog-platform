import { describe, expect, it } from "vitest";

import { generateToc } from "./toc.js";

describe("generateToc", () => {
  it("filters by depth and keeps order", () => {
    const toc = generateToc([
      { depth: 1, text: "Title", slug: "title" },
      { depth: 2, text: "A", slug: "a" },
      { depth: 4, text: "Deep", slug: "deep" },
    ]);

    expect(toc).toEqual([{ depth: 2, text: "A", slug: "a" }]);
  });

  it("returns an empty list for no headings", () => {
    expect(generateToc([])).toEqual([]);
  });
});
