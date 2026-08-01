import type { SeoSubject } from "./types.js";

export function seoSubject(overrides: Partial<SeoSubject> = {}): SeoSubject {
  return {
    path: "db/posts/hello-world",
    status: "published",
    site: { siteName: "Ho's Blog", siteUrl: "https://example.com", description: "Tech notes" },
    title: "A Practical Guide to Structured Content",
    slug: "hello-world",
    excerpt: "A practical guide to database backed content.",
    author: { id: "ho", name: "Ho" },
    publishedAt: "2026-07-30T00:00:00.000Z",
    updatedAt: "2026-07-30T00:00:00.000Z",
    category: { slug: "engineering", label: "Engineering" },
    tags: [{ slug: "content-json", label: "Content JSON" }],
    coverImage: "/media/cover.webp",
    body: "A Practical Guide to Structured Content\n\n![cover](/media/cover.webp)\n\n[Read more](/posts/other)\n\nIntro\n\nDetails",
    headings: [
      {
        depth: 1,
        text: "A Practical Guide to Structured Content",
        slug: "a-practical-guide-to-structured-content",
      },
      { depth: 2, text: "Intro", slug: "intro" },
      { depth: 2, text: "Details", slug: "details" },
    ],
    toc: [
      { depth: 2, text: "Intro", slug: "intro" },
      { depth: 2, text: "Details", slug: "details" },
    ],
    readingTime: { minutes: 1, words: 120, label: "1 min read" },
    imageAltTexts: ["cover"],
    internalLinks: ["/posts/other"],
    ...overrides,
  };
}

export function draftSubject(overrides: Partial<SeoSubject> = {}) {
  return seoSubject({ status: "draft", slug: "draft-post", ...overrides });
}

export function archivedSubject(overrides: Partial<SeoSubject> = {}) {
  return seoSubject({ status: "archived", slug: "archived-post", ...overrides });
}

export function missingCoverSubject(overrides: Partial<SeoSubject> = {}) {
  return seoSubject({ coverImage: undefined, ...overrides });
}

export function longTitleSubject(overrides: Partial<SeoSubject> = {}) {
  return seoSubject({
    title:
      "A Very Long Generated Output Title That Must Wrap Cleanly Inside The Social Sharing Image",
    slug: "long-generated-output-title",
    ...overrides,
  });
}

export function duplicateHeadingSubject(overrides: Partial<SeoSubject> = {}) {
  return seoSubject({
    headings: [
      { depth: 1, text: "Guide", slug: "guide" },
      { depth: 2, text: "Intro", slug: "intro" },
      { depth: 2, text: "Intro", slug: "intro-1" },
    ],
    toc: [
      { depth: 2, text: "Intro", slug: "intro" },
      { depth: 2, text: "Intro", slug: "intro-1" },
    ],
    ...overrides,
  });
}
