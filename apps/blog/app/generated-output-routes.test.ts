import { describe, expect, it, vi } from "vitest";
import type { PublicPost } from "../lib/content";

const publishedPost: PublicPost = {
  path: "posts/hello.mdx",
  status: "published",
  title: "Hello & MDX",
  slug: "hello",
  author: "ho",
  publishedAt: "2026-07-30T00:00:00.000Z",
  updatedAt: "2026-07-30T00:00:00.000Z",
  excerpt: "Hello description",
  body: "# Hello\n\n## Intro",
  category: "engineering",
  tags: ["mdx"],
  authorProfile: {
    path: "authors/ho.md",
    id: "ho",
    name: "Ho",
    body: "Bio",
    githubLogin: "ho",
    githubUserId: "1",
  },
  categoryEntry: { slug: "engineering", label: "Engineering" },
  tagEntries: [{ slug: "mdx", label: "MDX" }],
  toc: [{ depth: 2, text: "Intro", slug: "intro" }],
  readingTimeLabel: "1 min read",
};

const longPost: PublicPost = {
  ...publishedPost,
  path: "posts/long.mdx",
  slug: "long",
  title: "A Very Long Generated Output Title That Must Wrap Cleanly Inside The Social Image",
  coverImage: undefined,
};

vi.mock("../lib/content", () => ({
  getSiteConfig: () => Promise.resolve({ siteName: "Blog", siteUrl: "https://example.com" }),
  getPublishedPosts: () => Promise.resolve([publishedPost, longPost]),
  getPostBySlug: (slug: string) =>
    Promise.resolve(slug === "hello" ? publishedPost : slug === "long" ? longPost : undefined),
}));

describe("generated output routes", () => {
  it("serves RSS with published posts only", async () => {
    const { GET } = await import("./rss.xml/route");
    const response = await GET();
    const body = await response.text();
    expect(response.headers.get("content-type")).toBe("application/rss+xml; charset=utf-8");
    expect(body).toContain("Hello &amp; MDX");
    expect(body).toContain("https://example.com/posts/hello");
    expect(body).not.toContain("draft");
  });

  it("serves Sitemap with public URLs only", async () => {
    const { GET } = await import("./sitemap.xml/route");
    const response = await GET();
    const body = await response.text();
    expect(response.headers.get("content-type")).toBe("application/xml; charset=utf-8");
    expect(body).toContain("https://example.com/posts/hello");
    expect(body).toContain("https://example.com/categories/engineering");
    expect(body).toContain("https://example.com/tags/mdx");
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

  it("serves OG SVG for published posts and 404s unknown/private slugs", async () => {
    const { GET } = await import("./og/[slug]/route");
    const ok = await GET(new Request("https://example.com"), {
      params: Promise.resolve({ slug: "long" }),
    });
    const missing = await GET(new Request("https://example.com"), {
      params: Promise.resolve({ slug: "draft" }),
    });
    const body = await ok.text();
    expect(ok.headers.get("content-type")).toBe("image/svg+xml; charset=utf-8");
    expect(body).toContain("<tspan");
    expect(body).toContain("Blog");
    expect(missing.status).toBe(404);
  });
});
