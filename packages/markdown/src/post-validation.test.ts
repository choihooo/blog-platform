import { describe, expect, it } from "vitest";

import { parsePostFile } from "./index.js";
import { postFile } from "./content-fixtures.test.js";

describe("parsePostFile", () => {
  it("accepts draft, published, and archived posts", () => {
    expect(parsePostFile(postFile({ status: "draft", title: "Draft" })).success).toBe(true);
    expect(
      parsePostFile(
        postFile({
          title: "Published",
          status: "published",
          slug: "published",
          author: "ho",
          publishedAt: "2026-07-30",
        }),
      ).success,
    ).toBe(true);
    expect(parsePostFile(postFile({ status: "archived", title: "Old" })).success).toBe(true);
  });

  it("rejects invalid status and missing published fields", () => {
    const invalidStatus = parsePostFile(postFile({ status: "bad" }));
    expect(invalidStatus.issues.map((item) => item.code)).toContain("post.status.invalid");

    const missing = parsePostFile(postFile({ status: "published" }, ""));
    expect(missing.issues.map((item) => item.code)).toEqual(
      expect.arrayContaining([
        "post.title.required",
        "post.slug.required",
        "post.author.required",
        "post.publishedAt.required",
        "post.body.required",
      ]),
    );
  });

  it("rejects invalid publishedAt", () => {
    const result = parsePostFile(
      postFile({
        title: "Published",
        status: "published",
        slug: "published",
        author: "ho",
        publishedAt: "not-a-date",
      }),
    );

    expect(result.issues.map((item) => item.code)).toContain("post.publishedAt.invalid");
  });
});
