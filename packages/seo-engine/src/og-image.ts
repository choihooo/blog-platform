import type { OgImagePayload, SeoSubject } from "./types.js";

export function createOgImagePayload(subject: SeoSubject): OgImagePayload {
  return {
    width: 1200,
    height: 630,
    title: subject.title || subject.site.siteName,
    siteName: subject.site.siteName,
    author: subject.author?.name,
    category: subject.category?.label,
    coverImage: subject.coverImage,
    fallback: !subject.coverImage,
  };
}
