import { describe, expect, it } from "vitest";

import type { ContentCollectionInput, FileInput } from "./index.js";

export function postFile(frontmatter: Record<string, unknown>, body = "# Body\n\nText"): FileInput {
  const yaml = Object.entries(frontmatter)
    .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
    .join("\n");
  return {
    path: `content/posts/${String(frontmatter.slug ?? "draft")}.mdx`,
    source: `---\n${yaml}\n---\n\n${body}`,
  };
}

export function authorFile(overrides: Record<string, unknown> = {}): FileInput {
  const data = {
    id: "ho",
    name: "Ho Choi",
    githubLogin: "replace-me",
    githubUserId: "0",
    ...overrides,
  };
  const yaml = Object.entries(data)
    .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
    .join("\n");
  return {
    path: `content/authors/${String(data.id ?? "author")}.md`,
    source: `---\n${yaml}\n---\n\nAuthor body`,
  };
}

export function collectionInput(
  overrides: Partial<ContentCollectionInput> = {},
): ContentCollectionInput {
  return {
    posts: [
      postFile({
        title: "Hello World",
        status: "published",
        slug: "hello-world",
        author: "ho",
        publishedAt: "2026-07-30",
        category: "engineering",
        tags: ["blog", "mdx"],
      }),
    ],
    authors: [authorFile()],
    categoriesJson: JSON.stringify([{ slug: "engineering", label: "Engineering" }]),
    tagsJson: JSON.stringify([
      { slug: "blog", label: "Blog" },
      { slug: "mdx", label: "MDX" },
    ]),
    siteJson: JSON.stringify({
      siteName: "Ho's Blog",
      siteUrl: "https://example.com",
      defaultAuthor: "ho",
      adminGithubLogin: "replace-me",
      adminGithubUserId: "0",
      github: { owner: "replace-me", repo: "blog", branch: "main" },
      analytics: { provider: "ga4" },
      features: { aiAssistant: false, internalLinkSuggestions: false },
    }),
    ...overrides,
  };
}

describe("content fixture builders", () => {
  it("creates a valid collection input shape", () => {
    expect(collectionInput().posts).toHaveLength(1);
  });
});
