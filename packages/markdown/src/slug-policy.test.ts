import { describe, expect, it } from "vitest";

import { createSlugCandidate, validateUniqueSlug } from "./index.js";

describe("slug policy", () => {
  it("creates readable slug candidates", () => {
    expect(createSlugCandidate("Hello World").data).toBe("hello-world");
  });

  it("rejects unusable title and duplicate slug", () => {
    expect(createSlugCandidate("!!!").issues.map((item) => item.code)).toContain(
      "post.slug.unusable-title",
    );

    const unique = validateUniqueSlug({
      candidate: "hello-world",
      existingPosts: [
        { path: "content/posts/hello-world.mdx", slug: "hello-world" },
        { path: "content/posts/other.mdx", slug: "other" },
      ],
    });

    expect(unique.issues.map((item) => item.code)).toContain("post.slug.duplicate");
  });

  it("allows currentPath when checking slug uniqueness", () => {
    const result = validateUniqueSlug({
      candidate: "hello-world",
      currentPath: "content/posts/hello-world.mdx",
      existingPosts: [{ path: "content/posts/hello-world.mdx", slug: "hello-world" }],
    });

    expect(result.success).toBe(true);
  });
});
