import { describe, expect, it } from "vitest";

import { validateContentCollection } from "./index.js";
import { collectionInput, postFile } from "./content-fixtures.test.js";

describe("validateContentCollection", () => {
  it("validates the sample content collection", () => {
    const result = validateContentCollection(collectionInput());

    expect(result.success).toBe(true);
    expect(result.data?.posts).toHaveLength(1);
  });

  it("rejects duplicate published slugs", () => {
    const result = validateContentCollection(
      collectionInput({
        posts: [
          {
            ...postFile({
              title: "One",
              status: "published",
              slug: "same",
              author: "ho",
              publishedAt: "2026-07-30",
            }),
            path: "content/posts/one.mdx",
          },
          {
            ...postFile({
              title: "Two",
              status: "published",
              slug: "same",
              author: "ho",
              publishedAt: "2026-07-31",
            }),
            path: "content/posts/two.mdx",
          },
        ],
      }),
    );

    expect(result.success).toBe(false);
    expect(result.issues.map((item) => item.code)).toContain("post.slug.duplicate");
  });
});
