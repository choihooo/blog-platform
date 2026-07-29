import { describe, expect, it } from "vitest";

import { validateContentCollection } from "./index.js";
import { collectionInput, postFile } from "./content-fixtures.test.js";

describe("content references", () => {
  it("reports unknown author, category, tag, and defaultAuthor", () => {
    const result = validateContentCollection(
      collectionInput({
        posts: [
          postFile({
            title: "Broken",
            status: "published",
            slug: "broken",
            author: "missing",
            publishedAt: "2026-07-30",
            category: "missing-category",
            tags: ["missing-tag"],
          }),
        ],
        siteJson: JSON.stringify({
          siteName: "Ho's Blog",
          siteUrl: "https://example.com",
          defaultAuthor: "missing",
          adminGithubLogin: "replace-me",
          adminGithubUserId: "0",
          github: { owner: "replace-me", repo: "blog", branch: "main" },
          analytics: { provider: "ga4" },
          features: { aiAssistant: false, internalLinkSuggestions: false },
        }),
      }),
    );

    expect(result.issues.map((item) => item.code)).toEqual(
      expect.arrayContaining([
        "post.author.unknown",
        "post.category.unknown",
        "post.tags.unknown",
        "site.defaultAuthor.unknown",
      ]),
    );
  });
});
