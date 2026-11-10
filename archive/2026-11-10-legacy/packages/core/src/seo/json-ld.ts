import { canonicalUrl } from "./subject.js";
import type { SeoSubject } from "./types.js";

export function generateJsonLd(subject: SeoSubject) {
  if (subject.status !== "published" || !subject.slug || !subject.title) return [];
  const url = canonicalUrl(subject);
  const image = subject.coverImage
    ? new URL(subject.coverImage, `${subject.site.siteUrl}/`).toString()
    : `${subject.site.siteUrl.replace(/\/+$/g, "")}/og/${subject.slug}`;
  const data: unknown[] = [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: subject.title,
      description: subject.excerpt,
      url,
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
      datePublished: subject.publishedAt,
      dateModified: subject.updatedAt ?? subject.publishedAt,
      author: subject.author
        ? {
            "@type": "Person",
            "@id": subject.author.url ? `${subject.author.url}#person` : undefined,
            name: subject.author.name,
            url: subject.author.url,
            sameAs: subject.author.sameAs,
            image: subject.author.avatar
              ? new URL(subject.author.avatar, `${subject.site.siteUrl}/`).toString()
              : undefined,
          }
        : undefined,
      publisher: {
        "@type": "Organization",
        name: subject.site.siteName,
        url: subject.site.siteUrl,
      },
      image,
      keywords: subject.tags.map((tag) => tag.label).join(", "),
      articleSection: subject.category?.label,
    },
  ];
  data.push({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: subject.site.siteName, item: subject.site.siteUrl },
      { "@type": "ListItem", position: 2, name: subject.title, item: url },
    ],
  });
  return data;
}
