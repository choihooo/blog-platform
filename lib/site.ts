import type { Metadata } from "next";
import type { PostMeta } from "./post-metadata";
import { ogTheme } from "./og-theme.mjs";

type SiteEnvironment = { [key: string]: string | undefined; SITE_URL?: string; SITE_INDEXABLE?: string; VERCEL_ENV?: string };

export function getSiteConfig(env: SiteEnvironment = process.env): { url: URL; indexable: boolean } {
  const hosted = env.VERCEL_ENV === "production" || env.VERCEL_ENV === "preview";
  if (hosted && !env.SITE_URL) throw new Error("SITE_URL is required for hosted builds");
  let url: URL;
  try { url = new URL(env.SITE_URL || "http://localhost:3000"); }
  catch { throw new Error("SITE_URL must be an absolute site URL"); }
  if (!["http:", "https:"].includes(url.protocol) || (hosted && url.protocol !== "https:") || url.username || url.password || url.pathname !== "/" || url.search || url.hash) {
    throw new Error("SITE_URL must be a root HTTPS URL without credentials, query or fragment");
  }
  return { url, indexable: env.VERCEL_ENV === "production" && env.SITE_INDEXABLE === "true" };
}

export function getPostMetadata(post: PostMeta, slug: string, env: SiteEnvironment = process.env): Metadata {
  const { url, indexable } = getSiteConfig(env);
  const canonical = new URL(`/blog/${encodeURIComponent(slug)}`, url).href;
  const images = [{ url: new URL(`/og/${encodeURIComponent(slug)}?v=${ogTheme.edition}`, url).href, width: 1200, height: 630, alt: `${post.title} — ${post.description}` }];
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical },
    robots: { index: indexable, follow: indexable },
    openGraph: { type: "article", locale: "ko_KR", siteName: "최호", title: post.title, description: post.description, url: canonical, publishedTime: `${post.date}T00:00:00+09:00`, images },
    twitter: { card: "summary_large_image", title: post.title, description: post.description, images },
  };
}

export function getSitemapEntries(posts: { slug: string; date: string; demo?: boolean }[], env: SiteEnvironment = process.env) {
  const { url, indexable } = getSiteConfig(env);
  if (!indexable) return [];
  return [
    { url: url.href },
    ...posts.filter(post => !post.demo && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(post.slug)).map(post => ({ url: new URL(`/blog/${post.slug}`, url).href })),
  ];
}
