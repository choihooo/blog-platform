import { loadSiteConfig } from "../../../../cms/lib/site-config";
import type {
  BlogContentSource,
  CategoryHierarchy,
  ContentListInput,
} from "./content-source-types";
import {
  normalizeLimit,
  normalizePage,
  normalizeSlug,
  toPublicSourcePost,
} from "./content-source-utils";

type RemoteContentResponse = {
  total?: number;
  posts?: Parameters<typeof toPublicSourcePost>[0][];
  categories?: CategoryHierarchy[];
  post?: Parameters<typeof toPublicSourcePost>[0];
};

function remoteContentUrl(params?: Record<string, string | undefined>) {
  const base = process.env.BLOG_CONTENT_PROXY_URL?.trim().replace(/\/$/, "");
  if (!base) return;
  const proxyPath = process.env.BLOG_CONTENT_PROXY_PATH?.trim() || "/api/public-content";
  const url = new URL(`${base}${proxyPath}`);
  for (const [key, value] of Object.entries(params ?? {})) {
    if (value) url.searchParams.set(key, value);
  }
  return url;
}

async function fetchRemoteContent(
  params?: Record<string, string | undefined>,
): Promise<RemoteContentResponse | undefined> {
  const url = remoteContentUrl(params);
  if (!url) throw new Error("content_unavailable");
  // Let Next.js propagate its no-store/static-render bailout unchanged.
  const response = await fetch(url, { cache: "no-store" });
  if (response.status === 404 && params?.slug) return;
  if (!response.ok) throw new Error("content_unavailable");
  const data = (await response.json()) as RemoteContentResponse;
  if (params?.slug ? !data?.post : !Array.isArray(data?.posts)) {
    throw new Error("content_unavailable");
  }
  return data;
}

export function createRemoteSource(): BlogContentSource {
  return {
    mode: "remote",
    listPostPage: async (input = {}) => {
      const response = await fetchRemoteContent({
        page: String(normalizePage(input.page)),
        limit: String(normalizeLimit(input.limit)),
        tag: input.tagSlug,
        category: input.categoryPath,
        query: input.query,
        includeTotal: "true",
      });
      if (!response?.posts || !Number.isSafeInteger(response.total) || response.total! < 0) {
        throw new Error("content_unavailable");
      }
      return {
        items: response.posts.map((post) =>
          toPublicSourcePost(post, { analyzeBody: input.analyzeBody }),
        ),
        total: response.total!,
      };
    },
    listPosts: async (input: ContentListInput = {}) => {
      const response = await fetchRemoteContent({
        page: String(normalizePage(input.page)),
        limit: String(normalizeLimit(input.limit)),
        tag: input.tagSlug,
        category: input.categoryPath,
        query: input.query,
        analyzeBody: input.analyzeBody === false ? "false" : "true",
      });
      return (
        response?.posts?.map((post) =>
          toPublicSourcePost(post, { analyzeBody: input.analyzeBody }),
        ) ?? []
      );
    },
    getPostBySlug: async (slug, options) => {
      const response = await fetchRemoteContent({
        slug: normalizeSlug(slug),
        analyzeBody: options?.analyzeBody === false ? "false" : "true",
      });
      return response?.post
        ? toPublicSourcePost(response.post, { analyzeBody: options?.analyzeBody })
        : undefined;
    },
    getPostsByTag: async (tagSlug, input = {}) => {
      const response = await fetchRemoteContent({
        page: String(normalizePage(input.page)),
        limit: String(normalizeLimit(input.limit)),
        tag: tagSlug,
        analyzeBody: "false",
      });
      return response?.posts?.map((post) => toPublicSourcePost(post)) ?? [];
    },
    getPostsByCategoryPath: async (categoryPath, input = {}) => {
      const response = await fetchRemoteContent({
        page: String(normalizePage(input.page)),
        limit: String(normalizeLimit(input.limit)),
        category: categoryPath,
        analyzeBody: "false",
      });
      return response?.posts?.map((post) => toPublicSourcePost(post)) ?? [];
    },
    listCategories: async (input) => {
      const response = await fetchRemoteContent({ page: "1", limit: "1" });
      return (response?.categories ?? [])
        .filter((category) => category.depth === input.depth)
        .filter((category) => (input.parentSlug ? category.parentSlug === input.parentSlug : true));
    },
    getCategoryByPath: async (path) => {
      const response = await fetchRemoteContent({ page: "1", limit: "1" });
      return response?.categories?.find((category) => category.slug === path);
    },
    getSiteConfig: loadSiteConfig,
  };
}
