import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({ coverImage: "", toc: true, found: true }));

vi.mock("@/features/blog/server/content-source", () => ({
  getPostBySlug: async () =>
    state.found
      ? {
          path: "db/posts/readable-post",
          status: "published",
          slug: "readable-post",
          title: "A readable post",
          author: "ho",
          publishedAt: "2026-11-05",
          excerpt: "Description for sharing",
          coverImage: state.coverImage || undefined,
          body: "## Details\nA useful explanation",
          bodyNodes: [
            { type: "heading", depth: 2, text: "Details" },
            { type: "paragraph", text: "A useful explanation" },
          ],
          toc: state.toc ? [{ slug: "details", text: "Details" }] : [],
          tagEntries: [{ slug: "engineering", label: "Engineering" }],
          readingTimeLabel: "1 min read",
        }
      : undefined,
  getPublishedPosts: async () => [],
  getRecommendedPosts: async () => [],
  getSiteConfig: async () => ({
    siteName: "Hozorica",
    siteUrl: "https://example.com",
    defaultAuthor: "ho",
    defaultAuthorName: "Hozorica",
    analytics: { provider: "none" },
  }),
}));

import PostPage, { generateMetadata } from "./page";

const props = { params: Promise.resolve({ slug: "readable-post" }) };

afterEach(() => {
  state.coverImage = "";
  state.toc = true;
  state.found = true;
});

describe("canonical post page", () => {
  it("renders the article, breadcrumb, taxonomy, author and table of contents", async () => {
    const html = renderToStaticMarkup(await PostPage(props));
    expect(html.match(/<h1\b/g)).toHaveLength(1);
    expect(html).toContain("A readable post");
    expect(html).toContain("A useful explanation");
    expect(html).toContain('aria-label="글 위치"');
    expect(html).toContain('href="/blog/tags/engineering"');
    expect(html).toContain("Hozorica");
    expect(html).toContain('href="#details"');
    expect(html).toContain('type="application/ld+json"');
  });

  it("uses the cover once and preserves it in social metadata", async () => {
    state.coverImage = "https://images.example.com/cover.jpg";
    const html = renderToStaticMarkup(await PostPage(props));
    expect(html.match(/<img[^>]*src="https:\/\/images\.example\.com\/cover\.jpg"/g)).toHaveLength(
      1,
    );
    const metadata = await generateMetadata(props);
    expect(metadata.alternates?.canonical).toBe("https://example.com/blog/readable-post");
    expect(JSON.stringify(metadata.openGraph)).toContain(state.coverImage);
  });

  it("omits an empty table of contents", async () => {
    state.toc = false;
    expect(renderToStaticMarkup(await PostPage(props))).not.toContain(
      'aria-label="Table of contents"',
    );
  });

  it("returns not found for an unpublished or missing slug", async () => {
    state.found = false;
    await expect(PostPage(props)).rejects.toThrow("NEXT_HTTP_ERROR_FALLBACK;404");
    await expect(generateMetadata(props)).rejects.toThrow("NEXT_HTTP_ERROR_FALLBACK;404");
  });
});
