import type { OgImagePayload, SeoSubject } from "./types.js";
import { publicPostUrl } from "./subject.js";

export function createOgImagePayload(subject: SeoSubject): OgImagePayload {
  if (subject.status !== "published" || !subject.slug) {
    throw new Error("Cannot generate public OG image for non-published content");
  }
  return {
    width: 1200,
    height: 630,
    title: subject.title || subject.site.siteName,
    siteName: subject.site.siteName,
    author: subject.author?.name,
    category: subject.category?.label,
    coverImage: subject.coverImage,
    fallback: !subject.coverImage,
    publicPostUrl: publicPostUrl(subject.site, subject.slug),
  };
}
