import { describe, expect, it } from "vitest";

import { getPublishedPosts, validateContentCollection } from "./index.js";
import { collectionInput, postFile } from "./content-fixtures.test.js";

describe("getPublishedPosts", () => {
  it("returns only published posts", () => {
    const result = validateContentCollection(
      collectionInput({
        posts: [
          postFile({ status: "draft", title: "Draft" }),
          postFile({
            title: "Published",
            status: "published",
            slug: "published",
            author: "ho",
            publishedAt: "2026-07-30",
          }),
          postFile({ status: "archived", title: "Archived", slug: "archived" }),
        ],
      }),
    );

    expect(result.success).toBe(true);
    expect(result.data ? getPublishedPosts(result.data).map((post) => post.slug) : []).toEqual([
      "published",
    ]);
  });
});
