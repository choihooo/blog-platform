import type { SeoAuthor, SeoSite, SeoSubject, SeoTaxonomy, SitemapEntry } from "./types.js";

type CreateSeoSubjectInput = {
  post: {
    path: string;
    status: "draft" | "published" | "archived";
    title?: string;
    slug?: string;
    excerpt?: string;
    coverImage?: string;
    author?: string;
    publishedAt?: string;
    updatedAt?: string;
    category?: string;
    tags?: string[];
    body: string;
  };
  site: SeoSite;
  author?: SeoAuthor;
  category?: SeoTaxonomy;
  tags?: SeoTaxonomy[];
  analysis?: {
    headings?: SeoSubject["headings"];
    toc?: SeoSubject["toc"];
    readingTime?: SeoSubject["readingTime"];
  };
};

export function trimSlash(value: string) {
  return value.replace(/\/+$/g, "");
}

export function publicPostUrl(site: SeoSite, slug: string) {
  return `${trimSlash(site.siteUrl)}/posts/${slug}`;
}

export function ogImageUrl(site: SeoSite, slug: string) {
  return `${trimSlash(site.siteUrl)}/og/${slug}`;
}

export function canonicalUrl(subject: Pick<SeoSubject, "site" | "slug" | "canonicalUrl">) {
  if (subject.canonicalUrl) return subject.canonicalUrl;
  return subject.slug ? publicPostUrl(subject.site, subject.slug) : trimSlash(subject.site.siteUrl);
}

export function createSeoSubject(input: CreateSeoSubjectInput): SeoSubject {
  const headings = input.analysis?.headings ?? [];
  const body = input.post.body ?? "";
  const imageAltTexts = [...body.matchAll(/!\[([^\]]*)\]\([^)]+\)/g)].map(
    (match) => match[1] ?? "",
  );
  const internalLinks = [...body.matchAll(/\[[^\]]+\]\((\/posts\/[^)]+)\)/g)].map(
    (match) => match[1] ?? "",
  );

  return {
    path: input.post.path,
    status: input.post.status,
    site: input.site,
    title: input.post.title,
    slug: input.post.slug,
    excerpt: input.post.excerpt,
    author: input.author,
    publishedAt: input.post.publishedAt,
    updatedAt: input.post.updatedAt,
    category: input.category,
    tags: input.tags ?? [],
    coverImage: input.post.coverImage,
    body,
    headings,
    toc: input.analysis?.toc ?? headings.map((item) => ({ ...item })),
    readingTime: input.analysis?.readingTime,
    imageAltTexts,
    internalLinks,
  };
}

export function homeEntry(site: SeoSite): SitemapEntry {
  return { loc: trimSlash(site.siteUrl) };
}
