import { existsSync } from "node:fs";

import { describe, expect, it } from "vitest";

describe("content file structure", () => {
  it("provides required content files", () => {
    expect(existsSync("../../content/posts/hello-world.mdx")).toBe(true);
    expect(existsSync("../../content/authors/ho.md")).toBe(true);
    expect(existsSync("../../content/categories.json")).toBe(true);
    expect(existsSync("../../content/tags.json")).toBe(true);
    expect(existsSync("../../content/site.json")).toBe(true);
  });
});
