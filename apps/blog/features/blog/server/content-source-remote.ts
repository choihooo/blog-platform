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
  if (!url) return;
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) return;
  return (await response.json()) as RemoteContentResponse;
}

export function createRemoteSource(): BlogContentSource {
  return {
    mode: "remote",
    listPosts: async (input: ContentListInput = {}) => {
      const response = await fetchRemoteContent({
        page: String(normalizePage(input.page)),
        limit: String(normalizeLimit(input.limit)),
        tag: input.tagSlug,
        category: input.categoryPath,
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
