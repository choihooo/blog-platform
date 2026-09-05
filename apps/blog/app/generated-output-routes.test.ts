import { describe, expect, it, vi } from "vitest";
import type { PublicPost } from "@/features/blog/lib/content";

const publishedPost: PublicPost = {
  path: "db/posts/hello",
  status: "published",
  title: "Hello & Structured Content",
  slug: "hello",
  author: "ho",
  publishedAt: "2026-07-30T00:00:00.000Z",
  updatedAt: "2026-07-30T00:00:00.000Z",
  excerpt: "Hello description",
  coverImage: "https://pub-2eadf17a82cb46679204775b78a2c16a.r2.dev/blog/tistory/test-cover.webp",
  body: "# Hello\n\n## Intro",
  bodyNodes: [
    { type: "heading", depth: 1, text: "Hello" },
    { type: "heading", depth: 2, text: "Intro" },
  ],
  category: "engineering",
  tags: ["content-json"],
  authorProfile: {
    id: "ho",
    name: "Ho",
  },
  categoryEntry: { slug: "engineering", label: "Engineering" },
  tagEntries: [{ slug: "content-json", label: "Structured Content" }],
  toc: [{ depth: 2, text: "Intro", slug: "intro" }],
  readingTimeLabel: "1 min read",
};

const longPost: PublicPost = {
  ...publishedPost,
  path: "db/posts/long",
  slug: "long",
  title: "A Very Long Generated Output Title That Must Wrap Cleanly Inside The Social Image",
};

vi.mock("@/features/blog/server/content-source", () => ({
  getSiteConfig: () => Promise.resolve({ siteName: "Blog", siteUrl: "https://example.com" }),
  getPublishedPosts: () => Promise.resolve([publishedPost, longPost]),
  searchPosts: (input: { query: string }) =>
    Promise.resolve(
      [publishedPost, longPost].filter((post) =>
        post.title.toLowerCase().includes(input.query.toLowerCase()),
      ),
    ),
  getPostBySlug: (slug: string) =>
    Promise.resolve(slug === "hello" ? publishedPost : slug === "long" ? longPost : undefined),
}));

describe("generated output routes", () => {
  it("keeps listing pages self-canonical and prevents search result indexing", async () => {
    const { homeListingMetadata, searchListingMetadata } =
      await import("@/features/blog/lib/listing-metadata");
    const listing = homeListingMetadata({ siteUrl: "https://example.com", page: 2 });
    const search = searchListingMetadata({ siteUrl: "https://example.com", query: "hello" });

    expect(listing.alternates?.canonical).toBe("https://example.com/blog/page/2");
    expect(search.alternates?.canonical).toBe("https://example.com/blog/search");
    expect(search.robots).toEqual({ index: false, follow: true });
  });

  it("serves RSS with published posts only", async () => {
    const { GET } = await import("./rss.xml/route");
    const response = await GET();
    const body = await response.text();
    expect(response.headers.get("content-type")).toBe("application/rss+xml; charset=utf-8");
    expect(body).toContain("Hello &amp; Structured Content");
    expect(body).toContain("https://example.com/blog/hello");
    expect(body).not.toContain("draft");
  });

  it("serves Sitemap with public URLs only", async () => {
    const { GET } = await import("./sitemap.xml/route");
    const response = await GET();
    const body = await response.text();
    expect(response.headers.get("content-type")).toBe("application/xml; charset=utf-8");
    expect(body).toContain("https://example.com/blog/hello");
    expect(body).toContain("https://example.com/blog/categories/engineering");
    expect(body).toContain("https://example.com/blog/tags/content-json");
    expect(body).not.toContain("/cms");
    expect(body).not.toContain("/preview");
  });

  it("serves robots with sitemap and private disallow rules", async () => {
    const { GET } = await import("./robots.txt/route");
    const response = await GET();
    const body = await response.text();
    expect(response.headers.get("content-type")).toBe("text/plain; charset=utf-8");
    expect(body).toContain("Sitemap: https://example.com/sitemap.xml");
    expect(body).toContain("Disallow: /cms");
    expect(body).toContain("Disallow: /preview");
  });

  it("serves OG PNG for published posts and 404s unknown/private slugs", async () => {
    const { GET } = await import("./og/[slug]/route");
    const ok = await GET(new Request("https://example.com"), {
      params: Promise.resolve({ slug: "long" }),
    });
    const missing = await GET(new Request("https://example.com"), {
      params: Promise.resolve({ slug: "draft" }),
    });
    expect(ok.headers.get("content-type")).toBe("image/png");
    expect((await ok.arrayBuffer()).byteLength).toBeGreaterThan(1000);
    expect(missing.status).toBe(404);
  });

  it("serves JSON search results", async () => {
    const { GET } = await import("./api/search/route");
    const response = await GET(new Request("https://example.com/api/search?q=hello"));
    const body = (await response.json()) as {
      items: Array<{ title: string; url: string }>;
      total: number;
      query: string;
    };

    expect(response.headers.get("content-type")).toContain("application/json");
    expect(body.query).toBe("hello");
    expect(body.total).toBe(1);
    expect(body.items[0]).toMatchObject({
      title: "Hello & Structured Content",
      url: "/blog/hello",
    });
  });
});
