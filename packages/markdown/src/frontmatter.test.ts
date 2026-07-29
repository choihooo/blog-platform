import { describe, expect, it } from "vitest";

import { serializeFrontmatter } from "./frontmatter.js";
import { parseMdxDocument } from "./mdx.js";

describe("serializeFrontmatter", () => {
  it("round-trips supported metadata", () => {
    const metadata = {
      title: "Round Trip",
      status: "draft",
      tags: ["mdx", "test"],
    };

    const serialized = serializeFrontmatter(metadata);
    expect(serialized.success).toBe(true);

    const parsed = parseMdxDocument({
      path: "content/posts/round-trip.mdx",
      source: `${serialized.data}\n\n# Body`,
    });

    expect(parsed.success).toBe(true);
    expect(parsed.data?.frontmatter).toEqual(metadata);
  });
});
