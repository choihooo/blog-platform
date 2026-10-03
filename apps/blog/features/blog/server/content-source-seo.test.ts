import { afterEach, describe, expect, it, vi } from "vitest";
import type { PostRecord } from "../../../../cms/lib/content-adapter/content-adapter.interface";

const state = vi.hoisted(() => ({ posts: [] as PostRecord[], failed: false }));
vi.mock("next/cache", () => ({ unstable_cache: (fn: unknown) => fn }));
vi.mock("../../../../cms/lib/site-config", () => ({
  loadSiteConfig: async () => ({
    siteName: "Test",
    siteUrl: "https://example.com",
    analytics: { provider: "none" },
  }),
}));
vi.mock("../../../../cms/lib/content-adapter/content-adapter", () => ({
  createContentAdapter: () => ({
    listPosts: async (input: {
      page: number;
      limit: number;
      tagSlug?: string;
      categoryPath?: string;
    }) => {
      if (state.failed) return { ok: false, error: { code: "storage-failure" } };
      const posts = state.posts.filter(
        (post) =>
          (!input.tagSlug || post.tags?.includes(input.tagSlug)) &&
          (!input.categoryPath || post.categoryPath === input.categoryPath),
      );
      return {
        ok: true,
        data: {
          items: posts.slice((input.page - 1) * input.limit, input.page * input.limit),
          total: posts.length,
        },
      };
    },
    getPostBySlug: async (slug: string) =>
      state.failed
        ? { ok: false, error: { code: "storage-failure" } }
        : { ok: true, data: state.posts.find((post) => post.slug === slug) ?? null },
    listCategories: async () =>
      state.failed
        ? { ok: false, error: { code: "storage-failure" } }
        : { ok: true, data: { items: [] } },
  }),
}));

import { GET as publicContent } from "../../../../cms/app/api/public-content/route";
import { GET as sitemap } from "../../../app/sitemap.xml/route";
import {
  getAllPublishedPosts,
  getPublishedPostPage,
  getPostBySlug,
  getTags,
} from "./content-source";

function catalog(count: number): PostRecord[] {
  return Array.from(
    { length: count },
    (_, i) =>
      ({
        id: `post-${i}`,
        slug: `post-${i}`,
        title: `Post ${i}`,
        content: "Body",
        summary: "Summary",
        isPublished: true,
        publishedAt: "2026-10-01T00:00:00Z",
        updatedAt: "2026-10-01T00:00:00Z",
        categoryPath: "engineering",
        tags: ["test", ...(i === 100 ? ["old-tag"] : [])],
      }) as unknown as PostRecord,
  );
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  state.failed = false;
});

describe.each(["d1r2", "remote"])("SEO catalog in %s mode", (mode) => {
  function setup(count: number) {
    state.posts = catalog(count);
    vi.stubEnv("BLOG_CONTENT_PROXY_URL", mode === "remote" ? "https://cms.example.com" : "");
    vi.stubGlobal("fetch", (url: URL) => publicContent(new Request(url)));
  }

  it.each([21, 100, 101, 205])("includes all %i posts in the sitemap", async (count) => {
    setup(count);
    expect(await getAllPublishedPosts()).toHaveLength(count);
    const xml = await (await sitemap()).text();
    for (const post of state.posts)
      expect(xml).toContain(`<loc>https://example.com/blog/${post.slug}</loc>`);
    expect((xml.match(/<loc>https:\/\/example.com\/blog\/post-/g) ?? []).length).toBe(count);
  });

  it.each([{}, { tagSlug: "test" }, { categoryPath: "engineering" }])(
    "serves pages beyond 100 posts with the correct total: %j",
    async (filter) => {
      setup(105);
      const page = await getPublishedPostPage({ ...filter, page: 13, limit: 8 });
      expect(page.total).toBe(105);
      expect(page.items.map((post) => post.slug)).toEqual(
        Array.from({ length: 8 }, (_, i) => `post-${96 + i}`),
      );
      expect((await getPublishedPostPage({ ...filter, page: 14, limit: 8 })).items).toHaveLength(1);
      expect((await getPublishedPostPage({ ...filter, page: 15, limit: 8 })).items).toEqual([]);
      expect(await getTags()).toContainEqual({ slug: "old-tag", label: "Old Tag" });
    },
  );

  it("distinguishes missing posts from upstream failures and rejects incomplete sitemaps", async () => {
    setup(1);
    expect(await getPostBySlug("missing")).toBeUndefined();
    state.failed = true;
    await expect(getPostBySlug("post-0")).rejects.toThrow("content_unavailable");
    await expect(getPublishedPostPage()).rejects.toThrow("content_unavailable");
    await expect(sitemap()).rejects.toThrow("content_unavailable");
  });
});

it("rejects a malformed remote catalog instead of publishing an empty sitemap", async () => {
  vi.stubEnv("BLOG_CONTENT_PROXY_URL", "https://cms.example.com");
  vi.stubGlobal("fetch", async () => Response.json({}));
  await expect(sitemap()).rejects.toThrow("content_unavailable");
});

it("preserves fetch errors so Next.js can bail out of static rendering for no-store reads", async () => {
  vi.stubEnv("BLOG_CONTENT_PROXY_URL", "https://cms.example.com");
  const bailout = new Error("Dynamic server usage");
  vi.stubGlobal("fetch", async () => {
    throw bailout;
  });
  await expect(sitemap()).rejects.toBe(bailout);
});
