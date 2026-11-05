import { canonicalUrl, ogImageUrl, publicPostUrl } from "./subject.js";
import type { PageMetadata, SeoSubject } from "./types.js";

export function metadataTitle(subject: SeoSubject) {
  return subject.seoTitle || subject.title || subject.site.siteName;
}

export function metadataDescription(subject: SeoSubject) {
  return (
    subject.seoDescription || subject.excerpt || subject.site.description || subject.site.siteName
  );
}

export function generatePageMetadata(subject: SeoSubject): PageMetadata {
  const title = metadataTitle(subject);
  const description = metadataDescription(subject);
  const canonical = canonicalUrl(subject);
  const image = subject.coverImage
    ? new URL(subject.coverImage, `${subject.site.siteUrl}/`).toString()
    : subject.slug
      ? ogImageUrl(subject.site, subject.slug)
      : `${subject.site.siteUrl.replace(/\/+$/g, "")}/brand/hozorica-card-v2.webp`;
  return {
    title,
    description,
    canonical,
    openGraph: {
      title,
      description,
      url: subject.slug ? publicPostUrl(subject.site, subject.slug) : canonical,
      type: subject.slug ? "article" : "website",
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}
