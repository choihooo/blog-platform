import { describe, expect, it } from "vitest";

import { parseMdxDocument } from "./mdx.js";
import { invalidFrontmatterSource, validMdxSource } from "./mdx-fixtures.test.js";

describe("parseMdxDocument", () => {
  it("splits frontmatter and body", () => {
    const result = parseMdxDocument({ path: "content/posts/hello.mdx", source: validMdxSource });

    expect(result.success).toBe(true);
    expect(result.data?.frontmatter.title).toBe("Hello MDX");
    expect(result.data?.body).toContain("# Intro");
  });

  it("reports invalid frontmatter", () => {
    const result = parseMdxDocument({
      path: "content/posts/broken.mdx",
      source: invalidFrontmatterSource,
    });

    expect(result.success).toBe(false);
    expect(result.issues[0]?.code).toBe("mdx.frontmatter.invalid");
  });
});
